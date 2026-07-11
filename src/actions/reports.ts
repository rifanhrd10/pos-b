"use server"

import { prisma } from "@/lib/prisma"
import { auth, getBusinessContext } from "@/lib/auth"

export type Period = "today" | "7days" | "30days"

// ── helpers ──────────────────────────────────────────────────

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const start = new Date(now)
  if (period === "today") {
    start.setHours(0, 0, 0, 0)
  } else if (period === "7days") {
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  }
  return { start, end }
}

function getPreviousPeriodRange(period: Period): { start: Date; end: Date } {
  const current = getPeriodRange(period)
  const diff = current.end.getTime() - current.start.getTime()
  return {
    start: new Date(current.start.getTime() - diff - 1),
    end: new Date(current.start.getTime() - 1),
  }
}

async function getAuthContext() {
  const session = await auth()
  if (!session?.user?.id) return null
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return null
  return { session, ctx, userId: session.user.id, businessId: ctx.businessId }
}

// ── 1. getDashboardStats ─────────────────────────────────────

export async function getDashboardStats(businessId: string, period: Period) {
  const { start, end } = getPeriodRange(period)
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(period)

  const baseWhere = {
    businessId,
    status: "PAID" as const,
  }

  const [current, previous, currentItems, previousItems] = await Promise.all([
    prisma.order.aggregate({
      where: { ...baseWhere, createdAt: { gte: start, lte: end } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { ...baseWhere, createdAt: { gte: prevStart, lte: prevEnd } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.orderItem.aggregate({
      where: {
        order: { ...baseWhere, createdAt: { gte: start, lte: end } },
      },
      _sum: { quantity: true },
    }),
    prisma.orderItem.aggregate({
      where: {
        order: { ...baseWhere, createdAt: { gte: prevStart, lte: prevEnd } },
      },
      _sum: { quantity: true },
    }),
  ])

  const revenue = current._sum.totalAmount ?? 0
  const transactions = current._count
  const prevRevenue = previous._sum.totalAmount ?? 0
  const prevTransactions = previous._count

  const revenueChange =
    prevRevenue === 0 ? 0 : ((revenue - prevRevenue) / prevRevenue) * 100
  const transactionsChange =
    prevTransactions === 0
      ? 0
      : ((transactions - prevTransactions) / prevTransactions) * 100

  return {
    revenue,
    transactions,
    avgOrderValue: transactions === 0 ? 0 : revenue / transactions,
    itemsSold: currentItems._sum.quantity ?? 0,
    revenueChange,
    transactionsChange,
  }
}

// ── 2. getRevenueChartData ───────────────────────────────────

export async function getRevenueChartData(businessId: string, period: Period) {
  const { start, end } = getPeriodRange(period)

  const orders = await prisma.order.findMany({
    where: {
      businessId,
      status: "PAID",
      createdAt: { gte: start, lte: end },
    },
    select: { createdAt: true, totalAmount: true },
  })

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  if (period === "today") {
    // 24 hourly buckets
    const buckets = new Map<string, number>()
    for (let h = 0; h < 24; h++) {
      buckets.set(h.toString().padStart(2, "0") + ":00", 0)
    }
    for (const o of orders) {
      const key = o.createdAt.getHours().toString().padStart(2, "0") + ":00"
      buckets.set(key, (buckets.get(key) ?? 0) + o.totalAmount)
    }
    return Array.from(buckets.entries()).map(([label, value]) => ({
      label,
      value,
    }))
  }

  if (period === "7days") {
    // 7 daily buckets "Sen 01/07"
    const buckets = new Map<string, number>()
    const bucketKeys: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayName = dayNames[d.getDay()]
      const key =
        dayName +
        " " +
        d.getDate().toString().padStart(2, "0") +
        "/" +
        (d.getMonth() + 1).toString().padStart(2, "0")
      buckets.set(key, 0)
      bucketKeys.push(key)
    }
    for (const o of orders) {
      const d = o.createdAt
      const dayName = dayNames[d.getDay()]
      const key =
        dayName +
        " " +
        d.getDate().toString().padStart(2, "0") +
        "/" +
        (d.getMonth() + 1).toString().padStart(2, "0")
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + o.totalAmount)
      }
    }
    return bucketKeys.map((label) => ({ label, value: buckets.get(label) ?? 0 }))
  }

  // 30days — 30 daily buckets "01/07"
  const buckets = new Map<string, number>()
  const bucketKeys: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const key =
      d.getDate().toString().padStart(2, "0") +
      "/" +
      (d.getMonth() + 1).toString().padStart(2, "0")
    buckets.set(key, 0)
    bucketKeys.push(key)
  }
  for (const o of orders) {
    const d = o.createdAt
    const key =
      d.getDate().toString().padStart(2, "0") +
      "/" +
      (d.getMonth() + 1).toString().padStart(2, "0")
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + o.totalAmount)
    }
  }
  return bucketKeys.map((label) => ({ label, value: buckets.get(label) ?? 0 }))
}

// ── 3. getTopProducts ────────────────────────────────────────

export async function getTopProducts(
  businessId: string,
  period: Period,
  limit = 10
) {
  const { start, end } = getPeriodRange(period)

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        businessId,
        status: "PAID",
        createdAt: { gte: start, lte: end },
      },
    },
    select: {
      productId: true,
      name: true,
      quantity: true,
      subtotal: true,
    },
  })

  const grouped = new Map<string, { name: string; qty: number; revenue: number }>()
  for (const item of items) {
    const existing = grouped.get(item.productId)
    if (existing) {
      existing.qty += item.quantity
      existing.revenue += item.subtotal
    } else {
      grouped.set(item.productId, {
        name: item.name,
        qty: item.quantity,
        revenue: item.subtotal,
      })
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ── 4. getPaymentBreakdown ───────────────────────────────────

export async function getPaymentBreakdown(businessId: string, period: Period) {
  const { start, end } = getPeriodRange(period)

  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      order: {
        status: "PAID",
        createdAt: { gte: start, lte: end },
      },
    },
    select: { method: true, totalAmount: true },
  })

  const grouped = new Map<string, { count: number; amount: number }>()
  for (const p of payments) {
    const existing = grouped.get(p.method)
    if (existing) {
      existing.count += 1
      existing.amount += p.totalAmount
    } else {
      grouped.set(p.method, { count: 1, amount: p.totalAmount })
    }
  }

  return Array.from(grouped.entries()).map(([method, { count, amount }]) => ({
    method,
    count,
    amount,
  }))
}

// ── 5. getRecentTransactions ─────────────────────────────────

export async function getRecentTransactions(businessId: string, limit = 5) {
  const orders = await prisma.order.findMany({
    where: { businessId, status: "PAID" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      createdAt: true,
      payment: { select: { method: true } },
      cashierSession: {
        select: {
          employee: { select: { name: true } },
          outlet: { select: { name: true } },
        },
      },
      employee: { select: { name: true } },
      outlet: { select: { name: true } },
    },
  })

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt,
    employeeName:
      o.cashierSession?.employee?.name ?? o.employee?.name ?? "—",
    outletName: o.cashierSession?.outlet?.name ?? o.outlet?.name ?? "—",
    method: o.payment?.method ?? "—",
  }))
}

// ── 6. getLowStockAlerts ─────────────────────────────────────

export async function getLowStockAlerts(
  businessId: string,
  threshold = 10
) {
  const stocks = await prisma.stock.findMany({
    where: {
      quantity: { lt: threshold },
      product: { businessId },
    },
    select: {
      quantity: true,
      product: {
        select: {
          name: true,
          category: { select: { name: true } },
        },
      },
      outlet: { select: { name: true } },
    },
    orderBy: { quantity: "asc" },
  })

  return stocks.map((s) => ({
    name: s.product.name,
    stock: s.quantity,
    category: s.product.category?.name ?? "—",
    outlet: s.outlet.name,
  }))
}

// ── 7. getSalesReport ────────────────────────────────────────

export async function getSalesReport(
  businessId: string,
  startDate: Date,
  endDate: Date,
  outletId?: string
) {
  const where = {
    businessId,
    status: "PAID" as const,
    createdAt: { gte: startDate, lte: endDate },
    ...(outletId ? { outletId } : {}),
  }

  const orders = await prisma.order.findMany({
    where,
    select: {
      totalAmount: true,
      createdAt: true,
      payment: { select: { method: true, totalAmount: true } },
    },
  })

  // Daily bucketing
  const dailyMap = new Map<string, { revenue: number; transactions: number }>()
  // Fill all dates in range with 0
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  const rangeEnd = new Date(endDate)
  rangeEnd.setHours(0, 0, 0, 0)
  while (cursor <= rangeEnd) {
    const key = cursor.toISOString().slice(0, 10)
    dailyMap.set(key, { revenue: 0, transactions: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  let total = 0
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    const bucket = dailyMap.get(key) ?? { revenue: 0, transactions: 0 }
    bucket.revenue += o.totalAmount
    bucket.transactions += 1
    dailyMap.set(key, bucket)
    total += o.totalAmount
  }

  // Payment method breakdown
  const methodMap = new Map<string, { amount: number; count: number }>()
  for (const o of orders) {
    if (!o.payment) continue
    const method = o.payment.method
    const existing = methodMap.get(method)
    if (existing) {
      existing.amount += o.payment.totalAmount
      existing.count += 1
    } else {
      methodMap.set(method, { amount: o.payment.totalAmount, count: 1 })
    }
  }

  const count = orders.length
  return {
    dailyData: Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { revenue, transactions }]) => ({ date, revenue, transactions })),
    summary: {
      total,
      count,
      avg: count === 0 ? 0 : total / count,
    },
    byPaymentMethod: Array.from(methodMap.entries()).map(
      ([method, { amount, count: c }]) => ({ method, amount, count: c })
    ),
  }
}

// ── 8. getProductsReport ─────────────────────────────────────

export async function getProductsReport(
  businessId: string,
  startDate: Date,
  endDate: Date,
  categoryId?: string
) {
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        businessId,
        status: "PAID",
        createdAt: { gte: startDate, lte: endDate },
      },
      ...(categoryId
        ? { product: { categoryId } }
        : {}),
    },
    select: {
      productId: true,
      name: true,
      quantity: true,
      subtotal: true,
      product: {
        select: {
          category: { select: { name: true } },
        },
      },
    },
  })

  const grouped = new Map<
    string,
    { name: string; category: string; qty: number; revenue: number }
  >()
  for (const item of items) {
    const existing = grouped.get(item.productId)
    if (existing) {
      existing.qty += item.quantity
      existing.revenue += item.subtotal
    } else {
      grouped.set(item.productId, {
        name: item.name,
        category: item.product?.category?.name ?? "—",
        qty: item.quantity,
        revenue: item.subtotal,
      })
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.revenue - a.revenue)
    .map((row, index) => ({ rank: index + 1, ...row }))
}

// ── 9. getCashierReport ──────────────────────────────────────

export async function getCashierReport(
  businessId: string,
  startDate: Date,
  endDate: Date
) {
  const sessions = await prisma.cashierSession.findMany({
    where: {
      businessId,
      openedAt: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      employeeId: true,
      employee: { select: { name: true } },
      orders: {
        where: { status: "PAID" },
        select: { totalAmount: true },
      },
    },
  })

  const grouped = new Map<
    string,
    {
      employeeName: string
      sessions: number
      transactions: number
      totalRevenue: number
    }
  >()

  for (const session of sessions) {
    const existing = grouped.get(session.employeeId)
    const sessionRevenue = session.orders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    )
    if (existing) {
      existing.sessions += 1
      existing.transactions += session.orders.length
      existing.totalRevenue += sessionRevenue
    } else {
      grouped.set(session.employeeId, {
        employeeName: session.employee.name,
        sessions: 1,
        transactions: session.orders.length,
        totalRevenue: sessionRevenue,
      })
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((row) => ({
      ...row,
      avgPerTransaction:
        row.transactions === 0 ? 0 : row.totalRevenue / row.transactions,
    }))
}

// ── 10. getInventoryReport ───────────────────────────────────

export async function getInventoryReport(
  businessId: string,
  outletId?: string,
  categoryId?: string
) {
  const stocks = await prisma.stock.findMany({
    where: {
      product: {
        businessId,
        ...(categoryId ? { categoryId } : {}),
      },
      ...(outletId ? { outletId } : {}),
    },
    select: {
      quantity: true,
      product: {
        select: {
          name: true,
          category: { select: { name: true } },
        },
      },
      outlet: { select: { name: true } },
    },
    orderBy: { quantity: "asc" },
  })

  return stocks.map((s) => ({
    name: s.product.name,
    category: s.product.category?.name ?? "—",
    outlet: s.outlet.name,
    currentStock: s.quantity,
  }))
}
