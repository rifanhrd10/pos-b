"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────

export type PosProduct = {
  id: string;
  name: string;
  image: string | null;
  basePrice: number;
  categoryId: string | null;
  categoryName: string | null;
  hasVariants: boolean;
  hasTopping: boolean;
  variants: { id: string; name: string; priceAdjustment: number }[];
  toppings: { id: string; name: string; price: number }[];
};

export type ShiftSummary = {
  shiftId: string;
  openedAt: Date;
  closedAt: Date | null;
  initialCash: number;
  closingCash: number | null;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  qrisRevenue: number;
  otherRevenue: number;
};

// ─── Private Helpers ──────────────────────────────────────────

async function recalculateOrderTotals(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  const business = await prisma.business.findUnique({
    where: { id: order.businessId },
    select: { taxRate: true, serviceRate: true },
  });

  const taxRate = business?.taxRate ?? 0;
  const serviceRate = business?.serviceRate ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const serviceAmount = subtotal * (serviceRate / 100);
  const totalAmount =
    subtotal + taxAmount + serviceAmount - order.discountAmount;

  await prisma.order.update({
    where: { id: orderId },
    data: { subtotal, taxAmount, serviceAmount, totalAmount },
  });
}

// ─── Employee & PIN ────────────────────────────────────────────

export async function getEmployeeByUserId(userId: string) {
  return prisma.employee.findFirst({
    where: { userId, isActive: true },
    include: {
      role: true,
      outlets: {
        include: { outlet: true },
      },
    },
  });
}

export async function getAssignedOutlets(employeeId: string) {
  const rows = await prisma.employeeOutlet.findMany({
    where: { employeeId },
    include: { outlet: true },
  });
  return rows.map((r) => r.outlet);
}

export async function verifyPin(
  employeeId: string,
  pin: string
): Promise<{ ok: boolean; error?: string }> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { pin: true },
  });
  if (!employee) return { ok: false, error: "Karyawan tidak ditemukan" };
  if (!employee.pin) return { ok: false, error: "PIN belum diatur" };

  const valid = await bcrypt.compare(pin, employee.pin);
  if (!valid) return { ok: false, error: "PIN salah" };
  return { ok: true };
}

// ─── CashierSession ────────────────────────────────────────────

export async function getActiveSession(
  employeeId: string,
  outletId: string
) {
  return prisma.cashierSession.findFirst({
    where: { employeeId, outletId, isOpen: true },
  });
}

export async function openSession(data: {
  employeeId: string;
  outletId: string;
  businessId: string;
  initialCash: number;
}): Promise<{ session?: unknown; error?: string }> {
  const existing = await prisma.cashierSession.findFirst({
    where: {
      employeeId: data.employeeId,
      outletId: data.outletId,
      isOpen: true,
    },
  });
  if (existing) return { error: "Sesi kasir sudah aktif" };

  const session = await prisma.cashierSession.create({
    data: {
      businessId: data.businessId,
      outletId: data.outletId,
      employeeId: data.employeeId,
      initialCash: data.initialCash,
      isOpen: true,
    },
  });
  return { session };
}

export async function closeSession(
  sessionId: string,
  data: { closingCash: number; note?: string }
): Promise<{ ok: boolean; summary?: ShiftSummary; error?: string }> {
  const session = await prisma.cashierSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) return { ok: false, error: "Sesi tidak ditemukan" };
  if (!session.isOpen) return { ok: false, error: "Sesi sudah ditutup" };

  await prisma.cashierSession.update({
    where: { id: sessionId },
    data: {
      isOpen: false,
      closedAt: new Date(),
      closingCash: data.closingCash,
      note: data.note,
    },
  });

  const summary = await getShiftSummary(sessionId);
  return { ok: true, summary };
}

// ─── Tables ────────────────────────────────────────────────────

export async function getTables(outletId: string) {
  return prisma.table.findMany({
    where: { outletId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTableStatuses(outletId: string) {
  const tables = await prisma.table.findMany({
    where: { outletId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const results = await Promise.all(
    tables.map(async (table) => {
      const activeOrder = await prisma.order.findFirst({
        where: {
          tableId: table.id,
          status: { in: ["ACTIVE", "DRAFT"] },
        },
        select: { id: true, status: true },
      });

      type TableStatus = "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED";
      let status: TableStatus = "AVAILABLE";
      if (activeOrder) {
        status = "OCCUPIED";
      }

      return {
        tableId: table.id,
        tableName: table.name,
        status,
        orderId: activeOrder?.id ?? null,
      };
    })
  );

  return results;
}

// ─── Orders ────────────────────────────────────────────────────

async function generateOrderNumber(outletId: string): Promise<string> {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");

  const startOfDay = new Date(today.toISOString().slice(0, 10) + "T00:00:00.000Z");
  const endOfDay = new Date(today.toISOString().slice(0, 10) + "T23:59:59.999Z");

  const count = await prisma.order.count({
    where: {
      outletId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `TRX-${yyyymmdd}-${seq}`;
}

export async function getOrCreateDraftOrder(data: {
  businessId: string;
  outletId: string;
  employeeId: string;
  sessionId: string;
  tableId?: string;
  orderType: "DINE_IN" | "TAKEAWAY";
}): Promise<{ order?: unknown; error?: string }> {
  // If tableId provided, check for existing DRAFT/ACTIVE order on this table
  if (data.tableId) {
    const existing = await prisma.order.findFirst({
      where: {
        tableId: data.tableId,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
      include: {
        items: {
          include: {
            toppings: true,
          },
        },
        payment: true,
      },
    });
    if (existing) return { order: existing };
  }

  const orderNumber = await generateOrderNumber(data.outletId);

  const order = await prisma.order.create({
    data: {
      businessId: data.businessId,
      outletId: data.outletId,
      employeeId: data.employeeId,
      cashierSessionId: data.sessionId,
      tableId: data.tableId,
      orderNumber,
      orderType: data.orderType,
      status: "DRAFT",
    },
    include: {
      items: {
        include: {
          toppings: true,
        },
      },
      payment: true,
    },
  });

  return { order };
}

export async function getOrderWithItems(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          toppings: true,
          variant: { select: { id: true, name: true } },
        },
      },
      payment: true,
      promos: {
        include: {
          promo: true,
        },
      },
      customer: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function addOrderItem(
  orderId: string,
  item: {
    productId: string;
    variantId?: string;
    toppingIds?: string[];
    quantity: number;
    notes?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    select: { id: true, name: true, basePrice: true },
  });
  if (!product) return { ok: false, error: "Produk tidak ditemukan" };

  let variantName: string | undefined;
  let priceAdjustment = 0;

  if (item.variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { id: true, name: true, priceAdjustment: true },
    });
    if (!variant) return { ok: false, error: "Varian tidak ditemukan" };
    variantName = variant.name;
    priceAdjustment = variant.priceAdjustment;
  }

  const price = product.basePrice + priceAdjustment;
  const subtotal = price * item.quantity;

  let toppings: { id: string; name: string; price: number }[] = [];
  if (item.toppingIds && item.toppingIds.length > 0) {
    const fetchedToppings = await prisma.productTopping.findMany({
      where: { id: { in: item.toppingIds } },
      select: { id: true, name: true, price: true },
    });
    toppings = fetchedToppings;
  }

  await prisma.orderItem.create({
    data: {
      orderId,
      productId: item.productId,
      variantId: item.variantId,
      name: product.name,
      variantName: variantName ?? null,
      price,
      quantity: item.quantity,
      subtotal,
      notes: item.notes,
      toppings: {
        create: toppings.map((t) => ({
          toppingId: t.id,
          name: t.name,
          price: t.price,
        })),
      },
    },
  });

  await recalculateOrderTotals(orderId);
  return { ok: true };
}

export async function updateOrderItemQty(
  orderItemId: string,
  quantity: number
): Promise<{ ok: boolean; error?: string }> {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    select: { orderId: true, price: true },
  });
  if (!orderItem) return { ok: false, error: "Item tidak ditemukan" };

  if (quantity <= 0) {
    await prisma.orderItem.delete({ where: { id: orderItemId } });
  } else {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        quantity,
        subtotal: orderItem.price * quantity,
      },
    });
  }

  await recalculateOrderTotals(orderItem.orderId);
  return { ok: true };
}

export async function removeOrderItem(
  orderItemId: string
): Promise<{ ok: boolean }> {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    select: { orderId: true },
  });
  if (!orderItem) return { ok: false };

  await prisma.orderItem.delete({ where: { id: orderItemId } });
  await recalculateOrderTotals(orderItem.orderId);
  return { ok: true };
}

export async function voidOrder(
  orderId: string,
  reason: string,
  pin: string,
  employeeId: string
): Promise<{ ok: boolean; error?: string }> {
  const pinResult = await verifyPin(employeeId, pin);
  if (!pinResult.ok) return { ok: false, error: pinResult.error };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order tidak ditemukan" };
  if (order.status === "PAID") return { ok: false, error: "Order sudah dibayar, tidak bisa di-void" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "VOID", voidReason: reason },
  });

  return { ok: true };
}

// ─── Payment ───────────────────────────────────────────────────

export async function processPayment(data: {
  orderId: string;
  employeeId: string;
  method: "CASH" | "QRIS" | "BANK_TRANSFER";
  cashEntered?: number;
  referenceNo?: string;
  paymentMethodId?: string;
}): Promise<{ payment?: unknown; qrUrl?: string; externalId?: string; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        businessId: true,
        outletId: true,
        orderNumber: true,
      },
    });
    if (!order) return { error: "Order tidak ditemukan" };
    if (order.status !== "DRAFT" && order.status !== "ACTIVE") {
      return { error: "Order tidak dalam status yang bisa dibayar" };
    }

    // CASH: Mark as PAID immediately
    if (data.method === "CASH") {
      if (!data.cashEntered || data.cashEntered < order.totalAmount) {
        return { error: "Uang yang diterima kurang" };
      }

      const changeAmount = data.cashEntered - order.totalAmount;

      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          businessId: order.businessId,
          outletId: order.outletId,
          employeeId: data.employeeId,
          method: data.method,
          totalAmount: order.totalAmount,
          cashEntered: data.cashEntered,
          changeAmount,
          referenceNo: data.referenceNo,
          status: "PAID",
        },
      });

      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: "PAID", paidAt: new Date() },
      });

      return { payment };
    }

    // QRIS with paymentMethodId
    if (data.method === "QRIS" && data.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: data.paymentMethodId },
        select: { provider: true, apiKey: true, apiSecret: true, qrisImage: true },
      });

      // Gateway-based QRIS Dynamic (MIDTRANS or XENDIT)
      if (
        paymentMethod?.apiKey &&
        paymentMethod.provider &&
        paymentMethod.provider !== "CUSTOM"
      ) {
        const { createMidtransTransaction, createXenditInvoice } = await import(
          "@/lib/payment-gateway"
        );

        const business = await prisma.business.findUnique({
          where: { id: order.businessId },
          select: { email: true, name: true },
        });

        const customerEmail = business?.email ?? "pos@bayaro.id";
        const customerName = business?.name ?? "POS";

        let result;
        if (paymentMethod.provider === "MIDTRANS") {
          result = await createMidtransTransaction({
            provider: "MIDTRANS",
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            customerName,
            customerEmail,
            apiKey: paymentMethod.apiKey,
            apiSecret: paymentMethod.apiSecret ?? undefined,
            sandbox: true,
          });
        } else if (paymentMethod.provider === "XENDIT") {
          result = await createXenditInvoice({
            provider: "XENDIT",
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            customerName,
            customerEmail,
            apiKey: paymentMethod.apiKey,
            apiSecret: paymentMethod.apiSecret ?? undefined,
            sandbox: true,
          });
        } else {
          return { error: "Provider tidak didukung" };
        }

        const payment = await prisma.payment.create({
          data: {
            orderId: data.orderId,
            businessId: order.businessId,
            outletId: order.outletId,
            employeeId: data.employeeId,
            method: data.method,
            totalAmount: order.totalAmount,
            referenceNo: data.referenceNo,
            status: "PENDING",
            externalId: result.externalId,
            qrUrl: result.qrUrl,
          },
        });

        // Do NOT mark Order as PAID yet — webhook will update it
        return { payment, qrUrl: result.qrUrl, externalId: result.externalId };
      }

      // QRIS Static (CUSTOM provider or no API key)
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          businessId: order.businessId,
          outletId: order.outletId,
          employeeId: data.employeeId,
          method: data.method,
          totalAmount: order.totalAmount,
          referenceNo: data.referenceNo,
          status: "PENDING",
          qrUrl: paymentMethod?.qrisImage ?? undefined,
        },
      });

      // Do NOT mark Order as PAID yet
      return { payment, qrUrl: paymentMethod?.qrisImage ?? undefined };
    }

    // BANK_TRANSFER or QRIS without paymentMethodId
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        businessId: order.businessId,
        outletId: order.outletId,
        employeeId: data.employeeId,
        method: data.method,
        totalAmount: order.totalAmount,
        referenceNo: data.referenceNo,
        status: "PENDING",
      },
    });

    // Do NOT mark Order as PAID yet
    return { payment };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Gagal memproses pembayaran: ${message}` };
  }
}

export async function confirmQrisPayment(
  paymentId: string,
  employeeId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { orderId: true, status: true, employeeId: true },
    });

    if (!payment) return { ok: false, error: "Payment tidak ditemukan" };
    if (payment.status === "PAID") return { ok: false, error: "Payment sudah dibayar" };

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID" },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paidAt: new Date() },
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Gagal konfirmasi payment: ${message}` };
  }
}

export async function checkPaymentStatus(
  paymentId: string
): Promise<{ status: string; error?: string }> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { status: true },
    });

    if (!payment) return { status: "NOT_FOUND", error: "Payment tidak ditemukan" };
    return { status: payment.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: "ERROR", error: message };
  }
}

// ─── Products for POS ─────────────────────────────────────────

export async function getPosProducts(
  businessId: string
): Promise<PosProduct[]> {
  const products = await prisma.product.findMany({
    where: { businessId, isActive: true },
    include: {
      category: { select: { id: true, name: true } },
      variants: {
        where: { isActive: true },
        select: { id: true, name: true, priceAdjustment: true },
        orderBy: { sortOrder: "asc" },
      },
      toppings: {
        where: { isActive: true },
        select: { id: true, name: true, price: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image ?? null,
    basePrice: p.basePrice,
    categoryId: p.categoryId ?? null,
    categoryName: p.category?.name ?? null,
    hasVariants: p.variants.length > 0,
    hasTopping: p.toppings.length > 0,
    variants: p.variants,
    toppings: p.toppings,
  }));
}

export async function getPosCategories(businessId: string) {
  return prisma.category.findMany({
    where: { businessId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

// ─── Laporan ──────────────────────────────────────────────────

export async function getShiftSummary(
  sessionId: string
): Promise<ShiftSummary> {
  const session = await prisma.cashierSession.findUnique({
    where: { id: sessionId },
    include: {
      orders: {
        where: { status: "PAID" },
        include: { payment: true },
      },
    },
  });

  if (!session) {
    throw new Error("Sesi tidak ditemukan");
  }

  const paidOrders = session.orders;
  const totalOrders = paidOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  let cashRevenue = 0;
  let qrisRevenue = 0;
  let otherRevenue = 0;

  for (const order of paidOrders) {
    if (!order.payment) continue;
    const method = order.payment.method.toUpperCase();
    if (method === "CASH") cashRevenue += order.totalAmount;
    else if (method === "QRIS") qrisRevenue += order.totalAmount;
    else otherRevenue += order.totalAmount;
  }

  return {
    shiftId: session.id,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
    initialCash: session.initialCash,
    closingCash: session.closingCash,
    totalOrders,
    totalRevenue,
    cashRevenue,
    qrisRevenue,
    otherRevenue,
  };
}

export async function getShiftOrders(sessionId: string) {
  return prisma.order.findMany({
    where: { cashierSessionId: sessionId, status: "PAID" },
    include: {
      items: {
        include: {
          toppings: true,
        },
      },
      payment: true,
    },
    orderBy: { paidAt: "desc" },
  });
}

export async function getHourlyStats(
  sessionId: string
): Promise<{ hour: number; count: number; total: number }[]> {
  const orders = await prisma.order.findMany({
    where: { cashierSessionId: sessionId, status: "PAID" },
    select: { paidAt: true, totalAmount: true },
  });

  const hourMap = new Map<number, { count: number; total: number }>();

  for (const order of orders) {
    if (!order.paidAt) continue;
    const hour = new Date(order.paidAt).getHours();
    const existing = hourMap.get(hour) ?? { count: 0, total: 0 };
    hourMap.set(hour, {
      count: existing.count + 1,
      total: existing.total + order.totalAmount,
    });
  }

  const result: { hour: number; count: number; total: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const data = hourMap.get(h) ?? { count: 0, total: 0 };
    result.push({ hour: h, ...data });
  }

  return result;
}

export async function getPaymentMethods(businessId: string) {
  return prisma.paymentMethod.findMany({
    where: { businessId, isEnabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── PIN + Outlet Selector Actions ────────────────────────────

export async function submitPinAndGetRedirect(
  employeeId: string,
  pin: string
): Promise<{ ok: boolean; redirectTo?: string; error?: string }> {
  const result = await verifyPin(employeeId, pin);
  if (!result.ok) return { ok: false, error: result.error };

  const { setKasirEmployeeCookie, setKasirOutletCookie } = await import("@/lib/outlet-context");
  await setKasirEmployeeCookie(employeeId);

  const outlets = await getAssignedOutlets(employeeId);
  if (outlets.length === 1) {
    await setKasirOutletCookie(outlets[0].id);
    return { ok: true, redirectTo: "/kasir/pos" };
  }
  return { ok: true, redirectTo: "/kasir/outlet" };
}

export async function selectKasirOutlet(
  outletId: string
): Promise<{ ok: boolean; redirectTo?: string; error?: string }> {
  const { setKasirOutletCookie } = await import("@/lib/outlet-context");
  await setKasirOutletCookie(outletId);
  return { ok: true, redirectTo: "/kasir/pos" };
}
