import type { MobileAuthContext } from "@/lib/mobile-auth";
import { MobileApiError } from "@/lib/mobile-api";
import { prisma } from "@/lib/prisma";

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

export function jakartaDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function reportWindow(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new MobileApiError(422, "INVALID_DATE", "Tanggal laporan tidak valid");
  }
  const start = new Date(`${date}T00:00:00+07:00`);
  if (Number.isNaN(start.getTime())) {
    throw new MobileApiError(422, "INVALID_DATE", "Tanggal laporan tidak valid");
  }
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function selectedOutletId(context: MobileAuthContext) {
  const outletId = context.selectedOutletId ?? context.outletIds[0];
  if (!outletId) {
    throw new MobileApiError(403, "OUTLET_REQUIRED", "Outlet kasir belum dipilih");
  }
  return outletId;
}

export async function activeShift(context: MobileAuthContext) {
  const outletId = selectedOutletId(context);
  return prisma.cashierSession.findFirst({
    where: {
      businessId: context.businessId,
      outletId,
      employeeId: context.employeeId,
      isOpen: true,
    },
    orderBy: { openedAt: "desc" },
  });
}

export async function shiftSnapshot(sessionId: string) {
  const session = await prisma.cashierSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;
  const orders = await prisma.order.findMany({
    where: { cashierSessionId: session.id, status: "PAID" },
    include: { payment: { select: { method: true } } },
  });
  const cashSales = orders
    .filter((order) => order.payment?.method.toUpperCase() === "CASH")
    .reduce((total, order) => total + order.totalAmount, 0);
  const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const expectedCash = session.initialCash + cashSales;
  return {
    id: session.id,
    outletId: session.outletId,
    employeeId: session.employeeId,
    openedAt: session.openedAt.getTime(),
    closedAt: session.closedAt?.getTime() ?? null,
    initialCash: Math.round(session.initialCash),
    closingCash: session.closingCash == null ? null : Math.round(session.closingCash),
    expectedCash: Math.round(session.expectedCash ?? expectedCash),
    difference: session.difference == null ? null : Math.round(session.difference),
    cashSales: Math.round(cashSales),
    totalRevenue: Math.round(totalRevenue),
    totalOrders: orders.length,
    isOpen: session.isOpen,
    isOverdue: session.isOpen && jakartaDateKey(session.openedAt) !== jakartaDateKey(new Date()),
  };
}

export async function dailyCashierReport(context: MobileAuthContext, date: string) {
  const outletId = selectedOutletId(context);
  const { start, end } = reportWindow(date);
  const orders = await prisma.order.findMany({
    where: {
      businessId: context.businessId,
      outletId,
      employeeId: context.employeeId,
      status: "PAID",
      createdAt: { gte: start, lt: end },
    },
    include: {
      payment: { select: { method: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  let cashRevenue = 0;
  let qrisRevenue = 0;
  let otherRevenue = 0;
  for (const order of orders) {
    const method = order.payment?.method.toUpperCase() ?? "OTHER";
    if (method === "CASH") cashRevenue += order.totalAmount;
    else if (method.includes("QRIS")) qrisRevenue += order.totalAmount;
    else otherRevenue += order.totalAmount;
  }
  const totalRevenue = cashRevenue + qrisRevenue + otherRevenue;
  const itemCount = orders.reduce(
    (total, order) => total + order.items.reduce((subtotal, item) => subtotal + item.quantity, 0),
    0
  );
  const shifts = await prisma.cashierSession.findMany({
    where: {
      businessId: context.businessId,
      outletId,
      employeeId: context.employeeId,
      openedAt: { lt: end },
      OR: [{ closedAt: { gte: start } }, { isOpen: true }],
    },
    orderBy: { openedAt: "desc" },
  });
  return {
    date,
    transactionCount: orders.length,
    itemCount,
    totalRevenue: Math.round(totalRevenue),
    cashRevenue: Math.round(cashRevenue),
    qrisRevenue: Math.round(qrisRevenue),
    otherRevenue: Math.round(otherRevenue),
    averageTransaction: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    shifts: shifts.map((shift) => ({
      id: shift.id,
      openedAt: shift.openedAt.getTime(),
      closedAt: shift.closedAt?.getTime() ?? null,
      initialCash: Math.round(shift.initialCash),
      closingCash: shift.closingCash == null ? null : Math.round(shift.closingCash),
      difference: shift.difference == null ? null : Math.round(shift.difference),
      isOpen: shift.isOpen,
    })),
    recentTransactions: orders.slice(0, 10).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.getTime(),
      totalAmount: Math.round(order.totalAmount),
      paymentMethod: order.payment?.method ?? "OTHER",
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    })),
    serverTime: Date.now(),
  };
}
