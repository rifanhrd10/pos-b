"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
// OrderStatus enum: DRAFT | ACTIVE | PAID | VOID | CANCELLED

async function requireITAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== "itadmin") return null
  return session.user
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function getITAdminDashboardStats() {
  const admin = await requireITAdmin()
  if (!admin) return null

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    totalBusinesses,
    todayOrders,
    todayRevenue,
    newBusinessesThisMonth,
    expiringSoon,
    planDistribution,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart }, status: "PAID" } }),
    prisma.payment.aggregate({ where: { createdAt: { gte: todayStart }, status: "PAID" }, _sum: { totalAmount: true } }),
    prisma.business.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.subscription.count({
      where: {
        currentPeriodEnd: { gte: now, lte: sevenDaysLater },
        status: { in: ["active", "trial"] },
      },
    }),
    prisma.subscription.groupBy({
      by: ["planId"],
      _count: { id: true },
    }),
  ])

  // Get plan names for distribution
  const plans = await prisma.plan.findMany({ select: { id: true, displayName: true } })
  const distribution = planDistribution.map((d) => ({
    plan: plans.find((p) => p.id === d.planId)?.displayName || "Unknown",
    count: d._count.id,
  }))

  return {
    totalBusinesses,
    todayOrders,
    todayRevenue: todayRevenue._sum.totalAmount || 0,
    newBusinessesThisMonth,
    expiringSoon,
    planDistribution: distribution,
  }
}

// ─── BUSINESSES ──────────────────────────────────────────────────────────────

export async function getBusinessesList() {
  const admin = await requireITAdmin()
  if (!admin) return []

  const businesses = await prisma.business.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      subscription: { include: { plan: true } },
      outlets: { select: { id: true } },
      _count: { select: { outlets: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get order counts per business for this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const orderCounts = await prisma.order.groupBy({
    by: ["businessId"],
    where: { createdAt: { gte: monthStart }, status: "PAID" },
    _count: { id: true },
  })

  const orderMap = new Map(orderCounts.map((o) => [o.businessId, o._count.id]))

  return businesses.map((b) => ({
    id: b.id,
    name: b.name,
    ownerName: b.owner.name,
    ownerEmail: b.owner.email,
    plan: b.subscription?.plan.displayName || "No Plan",
    planName: b.subscription?.plan.name || null,
    subscriptionStatus: b.subscription?.status || "none",
    currentPeriodEnd: b.subscription?.currentPeriodEnd?.toISOString() || null,
    outletCount: b._count.outlets,
    ordersThisMonth: orderMap.get(b.id) || 0,
    createdAt: b.createdAt.toISOString(),
  }))
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export async function getSubscriptionsList() {
  const admin = await requireITAdmin()
  if (!admin) return []

  const subs = await prisma.subscription.findMany({
    include: {
      business: { select: { id: true, name: true } },
      plan: { select: { id: true, name: true, displayName: true, price: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return subs.map((s) => ({
    id: s.id,
    businessId: s.business.id,
    businessName: s.business.name,
    planId: s.plan.id,
    planName: s.plan.displayName,
    price: s.plan.price,
    status: s.status,
    trialEndsAt: s.trialEndsAt?.toISOString() || null,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
    createdAt: s.createdAt.toISOString(),
  }))
}

export async function updateSubscription(id: string, data: {
  status?: string;
  planId?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
}) {
  const admin = await requireITAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }

  try {
    await prisma.subscription.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.planId && { planId: data.planId }),
        ...(data.currentPeriodEnd && { currentPeriodEnd: new Date(data.currentPeriodEnd) }),
        ...(data.trialEndsAt && { trialEndsAt: new Date(data.trialEndsAt) }),
      },
    })
    revalidatePath("/itadmin/dashboard")
    revalidatePath("/itadmin/subscriptions")
    revalidatePath("/itadmin/businesses")
    return { success: true }
  } catch (e) {
    return { success: false, error: "Gagal update subscription" }
  }
}

export async function updateTenantSubscription(
  subscriptionId: string,
  data: {
    status?: "trial" | "active" | "expired" | "cancelled" | "suspended" | "pending";
    planId?: string;
    trialDays?: number;
    activeDays?: number;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  }
) {
  const admin = await requireITAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }

  const now = new Date()
  const payload: {
    status?: string;
    planId?: string;
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
  } = {}

  if (data.status) payload.status = data.status
  if (data.planId) payload.planId = data.planId
  if (data.trialEndsAt) payload.trialEndsAt = new Date(data.trialEndsAt)
  if (data.currentPeriodEnd) payload.currentPeriodEnd = new Date(data.currentPeriodEnd)
  if (data.trialDays) {
    payload.status = "trial"
    payload.trialEndsAt = new Date(now.getTime() + data.trialDays * 24 * 60 * 60 * 1000)
    payload.currentPeriodEnd = payload.trialEndsAt
  }
  if (data.activeDays) {
    payload.status = "active"
    payload.currentPeriodEnd = new Date(now.getTime() + data.activeDays * 24 * 60 * 60 * 1000)
  }

  try {
    await prisma.subscription.update({ where: { id: subscriptionId }, data: payload })
    revalidatePath("/itadmin/dashboard")
    revalidatePath("/itadmin/subscriptions")
    revalidatePath("/itadmin/businesses")
    return { success: true }
  } catch (e) {
    return { success: false, error: "Gagal update toko" }
  }
}

export async function getTenantManagementDashboard() {
  const admin = await requireITAdmin()
  if (!admin) return null

  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [businesses, plans, orderCounts] = await Promise.all([
    prisma.business.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        subscription: { include: { plan: true } },
        _count: { select: { outlets: true, employees: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
    prisma.order.groupBy({
      by: ["businessId"],
      where: { createdAt: { gte: monthStart }, status: "PAID" },
      _count: { id: true },
    }),
  ])

  const orderMap = new Map(orderCounts.map((o) => [o.businessId, o._count.id]))
  const tenants = businesses.map((business) => {
    const subscription = business.subscription
    const status = subscription?.status || "pending"
    const expiryDate = subscription?.currentPeriodEnd || subscription?.trialEndsAt || null
    const daysLeft = expiryDate
      ? Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null

    return {
      id: business.id,
      name: business.name,
      ownerName: business.owner.name,
      ownerEmail: business.owner.email,
      status,
      subscriptionId: subscription?.id || null,
      planId: subscription?.planId || null,
      planName: subscription?.plan.displayName || "Belum ada plan",
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() || null,
      trialEndsAt: subscription?.trialEndsAt?.toISOString() || null,
      daysLeft,
      outletCount: business._count.outlets,
      employeeCount: business._count.employees,
      ordersThisMonth: orderMap.get(business.id) || 0,
      createdAt: business.createdAt.toISOString(),
    }
  })

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    trial: tenants.filter((t) => t.status === "trial").length,
    inactive: tenants.filter((t) => ["expired", "cancelled", "suspended", "pending"].includes(t.status)).length,
    expiringSoon: tenants.filter((t) => {
      if (!t.daysLeft) return false
      return t.daysLeft >= 0 && t.daysLeft <= 7 && ["active", "trial"].includes(t.status)
    }).length,
  }

  const actionQueue = tenants
    .filter((t) => t.status === "pending" || t.status === "expired" || t.status === "suspended" || (t.daysLeft !== null && t.daysLeft <= 7 && ["active", "trial"].includes(t.status)))
    .slice(0, 8)

  return { stats, tenants, actionQueue, plans }
}

// ─── PLANS CRUD ──────────────────────────────────────────────────────────────

export async function getPlansList() {
  const admin = await requireITAdmin()
  if (!admin) return []

  return prisma.plan.findMany({ orderBy: { price: "asc" } })
}

export async function updatePlan(id: string, data: {
  displayName?: string;
  price?: number;
  maxOutlets?: number;
  maxEmployees?: number;
  features?: string[];
}) {
  const admin = await requireITAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }

  try {
    await prisma.plan.update({ where: { id }, data })
    revalidatePath("/itadmin/plans")
    return { success: true }
  } catch (e) {
    return { success: false, error: "Gagal update plan" }
  }
}

export async function createPlan(data: {
  name: string;
  displayName: string;
  price: number;
  maxOutlets: number;
  maxEmployees: number;
  features: string[];
}) {
  const admin = await requireITAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }

  try {
    await prisma.plan.create({ data })
    revalidatePath("/itadmin/plans")
    return { success: true }
  } catch (e) {
    return { success: false, error: "Gagal create plan" }
  }
}

// ─── MONITORING ──────────────────────────────────────────────────────────────

export async function getMonitoringData(businessId?: string) {
  const admin = await requireITAdmin()
  if (!admin) return null

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const where = {
    createdAt: { gte: thirtyDaysAgo },
    status: "PAID" as const,
    ...(businessId ? { businessId } : {}),
  }

  const orders = await prisma.order.findMany({
    where,
    select: { createdAt: true, totalAmount: true, businessId: true },
    orderBy: { createdAt: "asc" },
  })

  // Group by day
  const dailyMap = new Map<string, { count: number; revenue: number }>()
  for (const order of orders) {
    const day = order.createdAt.toISOString().split("T")[0]
    const existing = dailyMap.get(day) || { count: 0, revenue: 0 }
    existing.count++
    existing.revenue += order.totalAmount
    dailyMap.set(day, existing)
  }

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Top businesses
  const topBusinesses = await prisma.order.groupBy({
    by: ["businessId"],
    where: { createdAt: { gte: thirtyDaysAgo }, status: "PAID" },
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  })

  const businessNames = await prisma.business.findMany({
    where: { id: { in: topBusinesses.map((b) => b.businessId) } },
    select: { id: true, name: true },
  })

  const topByTransactions = topBusinesses.map((b) => ({
    name: businessNames.find((bn) => bn.id === b.businessId)?.name || "Unknown",
    count: b._count?.id ?? 0,
    revenue: b._sum?.totalAmount || 0,
  }))

  return { dailyData, topByTransactions }
}

// ─── SYSTEM STATS ────────────────────────────────────────────────────────────

export async function getSystemStats() {
  const admin = await requireITAdmin()
  if (!admin) return null

  const [
    totalUsers,
    totalBusinesses,
    totalOrders,
    totalRevenue,
    totalProducts,
    totalEmployees,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.employee.count(),
  ])

  // Avg orders per day (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentOrders = await prisma.order.count({
    where: { createdAt: { gte: thirtyDaysAgo }, status: "PAID" },
  })
  const avgOrdersPerDay = Math.round(recentOrders / 30)

  return {
    totalUsers,
    totalBusinesses,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalProducts,
    totalEmployees,
    avgOrdersPerDay,
  }
}
