"use server"

import { auth, getBusinessContext } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import {
  updateBusinessProfileSchema,
  updateTaxSettingsSchema,
  updateReceiptTemplateSchema,
  updateGeneralSettingsSchema,
  createPaymentMethodSchema,
  changePasswordSchema,
} from "@/lib/validations"

// Helper
async function getAuthContext() {
  const session = await auth()
  if (!session?.user?.id) return null
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return null
  return { session, ctx, userId: session.user.id, businessId: ctx.businessId }
}

// ─── READ ────────────────────────────────────────────────────────────────────

export async function getBusinessSettings() {
  const authCtx = await getAuthContext()
  if (!authCtx) return null

  const [business, settings, paymentMethods] = await Promise.all([
    prisma.business.findUnique({
      where: { id: authCtx.businessId },
      select: {
        id: true, name: true, type: true, phone: true, email: true,
        address: true, city: true, province: true, logo: true,
        taxRate: true, serviceRate: true, currency: true,
        openTime: true, closeTime: true,
      },
    }),
    prisma.businessSettings.findUnique({
      where: { businessId: authCtx.businessId },
    }),
    prisma.paymentMethod.findMany({
      where: { businessId: authCtx.businessId },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return { business, settings, paymentMethods }
}

// ─── BUSINESS PROFILE ────────────────────────────────────────────────────────

export async function updateBusinessProfile(formData: FormData) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const raw = {
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      province: (formData.get("province") as string) || undefined,
    }

    const parsed = updateBusinessProfileSchema.safeParse(raw)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    const logo = (formData.get("logo") as string) || undefined

    await prisma.business.update({
      where: { id: authCtx.businessId },
      data: { ...parsed.data, ...(logo ? { logo } : {}) },
    })

    revalidatePath("/settings/business")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menyimpan profil bisnis" }
  }
}

// ─── KODE TOKO ───────────────────────────────────────────────────────────────

export async function generateStoreCode() {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    // Generate a random 8-char alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Ensure uniqueness
    const existing = await prisma.business.findUnique({ where: { storeCode: code } })
    if (existing) {
      // Retry once with different code
      code = ""
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    }

    await prisma.business.update({
      where: { id: authCtx.businessId },
      data: { storeCode: code },
    })

    revalidatePath("/settings/business")
    return { success: true, storeCode: code }
  } catch (_e) {
    return { success: false, error: "Gagal generate kode toko" }
  }
}

export async function getStoreCode() {
  const authCtx = await getAuthContext()
  if (!authCtx) return null

  const business = await prisma.business.findUnique({
    where: { id: authCtx.businessId },
    select: { storeCode: true },
  })
  return business?.storeCode ?? null
}

// ─── TAX SETTINGS ────────────────────────────────────────────────────────────

export async function updateTaxSettings(data: { taxRate: number; serviceRate: number }) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const parsed = updateTaxSettingsSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    await prisma.business.update({
      where: { id: authCtx.businessId },
      data: { taxRate: parsed.data.taxRate, serviceRate: parsed.data.serviceRate },
    })

    revalidatePath("/settings/tax")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menyimpan pengaturan pajak" }
  }
}

// ─── RECEIPT TEMPLATE ────────────────────────────────────────────────────────

export async function updateReceiptTemplate(data: Record<string, unknown>) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const parsed = updateReceiptTemplateSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    await prisma.businessSettings.upsert({
      where: { businessId: authCtx.businessId },
      create: { businessId: authCtx.businessId, ...parsed.data },
      update: parsed.data,
    })

    revalidatePath("/settings/receipt")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menyimpan template struk" }
  }
}

// ─── GENERAL SETTINGS ────────────────────────────────────────────────────────

export async function updateGeneralSettings(data: Record<string, unknown>) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const parsed = updateGeneralSettingsSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    await prisma.businessSettings.upsert({
      where: { businessId: authCtx.businessId },
      create: { businessId: authCtx.businessId, ...parsed.data },
      update: parsed.data,
    })

    revalidatePath("/settings/general")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menyimpan pengaturan umum" }
  }
}

// ─── PAYMENT METHODS ─────────────────────────────────────────────────────────

export async function getPaymentMethods() {
  const authCtx = await getAuthContext()
  if (!authCtx) return []
  return prisma.paymentMethod.findMany({
    where: { businessId: authCtx.businessId },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createPaymentMethod(data: Record<string, unknown>) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const parsed = createPaymentMethodSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    const method = await prisma.paymentMethod.create({
      data: { ...parsed.data, businessId: authCtx.businessId },
    })

    revalidatePath("/settings/payment")
    return { success: true, method }
  } catch (_e) {
    return { success: false, error: "Gagal membuat metode pembayaran" }
  }
}

export async function updatePaymentMethod(id: string, data: Record<string, unknown>) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const existing = await prisma.paymentMethod.findUnique({ where: { id } })
    if (!existing || existing.businessId !== authCtx.businessId) return { success: false, error: "Forbidden" }

    // Don't overwrite existing keys with empty strings
    const updateData = { ...data }
    if (!updateData.apiKey) delete updateData.apiKey
    if (!updateData.apiSecret) delete updateData.apiSecret

    await prisma.paymentMethod.update({ where: { id }, data: updateData })

    revalidatePath("/settings/payment")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal mengupdate metode pembayaran" }
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const existing = await prisma.paymentMethod.findUnique({ where: { id } })
    if (!existing || existing.businessId !== authCtx.businessId) return { success: false, error: "Forbidden" }

    await prisma.paymentMethod.delete({ where: { id } })

    revalidatePath("/settings/payment")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menghapus metode pembayaran" }
  }
}

export async function togglePaymentMethod(id: string, isEnabled: boolean) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const existing = await prisma.paymentMethod.findUnique({ where: { id } })
    if (!existing || existing.businessId !== authCtx.businessId) return { success: false, error: "Forbidden" }

    await prisma.paymentMethod.update({ where: { id }, data: { isEnabled } })

    revalidatePath("/settings/payment")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal mengubah status metode pembayaran" }
  }
}

// ─── ACCOUNT ─────────────────────────────────────────────────────────────────

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const parsed = changePasswordSchema.safeParse({ oldPassword, newPassword, confirmPassword })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    const user = await prisma.user.findUnique({ where: { id: authCtx.userId } })
    if (!user) return { success: false, error: "User tidak ditemukan" }

    const isValid = await bcrypt.compare(oldPassword, user.password)
    if (!isValid) return { success: false, error: "Password lama tidak sesuai" }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: authCtx.userId }, data: { password: hashed } })

    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal mengganti password" }
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const authCtx = await getAuthContext()
    if (!authCtx) return { success: false, error: "Unauthorized" }

    const name = formData.get("name") as string
    const phone = (formData.get("phone") as string) || undefined
    const avatar = (formData.get("avatar") as string) || undefined

    if (!name?.trim()) return { success: false, error: "Nama wajib diisi" }

    await prisma.user.update({
      where: { id: authCtx.userId },
      data: { name: name.trim(), phone, ...(avatar ? { avatar } : {}) },
    })

    revalidatePath("/settings/account")
    return { success: true }
  } catch (_e) {
    return { success: false, error: "Gagal menyimpan profil" }
  }
}
