import { PaymentMethodType, Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { MobileAuthContext } from "@/lib/mobile-auth";
import { requireOutlet } from "@/lib/mobile-auth";
import { MobileApiError } from "@/lib/mobile-api";
import { prisma } from "@/lib/prisma";

const money = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const priceAdjustment = z.number().int().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER);

const orderItemVariantSchema = z.object({
  masterVariantId: z.string().min(1).max(200).nullable().optional(),
  groupId: z.string().min(1).max(200).nullable().optional(),
  masterVariantOptionId: z.string().min(1).max(200).nullable().optional(),
  optionId: z.string().min(1).max(200).nullable().optional(),
  groupName: z.string().min(1).max(200),
  optionName: z.string().min(1).max(200),
  priceAdjustment,
});

const orderItemToppingSchema = z.object({
  toppingId: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  price: money,
});

const orderItemSchema = z.object({
  id: z.string().min(1).max(200),
  orderId: z.string().min(1).max(200),
  productId: z.string().min(1).max(200),
  productName: z.string().min(1).max(300),
  variantId: z.string().min(1).max(200).nullable().optional(),
  variantName: z.string().max(200).nullable().optional(),
  quantity: z.number().int().positive().max(100_000),
  unitPrice: money,
  notes: z.string().max(1000).nullable().optional(),
  subtotal: money,
  variants: z.array(orderItemVariantSchema).max(20).default([]),
  variantSelections: z.array(orderItemVariantSchema).max(20).optional(),
  toppings: z.array(orderItemToppingSchema).max(50).default([]),
});

export const offlineOrderPayloadSchema = z.object({
  order: z.object({
    id: z.string().min(1).max(200),
    outletId: z.string().min(1).max(200),
    employeeId: z.string().min(1).max(200),
    customerId: z.string().min(1).max(200).nullable().optional(),
    tableId: z.string().min(1).max(200).nullable().optional(),
    orderType: z.enum(["DINE_IN", "TAKEAWAY"]),
    subtotal: money,
    discountAmount: money,
    taxAmount: money,
    serviceAmount: money,
    totalAmount: money,
    paymentMethod: z.string().nullable().optional(),
    paymentStatus: z.string().nullable().optional(),
    createdAt: z.number().int().positive(),
  }),
  items: z.array(orderItemSchema).min(1).max(500),
  payment: z.object({
    methodId: z.string().min(1).max(200).nullable().optional(),
    method: z.string().min(1).max(80),
    cashEntered: money.nullable().optional(),
    changeAmount: money.nullable().optional(),
  }).optional(),
  idempotencyKey: z.string().min(1).max(200),
});

export type OfflineOrderPayload = z.infer<typeof offlineOrderPayloadSchema>;
type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

function orderNumber(orderId: string) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase().padStart(8, "0");
  return `TRX-${date}-${suffix}`;
}

export async function createOfflineCashOrder(
  context: MobileAuthContext,
  payload: OfflineOrderPayload
) {
  const { order, items } = payload;
  requireOutlet(context, order.outletId);

  if (payload.idempotencyKey !== order.id || items.some((item) => item.orderId !== order.id)) {
    throw new MobileApiError(422, "INVALID_ORDER_REFERENCE", "Referensi idempotensi atau item order tidak konsisten");
  }
  const requestedMethod = (payload.payment?.method ?? order.paymentMethod ?? "").toUpperCase();
  if (!requestedMethod || order.paymentStatus !== "PAID") {
    throw new MobileApiError(422, "PAYMENT_NOT_PAID", "Pembayaran transaksi belum valid");
  }

  const computedSubtotal = items.reduce((sum, item) => {
    if (item.subtotal !== item.unitPrice * item.quantity) {
      throw new MobileApiError(422, "INVALID_ITEM_TOTAL", `Subtotal item ${item.id} tidak sesuai`);
    }
    return sum + item.subtotal;
  }, 0);
  const computedTotal = computedSubtotal + order.taxAmount + order.serviceAmount - order.discountAmount;
  if (
    computedSubtotal !== order.subtotal ||
    order.discountAmount > computedSubtotal ||
    computedTotal !== order.totalAmount
  ) {
    throw new MobileApiError(422, "INVALID_ORDER_TOTAL", "Total order tidak konsisten");
  }

  const existing = await prisma.order.findUnique({ where: { id: order.id } });
  if (existing) {
    if (existing.businessId !== context.businessId) {
      throw new MobileApiError(409, "ORDER_ID_CONFLICT", "ID order telah digunakan");
    }
    return { orderId: existing.id, orderNumber: existing.orderNumber };
  }

  return prisma.$transaction(async (tx) => {
    await validateReferences(tx, context, payload);
    const method = await resolvePaymentMethod(tx, context, payload);
    const officialNumber = orderNumber(order.id);
    const paidAt = new Date();
    const orderCreatedAt = new Date(order.createdAt);
    const cashierSession = await tx.cashierSession.findFirst({
      where: {
        businessId: context.businessId,
        outletId: order.outletId,
        employeeId: order.employeeId,
        openedAt: { lte: orderCreatedAt },
        OR: [
          { isOpen: true },
          { closedAt: { gte: orderCreatedAt } },
        ],
      },
      orderBy: { openedAt: "desc" },
      select: { id: true },
    });

    await tx.order.create({
      data: {
        id: order.id,
        businessId: context.businessId,
        outletId: order.outletId,
        employeeId: order.employeeId,
        cashierSessionId: cashierSession?.id ?? null,
        customerId: order.customerId ?? null,
        tableId: order.tableId ?? null,
        orderNumber: officialNumber,
        status: "PAID",
        orderType: order.orderType,
        subtotal: computedSubtotal,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        serviceAmount: order.serviceAmount,
        totalAmount: computedTotal,
        paidAt,
        createdAt: orderCreatedAt,
        items: {
          create: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
            name: item.productName,
            variantName: item.variantName ?? null,
            price: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
            notes: item.notes ?? null,
            variants: variantsForItem(item).length > 0
              ? {
                  create: variantsForItem(item).map((variant) => ({
                    masterVariantId: variant.masterVariantId ?? variant.groupId ?? null,
                    masterVariantOptionId: variant.masterVariantOptionId ?? variant.optionId ?? null,
                    groupName: variant.groupName,
                    optionName: variant.optionName,
                    priceAdjustment: variant.priceAdjustment,
                  })),
                }
              : undefined,
            toppings: item.toppings.length > 0
              ? {
                  create: item.toppings.map((topping) => ({
                    toppingId: topping.toppingId,
                    name: topping.name,
                    price: topping.price,
                  })),
                }
              : undefined,
          })),
        },
        payment: {
          create: {
            businessId: context.businessId,
            outletId: order.outletId,
            employeeId: order.employeeId,
            method: method.type,
            totalAmount: computedTotal,
            cashEntered: method.cashEntered,
            changeAmount: method.changeAmount,
            status: "PAID",
            paidAt,
          },
        },
      },
    });

    for (const item of items) {
      const stock = await tx.stock.findFirst({
        where: {
          outletId: order.outletId,
          productId: item.productId,
          variantId: item.variantId ?? null,
        },
      });
      if (!stock) continue;
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          quantity: { decrement: item.quantity },
          movements: {
            create: {
              type: "OUT",
              quantity: -item.quantity,
              note: `Penjualan offline ${officialNumber}`,
              reference: order.id,
              createdBy: order.employeeId,
            },
          },
        },
      });
    }

    return { orderId: order.id, orderNumber: officialNumber };
  });
}

async function resolvePaymentMethod(
  tx: TransactionClient,
  context: MobileAuthContext,
  payload: OfflineOrderPayload
) {
  const requestedType = (payload.payment?.method ?? payload.order.paymentMethod ?? "").toUpperCase();
  if (!Object.values(PaymentMethodType).includes(requestedType as PaymentMethodType)) {
    throw new MobileApiError(422, "PAYMENT_METHOD_INVALID", "Metode pembayaran tidak valid");
  }
  const methodId = payload.payment?.methodId ?? null;
  const method = await tx.paymentMethod.findFirst({
    where: {
      businessId: context.businessId,
      isEnabled: true,
      ...(methodId ? { id: methodId } : { type: requestedType as PaymentMethodType }),
    },
    select: { id: true, type: true },
  });
  if (!method || method.type !== requestedType) {
    throw new MobileApiError(422, "PAYMENT_METHOD_DISABLED", "Metode pembayaran tidak aktif pada admin panel");
  }

  if (method.type === "CASH") {
    const cashEntered = payload.payment?.cashEntered ?? payload.order.totalAmount;
    if (cashEntered < payload.order.totalAmount) {
      throw new MobileApiError(422, "CASH_ENTERED_TOO_LOW", "Nominal uang diterima kurang dari total transaksi");
    }
    return {
      type: method.type,
      cashEntered,
      changeAmount: cashEntered - payload.order.totalAmount,
    };
  }

  return {
    type: method.type,
    cashEntered: null,
    changeAmount: null,
  };
}

async function validateReferences(
  tx: TransactionClient,
  context: MobileAuthContext,
  payload: OfflineOrderPayload
) {
  const cashier = await tx.employee.findFirst({
    where: {
      id: payload.order.employeeId,
      businessId: context.businessId,
      isActive: true,
      role: { permissions: { has: "pos.access" } },
      outlets: { some: { outletId: payload.order.outletId } },
    },
    select: { id: true },
  });
  if (!cashier) {
    throw new MobileApiError(422, "CASHIER_NOT_FOUND", "Kasir transaksi tidak aktif pada outlet ini");
  }

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const products = await tx.product.findMany({
    where: { businessId: context.businessId, id: { in: productIds } },
    include: {
      variants: { select: { id: true } },
      variantGroups: {
        include: {
          masterVariant: {
            include: { options: { select: { id: true } } },
          },
        },
      },
      toppings: { select: { id: true } },
    },
  });
  if (products.length !== productIds.length) {
    throw new MobileApiError(422, "PRODUCT_NOT_FOUND", "Satu atau lebih produk tidak ditemukan pada bisnis ini");
  }
  const productsById = new Map(products.map((product) => [product.id, product]));
  for (const item of payload.items) {
    if (item.variantId && !productsById.get(item.productId)?.variants.some((variant) => variant.id === item.variantId)) {
      throw new MobileApiError(422, "VARIANT_NOT_FOUND", `Varian produk ${item.productName} tidak valid`);
    }
    const product = productsById.get(item.productId);
    const validGroupIds = new Set(product?.variantGroups.map((group) => group.masterVariantId) ?? []);
    const validOptionIds = new Set(product?.variantGroups.flatMap((group) => group.masterVariant.options.map((option) => option.id)) ?? []);
    for (const variant of variantsForItem(item)) {
      const groupId = variant.masterVariantId ?? variant.groupId ?? null;
      const optionId = variant.masterVariantOptionId ?? variant.optionId ?? null;
      if (groupId && !validGroupIds.has(groupId)) {
        throw new MobileApiError(422, "VARIANT_GROUP_NOT_FOUND", `Grup varian ${variant.groupName} tidak valid untuk produk ${item.productName}`);
      }
      if (optionId && !validOptionIds.has(optionId)) {
        throw new MobileApiError(422, "VARIANT_OPTION_NOT_FOUND", `Opsi varian ${variant.optionName} tidak valid untuk produk ${item.productName}`);
      }
    }
    const validToppingIds = new Set(product?.toppings.map((topping) => topping.id) ?? []);
    for (const topping of item.toppings) {
      if (!validToppingIds.has(topping.toppingId)) {
        throw new MobileApiError(422, "TOPPING_NOT_FOUND", `Topping ${topping.name} tidak valid untuk produk ${item.productName}`);
      }
    }
  }

  if (payload.order.customerId) {
    const customer = await tx.customer.findFirst({
      where: { id: payload.order.customerId, businessId: context.businessId },
      select: { id: true },
    });
    if (!customer) throw new MobileApiError(422, "CUSTOMER_NOT_FOUND", "Pelanggan tidak ditemukan");
  }
  if (payload.order.tableId) {
    const table = await tx.table.findFirst({
      where: { id: payload.order.tableId, outletId: payload.order.outletId, businessId: context.businessId },
      select: { id: true },
    });
    if (!table) throw new MobileApiError(422, "TABLE_NOT_FOUND", "Meja tidak ditemukan pada outlet ini");
  }
}

export function asInputJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function variantsForItem(item: z.infer<typeof orderItemSchema>) {
  return item.variants.length > 0 ? item.variants : item.variantSelections ?? [];
}
