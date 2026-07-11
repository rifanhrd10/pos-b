"use server"

import { auth, getBusinessContext } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getAuthContext() {
  const session = await auth()
  if (!session?.user?.id) return null
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return null
  return { session, ctx, userId: session.user.id, businessId: ctx.businessId, outletId: ctx.outletId }
}

export async function seedDemoData() {
  const context = await getAuthContext()
  if (!context) return { success: false, error: "Unauthorized" }

  const { businessId, outletId } = context

  try {
    await prisma.$transaction(async (tx) => {
      // Categories
      const categories = [
        { name: "Kopi", sortOrder: 1 },
        { name: "Non-Kopi", sortOrder: 2 },
        { name: "Makanan", sortOrder: 3 },
        { name: "Snack", sortOrder: 4 },
        { name: "Lainnya", sortOrder: 5 },
      ]

      const catIds: Record<string, string> = {}
      for (const cat of categories) {
        const existing = await tx.category.findUnique({
          where: { businessId_name: { businessId, name: cat.name } },
        })
        if (existing) {
          catIds[cat.name] = existing.id
        } else {
          const created = await tx.category.create({
            data: { businessId, name: cat.name, sortOrder: cat.sortOrder, isActive: true },
          })
          catIds[cat.name] = created.id
        }
      }

      // Products
      const products = [
        { name: "Americano", categoryName: "Kopi", basePrice: 22000, costPrice: 8000 },
        { name: "Cappuccino", categoryName: "Kopi", basePrice: 28000, costPrice: 10000 },
        { name: "Latte", categoryName: "Kopi", basePrice: 30000, costPrice: 11000 },
        { name: "Espresso", categoryName: "Kopi", basePrice: 18000, costPrice: 6000 },
        { name: "Mocha", categoryName: "Kopi", basePrice: 32000, costPrice: 12000 },
        { name: "Matcha Latte", categoryName: "Non-Kopi", basePrice: 30000, costPrice: 12000 },
        { name: "Teh Tarik", categoryName: "Non-Kopi", basePrice: 20000, costPrice: 7000 },
        { name: "Coklat Panas", categoryName: "Non-Kopi", basePrice: 25000, costPrice: 9000 },
        { name: "Jus Jeruk", categoryName: "Non-Kopi", basePrice: 22000, costPrice: 8000 },
        { name: "Nasi Goreng", categoryName: "Makanan", basePrice: 35000, costPrice: 15000 },
        { name: "Mie Goreng", categoryName: "Makanan", basePrice: 30000, costPrice: 13000 },
        { name: "Sandwich", categoryName: "Makanan", basePrice: 28000, costPrice: 12000 },
        { name: "Croissant", categoryName: "Snack", basePrice: 25000, costPrice: 10000 },
        { name: "Cookies", categoryName: "Snack", basePrice: 15000, costPrice: 5000 },
        { name: "Air Mineral", categoryName: "Lainnya", basePrice: 8000, costPrice: 3000 },
      ]

      const productIds: string[] = []
      for (const prod of products) {
        const existing = await tx.product.findFirst({
          where: { businessId, name: prod.name },
        })
        if (existing) {
          productIds.push(existing.id)
        } else {
          const created = await tx.product.create({
            data: {
              businessId,
              categoryId: catIds[prod.categoryName],
              name: prod.name,
              basePrice: prod.basePrice,
              costPrice: prod.costPrice,
              isActive: true,
              trackStock: true,
            },
          })
          productIds.push(created.id)

          // Add variants for coffee
          if (prod.categoryName === "Kopi") {
            await tx.productVariant.createMany({
              data: [
                { productId: created.id, name: "Hot", priceAdjustment: 0, sortOrder: 1 },
                { productId: created.id, name: "Ice", priceAdjustment: 3000, sortOrder: 2 },
              ],
            })
            await tx.productTopping.createMany({
              data: [
                { productId: created.id, name: "Extra Shot", price: 5000 },
                { productId: created.id, name: "Oat Milk", price: 8000 },
              ],
            })
          }
        }
      }

      // Customers
      const customers = [
        { name: "Budi Santoso", phone: "081234560001", email: "budi@email.com" },
        { name: "Siti Rahayu", phone: "081234560002", email: "siti@email.com" },
        { name: "Andi Pratama", phone: "081234560003", email: "andi@email.com" },
        { name: "Dewi Lestari", phone: "081234560004", email: "dewi@email.com" },
        { name: "Riko Aditya", phone: "081234560005", email: "riko@email.com" },
        { name: "Maya Putri", phone: "081234560006", email: null },
        { name: "Faris Hidayat", phone: "081234560007", email: null },
        { name: "Lina Susanti", phone: "081234560008", email: null },
      ]

      for (const cust of customers) {
        const existing = await tx.customer.findUnique({
          where: { businessId_phone: { businessId, phone: cust.phone } },
        })
        if (!existing) {
          await tx.customer.create({
            data: { businessId, name: cust.name, phone: cust.phone, email: cust.email },
          })
        }
      }

      // Promos
      const promos = [
        { name: "Diskon 10%", code: "DISC10", type: "VOUCHER" as const, discountType: "PERCENTAGE" as const, discountValue: 10, minOrderAmount: 50000 },
        { name: "Potongan 15rb", code: "HEMAT15", type: "VOUCHER" as const, discountType: "NOMINAL" as const, discountValue: 15000, minOrderAmount: 75000 },
        { name: "Happy Hour 20%", code: null, type: "HAPPY_HOUR" as const, discountType: "PERCENTAGE" as const, discountValue: 20, startHour: 14, endHour: 16 },
      ]

      for (const promo of promos) {
        if (promo.code) {
          const existing = await tx.promo.findUnique({
            where: { businessId_code: { businessId, code: promo.code } },
          })
          if (existing) continue
        }
        await tx.promo.create({
          data: {
            businessId,
            name: promo.name,
            code: promo.code,
            type: promo.type,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minOrderAmount: promo.minOrderAmount ?? null,
            startHour: (promo as { startHour?: number }).startHour ?? null,
            endHour: (promo as { endHour?: number }).endHour ?? null,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        })
      }

      // Stock for outlet
      if (outletId) {
        for (const productId of productIds) {
          const existing = await tx.stock.findFirst({
            where: { outletId, productId, variantId: null },
          })
          if (!existing) {
            await tx.stock.create({
              data: { outletId, productId, quantity: Math.floor(Math.random() * 80) + 20, minStock: 5 },
            })
          }
        }
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/products")
    revalidatePath("/inventory")
    revalidatePath("/customers")
    revalidatePath("/promos")

    return { success: true }
  } catch (error) {
    console.error("Seed demo data error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengisi data demo",
    }
  }
}
