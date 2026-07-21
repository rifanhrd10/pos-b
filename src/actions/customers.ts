"use server"

import { prisma } from "@/lib/prisma"
import { auth, getBusinessContext } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const customerSchema = z.object({
  name: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter"),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Email tidak valid").optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
})

async function requireBusiness(businessId?: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const }
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return { error: "Business not found" as const }
  if (businessId && ctx.businessId !== businessId) return { error: "Forbidden" as const }
  return { session, businessId: ctx.businessId }
}

export async function getCustomers(
  businessId: string,
  options?: { search?: string; page?: number; pageSize?: number; includeInactive?: boolean; sortBy?: string }
) {
  const ctx = await requireBusiness(businessId)
  if ("error" in ctx) return { customers: [], total: 0, page: 1, pageSize: 20 }

  const page = Math.max(1, Number(options?.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(options?.pageSize ?? 20)))
  const search = options?.search?.trim()
  const where = {
    businessId: ctx.businessId,
    ...(options?.includeInactive ? {} : { isActive: true, deletedAt: null }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy:
        options?.sortBy === "spent"
          ? [{ totalSpent: "desc" }, { updatedAt: "desc" }]
          : [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  return { customers, total, page, pageSize }
}

export async function getCustomer(id: string) {
  const ctx = await requireBusiness()
  if ("error" in ctx) return null

  return prisma.customer.findFirst({
    where: { id, businessId: ctx.businessId, deletedAt: null },
    include: {
      orders: {
        where: { status: "PAID" },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paidAt: true,
          createdAt: true,
          payment: { select: { method: true } },
        },
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        take: 20,
      },
    },
  })
}

function normalizeCustomerData(data: Record<string, unknown>) {
  const parsed = customerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const value = parsed.data
  return {
    data: {
      name: value.name,
      phone: value.phone ? String(value.phone) : null,
      email: value.email ? String(value.email).toLowerCase() : null,
      address: value.address ? String(value.address) : null,
      notes: value.notes ? String(value.notes) : null,
      isActive: value.isActive ?? true,
    },
  }
}

async function checkDuplicateCustomer(
  businessId: string,
  data: { phone: string | null; email: string | null },
  ignoreId?: string
) {
  if (!data.phone && !data.email) return null
  return prisma.customer.findFirst({
    where: {
      businessId,
      deletedAt: null,
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
      OR: [
        ...(data.phone ? [{ phone: data.phone }] : []),
        ...(data.email ? [{ email: { equals: data.email, mode: "insensitive" as const } }] : []),
      ],
    },
    select: { id: true, phone: true, email: true },
  })
}

export async function createCustomer(businessId: string, data: Record<string, unknown>) {
  const ctx = await requireBusiness(businessId)
  if ("error" in ctx) return { error: ctx.error, customer: undefined }

  const normalized = normalizeCustomerData(data)
  if ("error" in normalized) return { error: normalized.error, customer: undefined }

  const duplicate = await checkDuplicateCustomer(ctx.businessId, normalized.data)
  if (duplicate?.phone === normalized.data.phone && normalized.data.phone) {
    return { error: "Nomor telepon pelanggan sudah digunakan", customer: undefined }
  }
  if (duplicate?.email?.toLowerCase() === normalized.data.email && normalized.data.email) {
    return { error: "Email pelanggan sudah digunakan", customer: undefined }
  }

  const customer = await prisma.customer.create({
    data: { businessId: ctx.businessId, ...normalized.data },
  })
  revalidatePath("/customers")
  return { customer }
}

export async function updateCustomer(id: string, data: Record<string, unknown>) {
  const ctx = await requireBusiness()
  if ("error" in ctx) return { ok: false, error: ctx.error }

  const normalized = normalizeCustomerData(data)
  if ("error" in normalized) return { ok: false, error: normalized.error }

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: ctx.businessId, deletedAt: null },
    select: { id: true },
  })
  if (!customer) return { ok: false, error: "Pelanggan tidak ditemukan" }

  const duplicate = await checkDuplicateCustomer(ctx.businessId, normalized.data, id)
  if (duplicate?.phone === normalized.data.phone && normalized.data.phone) {
    return { ok: false, error: "Nomor telepon pelanggan sudah digunakan" }
  }
  if (duplicate?.email?.toLowerCase() === normalized.data.email && normalized.data.email) {
    return { ok: false, error: "Email pelanggan sudah digunakan" }
  }

  await prisma.customer.update({
    where: { id },
    data: normalized.data,
  })
  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
  return { ok: true }
}

export async function deleteCustomer(id: string) {
  const ctx = await requireBusiness()
  if ("error" in ctx) return { ok: false, error: ctx.error }

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: ctx.businessId, deletedAt: null },
    include: { _count: { select: { orders: true } } },
  })
  if (!customer) return { ok: false, error: "Pelanggan tidak ditemukan" }

  if (customer._count.orders > 0) {
    await prisma.customer.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    })
  } else {
    await prisma.customer.delete({ where: { id } })
  }

  revalidatePath("/customers")
  return { ok: true }
}

export async function searchCustomers(businessId: string, query: string) {
  const result = await getCustomers(businessId, { search: query, pageSize: 10 })
  return result.customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    totalVisits: customer.totalVisits,
    totalSpent: customer.totalSpent,
  }))
}

export async function getTopCustomers(businessId: string, limit = 10) {
  const result = await getCustomers(businessId, { pageSize: limit, sortBy: "spent" })
  return result.customers
}

export async function assignCustomerToOrder(orderId: string, customerId: string | null) {
  const ctx = await requireBusiness()
  if ("error" in ctx) return { ok: false, error: ctx.error }

  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId: ctx.businessId },
    select: { id: true },
  })
  if (!order) return { ok: false, error: "Order tidak ditemukan" }

  if (customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId: ctx.businessId, isActive: true, deletedAt: null },
      select: { id: true },
    })
    if (!customer) return { ok: false, error: "Pelanggan tidak ditemukan" }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { customerId },
  })

  return { ok: true }
}
