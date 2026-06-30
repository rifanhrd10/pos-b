import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { decimalToNumber } from "@/lib/utils";

function createTransactionNumber() {
  return `BYR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Payload checkout tidak valid." }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const outlet = await tx.outlet.findUnique({ where: { id: data.outletId } });
      if (!outlet || outlet.deletedAt) throw new Error("Outlet tidak ditemukan.");

      const cashier = await tx.user.findUnique({ where: { id: data.cashierId }, include: { role: true } });
      if (!cashier || !cashier.isActive) throw new Error("Kasir tidak valid.");

      if (data.shiftId) {
        const shift = await tx.shift.findUnique({ where: { id: data.shiftId } });
        if (!shift || shift.status !== "OPEN") throw new Error("Shift kasir harus OPEN saat checkout.");
      }

      const paymentMethods = await tx.paymentMethod.findMany({
        where: { id: { in: data.payments.map((payment) => payment.paymentMethodId) } },
      });

      let subtotal = 0;
      const itemPayloads: {
        productId: string;
        quantity: number;
        basePrice: number;
        modifierTotal: number;
        subtotal: number;
        productNameSnapshot: string;
        productImageSnapshot: string;
        skuSnapshot: string;
        note?: string | null;
        modifiers: { modifierId: string; name: string; price: number; quantity: number; subtotal: number }[];
      }[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            images: { where: { deletedAt: null, isPrimary: true }, take: 1 },
            modifierGroups: {
              include: {
                modifierGroup: {
                  include: {
                    modifiers: {
                      where: { deletedAt: null, isActive: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!product || product.deletedAt || !product.isActive) throw new Error("Produk tidak ditemukan atau nonaktif.");
        if (product.isStockTracked && product.stock < item.quantity) {
          throw new Error(`Stok produk ${product.name} tidak cukup.`);
        }

        const productGroupMap = new Map(
          product.modifierGroups.map((group) => [
            group.modifierGroup.id,
            {
              minSelect: group.modifierGroup.minSelect,
              maxSelect: group.modifierGroup.maxSelect,
              modifierIds: group.modifierGroup.modifiers.map((modifier) => modifier.id),
              name: group.modifierGroup.name,
            },
          ]),
        );

        const modifiers = [];
        let modifierTotal = 0;
        const groupedSelections = new Map<string, string[]>();
        for (const selected of item.modifiers) {
          const modifier = await tx.modifier.findUnique({ where: { id: selected.modifierId } });
          if (!modifier || modifier.deletedAt || !modifier.isActive) throw new Error("Modifier tidak ditemukan.");
          const groupRule = productGroupMap.get(modifier.modifierGroupId);
          if (!groupRule) {
            throw new Error(`Topping ${modifier.name} tidak terhubung ke produk ${product.name}.`);
          }
          if (!groupRule.modifierIds.includes(modifier.id)) {
            throw new Error(`Topping ${modifier.name} tidak valid untuk produk ${product.name}.`);
          }
          groupedSelections.set(modifier.modifierGroupId, [...(groupedSelections.get(modifier.modifierGroupId) || []), modifier.id]);
          if (modifier.isStockTracked && (modifier.stock || 0) < selected.quantity) {
            throw new Error(`Stok topping ${modifier.name} tidak cukup.`);
          }
          const price = decimalToNumber(modifier.price);
          const modSubtotal = price * selected.quantity;
          modifierTotal += modSubtotal;
          modifiers.push({
            modifierId: modifier.id,
            name: modifier.name,
            price,
            quantity: selected.quantity,
            subtotal: modSubtotal,
          });
        }

        for (const [groupId, groupRule] of productGroupMap.entries()) {
          const selectedIds = groupedSelections.get(groupId) || [];
          if (selectedIds.length < groupRule.minSelect) {
            throw new Error(`Grup topping ${groupRule.name} minimal pilih ${groupRule.minSelect}.`);
          }
          if (selectedIds.length > groupRule.maxSelect) {
            throw new Error(`Grup topping ${groupRule.name} maksimal pilih ${groupRule.maxSelect}.`);
          }
        }

        const basePrice = decimalToNumber(product.sellPrice);
        const itemSubtotal = (basePrice + modifierTotal) * item.quantity;
        subtotal += itemSubtotal;

        itemPayloads.push({
          productId: product.id,
          quantity: item.quantity,
          basePrice,
          modifierTotal,
          subtotal: itemSubtotal,
          productNameSnapshot: product.name,
          productImageSnapshot: product.images[0]?.imageUrl || product.imageUrl || "/images/products/product-placeholder.svg",
          skuSnapshot: product.sku,
          note: item.note,
          modifiers,
        });
      }

      const taxTotal = (subtotal - data.discountTotal) * (decimalToNumber(outlet.taxRate) / 100);
      const serviceChargeTotal = (subtotal - data.discountTotal) * (decimalToNumber(outlet.serviceChargeRate) / 100);
      const grandTotal = subtotal - data.discountTotal + taxTotal + serviceChargeTotal;
      const paidTotal = data.payments.reduce((sum, payment) => sum + payment.amount, 0);

      if (paidTotal < grandTotal) {
        throw new Error("Nominal pembayaran belum mencukupi grand total.");
      }

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber: createTransactionNumber(),
          outletId: data.outletId,
          cashierId: data.cashierId,
          customerId: data.customerId || null,
          shiftId: data.shiftId || null,
          subtotal,
          discountTotal: data.discountTotal,
          taxTotal,
          serviceChargeTotal,
          grandTotal,
          paidTotal,
          changeTotal: paidTotal - grandTotal,
          status: "PAID",
        },
      });

      for (const item of itemPayloads) {
        const createdItem = await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            productImageSnapshot: item.productImageSnapshot,
            skuSnapshot: item.skuSnapshot,
            quantity: item.quantity,
            basePrice: item.basePrice,
            modifierTotal: item.modifierTotal,
            discountTotal: 0,
            subtotal: item.subtotal,
            note: item.note,
          },
        });

        for (const modifier of item.modifiers) {
          await tx.transactionItemModifier.create({
            data: {
              transactionItemId: createdItem.id,
              modifierId: modifier.modifierId,
              modifierNameSnapshot: modifier.name,
              priceSnapshot: modifier.price,
              quantity: modifier.quantity,
              subtotal: modifier.subtotal,
            },
          });

          const sourceModifier = await tx.modifier.findUnique({ where: { id: modifier.modifierId } });
          if (sourceModifier?.isStockTracked) {
            const beforeStock = sourceModifier.stock || 0;
            const afterStock = beforeStock - modifier.quantity;
            await tx.modifier.update({
              where: { id: sourceModifier.id },
              data: { stock: afterStock },
            });
            await tx.stockMovement.create({
              data: {
                outletId: data.outletId,
                modifierId: sourceModifier.id,
                type: "SALE",
                quantity: modifier.quantity,
                beforeStock,
                afterStock,
                referenceType: "TRANSACTION",
                referenceId: transaction.id,
                note: `Checkout ${transaction.transactionNumber}`,
              },
            });
          }
        }

        const sourceProduct = await tx.product.findUnique({ where: { id: item.productId } });
        if (sourceProduct?.isStockTracked) {
          const beforeStock = sourceProduct.stock;
          const afterStock = beforeStock - item.quantity;
          await tx.product.update({
            where: { id: sourceProduct.id },
            data: { stock: afterStock },
          });
          await tx.stockMovement.create({
            data: {
              outletId: data.outletId,
              productId: sourceProduct.id,
              type: "SALE",
              quantity: item.quantity,
              beforeStock,
              afterStock,
              referenceType: "TRANSACTION",
              referenceId: transaction.id,
              note: `Checkout ${transaction.transactionNumber}`,
            },
          });
        }
      }

      await tx.transactionPayment.createMany({
        data: data.payments.map((payment) => ({
          transactionId: transaction.id,
          paymentMethodId: payment.paymentMethodId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber || null,
          status: "PAID",
        })),
      });

      return transaction;
    });

    return NextResponse.json({
      id: result.id,
      transactionNumber: result.transactionNumber,
      message: "Checkout berhasil.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout gagal.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
