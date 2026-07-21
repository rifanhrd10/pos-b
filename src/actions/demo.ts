"use server"

import { auth, getBusinessContext } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const DAY_MS = 24 * 60 * 60 * 1000

const seedDemoSchema = z.object({
  outletId: z.string().min(1),
  historyDays: z.coerce.number().int().min(1).max(90).default(30),
  averageTransactionsPerDay: z.coerce.number().int().min(1).max(30).default(8),
})

export type SeedDemoInput = z.input<typeof seedDemoSchema>

async function getAuthContext() {
  const session = await auth()
  if (!session?.user?.id) return null
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return null
  return { userId: session.user.id, businessId: ctx.businessId }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

export async function seedDemoData(rawInput: SeedDemoInput) {
  const context = await getAuthContext()
  if (!context) return { success: false, error: "Unauthorized" }

  const parsed = seedDemoSchema.safeParse(rawInput)
  if (!parsed.success) return { success: false, error: "Pengaturan data demo tidak valid" }

  const { businessId, userId } = context
  const { outletId, historyDays, averageTransactionsPerDay } = parsed.data
  const clickedAt = new Date()

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [business, outlet] = await Promise.all([
        tx.business.findUnique({
          where: { id: businessId },
          select: { taxRate: true, serviceRate: true },
        }),
        tx.outlet.findFirst({
          where: { id: outletId, businessId, isActive: true },
          select: { id: true, name: true, openTime: true, closeTime: true },
        }),
      ])
      if (!business || !outlet) throw new Error("Outlet tidak ditemukan pada bisnis aktif")

      // Master data bersifat milik bisnis, bukan global dan bukan milik bisnis lain.
      const categories = [
        { name: "Kopi", sortOrder: 1 },
        { name: "Non-Kopi", sortOrder: 2 },
        { name: "Makanan", sortOrder: 3 },
        { name: "Snack", sortOrder: 4 },
        { name: "Lainnya", sortOrder: 5 },
      ]

      const catIds: Record<string, string> = {}
      for (const category of categories) {
        const record = await tx.category.upsert({
          where: { businessId_name: { businessId, name: category.name } },
          update: { isActive: true, sortOrder: category.sortOrder },
          create: { businessId, ...category, isActive: true },
        })
        await tx.syncChange.create({
          data: { businessId, entityType: "category", entityId: record.id, operation: "upsert" },
        })
        catIds[category.name] = record.id
      }

      const productTemplates = [
        { name: "Americano", categoryName: "Kopi", basePrice: 22000, costPrice: 8000, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80" },
        { name: "Cappuccino", categoryName: "Kopi", basePrice: 28000, costPrice: 10000, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80" },
        { name: "Latte", categoryName: "Kopi", basePrice: 30000, costPrice: 11000, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80" },
        { name: "Espresso", categoryName: "Kopi", basePrice: 18000, costPrice: 6000, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80" },
        { name: "Mocha", categoryName: "Kopi", basePrice: 32000, costPrice: 12000, image: "https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?auto=format&fit=crop&w=800&q=80" },
        { name: "Matcha Latte", categoryName: "Non-Kopi", basePrice: 30000, costPrice: 12000, image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80" },
        { name: "Teh Tarik", categoryName: "Non-Kopi", basePrice: 20000, costPrice: 7000, image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80" },
        { name: "Coklat Panas", categoryName: "Non-Kopi", basePrice: 25000, costPrice: 9000, image: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?auto=format&fit=crop&w=800&q=80" },
        { name: "Jus Jeruk", categoryName: "Non-Kopi", basePrice: 22000, costPrice: 8000, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80" },
        { name: "Nasi Goreng", categoryName: "Makanan", basePrice: 35000, costPrice: 15000, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
        { name: "Mie Goreng", categoryName: "Makanan", basePrice: 30000, costPrice: 13000, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80" },
        { name: "Sandwich", categoryName: "Makanan", basePrice: 28000, costPrice: 12000, image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80" },
        { name: "Croissant", categoryName: "Snack", basePrice: 25000, costPrice: 10000, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" },
        { name: "Cookies", categoryName: "Snack", basePrice: 15000, costPrice: 5000, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80" },
        { name: "Air Mineral", categoryName: "Lainnya", basePrice: 8000, costPrice: 3000, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80" },
      ]

      const productRecords: { id: string; name: string; basePrice: number }[] = []
      for (const template of productTemplates) {
        let product = await tx.product.findFirst({ where: { businessId, name: template.name } })
        if (product) {
          product = await tx.product.update({
            where: { id: product.id },
            data: {
              categoryId: catIds[template.categoryName],
              basePrice: template.basePrice,
              costPrice: template.costPrice,
              image: template.image,
              isActive: true,
              trackStock: true,
            },
          })
        } else {
          product = await tx.product.create({
            data: {
              businessId,
              categoryId: catIds[template.categoryName],
              name: template.name,
              basePrice: template.basePrice,
              costPrice: template.costPrice,
              image: template.image,
              isActive: true,
              trackStock: true,
            },
          })
          if (template.categoryName === "Kopi") {
            await tx.productVariant.createMany({
              data: [
                { productId: product.id, name: "Hot", priceAdjustment: 0, sortOrder: 1 },
                { productId: product.id, name: "Ice", priceAdjustment: 3000, sortOrder: 2 },
              ],
            })
            await tx.productTopping.createMany({
              data: [
                { productId: product.id, name: "Extra Shot", price: 5000 },
                { productId: product.id, name: "Oat Milk", price: 8000 },
              ],
            })
          }
        }
        await tx.syncChange.create({
          data: { businessId, entityType: "product", entityId: product.id, operation: "upsert" },
        })
        productRecords.push({ id: product.id, name: product.name, basePrice: product.basePrice })
      }

      const customerTemplates = [
        { name: "Budi Santoso", phone: "081234560001", email: "budi@email.com" },
        { name: "Siti Rahayu", phone: "081234560002", email: "siti@email.com" },
        { name: "Andi Pratama", phone: "081234560003", email: "andi@email.com" },
        { name: "Dewi Lestari", phone: "081234560004", email: "dewi@email.com" },
        { name: "Riko Aditya", phone: "081234560005", email: "riko@email.com" },
        { name: "Maya Putri", phone: "081234560006", email: null },
        { name: "Faris Hidayat", phone: "081234560007", email: null },
        { name: "Lina Susanti", phone: "081234560008", email: null },
      ]
      const customerIds: string[] = []
      for (const customer of customerTemplates) {
        const record = await tx.customer.upsert({
          where: { businessId_phone: { businessId, phone: customer.phone } },
          update: { name: customer.name, email: customer.email },
          create: { businessId, ...customer },
        })
        customerIds.push(record.id)
      }

      const promoTemplates = [
        { name: "Diskon 10%", code: "DISC10", type: "VOUCHER" as const, discountType: "PERCENTAGE" as const, discountValue: 10, minOrderAmount: 50000, startHour: null, endHour: null },
        { name: "Potongan 15rb", code: "HEMAT15", type: "VOUCHER" as const, discountType: "NOMINAL" as const, discountValue: 15000, minOrderAmount: 75000, startHour: null, endHour: null },
        { name: "Happy Hour 20%", code: null, type: "HAPPY_HOUR" as const, discountType: "PERCENTAGE" as const, discountValue: 20, minOrderAmount: null, startHour: 14, endHour: 16 },
      ]
      for (const promo of promoTemplates) {
        const existing = await tx.promo.findFirst({ where: { businessId, name: promo.name } })
        const data = {
          businessId,
          ...promo,
          isActive: true,
          startDate: clickedAt,
          endDate: new Date(clickedAt.getTime() + 90 * DAY_MS),
        }
        if (existing) await tx.promo.update({ where: { id: existing.id }, data })
        else await tx.promo.create({ data })
      }

      // Stok hanya dibuat untuk outlet yang dipilih pada dialog demo.
      for (const product of productRecords) {
        const stock = await tx.stock.findFirst({
          where: { outletId: outlet.id, productId: product.id, variantId: null },
        })
        if (!stock) {
          await tx.stock.create({
            data: { outletId: outlet.id, productId: product.id, quantity: randomInt(25, 110), minStock: 5 },
          })
        }
      }

      let cashier = await tx.employee.findFirst({
        where: {
          businessId,
          isActive: true,
          outlets: { some: { outletId: outlet.id } },
          role: { permissions: { has: "pos.access" } },
        },
        orderBy: { createdAt: "asc" },
      })
      if (!cashier) {
        cashier = await tx.employee.findFirst({ where: { businessId, userId, isActive: true } })
        if (!cashier) throw new Error("Owner aktif tidak ditemukan untuk membuat transaksi demo")
        await tx.employeeOutlet.upsert({
          where: { employeeId_outletId: { employeeId: cashier.id, outletId: outlet.id } },
          update: {},
          create: { employeeId: cashier.id, outletId: outlet.id },
        })
      }

      // Seed ulang hanya mengganti transaksi demo pada outlet ini, tidak menyentuh transaksi asli.
      const demoPrefix = `DEMO-${outlet.id.slice(-6).toUpperCase()}-`
      await tx.payment.deleteMany({
        where: { businessId, outletId: outlet.id, order: { orderNumber: { startsWith: demoPrefix } } },
      })
      await tx.order.deleteMany({
        where: { businessId, outletId: outlet.id, orderNumber: { startsWith: demoPrefix } },
      })
      await tx.cashierSession.deleteMany({
        where: { businessId, outletId: outlet.id, note: "DEMO_DATA" },
      })

      const openHour = Number.parseInt(outlet.openTime?.split(":")[0] ?? "8", 10)
      const closeHour = Number.parseInt(outlet.closeTime?.split(":")[0] ?? "21", 10)
      let transactionCount = 0

      for (let daysAgo = historyDays - 1; daysAgo >= 0; daysAgo--) {
        const day = new Date(clickedAt)
        day.setHours(0, 0, 0, 0)
        day.setDate(day.getDate() - daysAgo)

        const weekendFactor = day.getDay() === 0 || day.getDay() === 6 ? 1.25 : 1
        const todayProgress = daysAgo === 0
          ? Math.max(0.15, Math.min(1, (clickedAt.getHours() - openHour + 1) / Math.max(1, closeHour - openHour)))
          : 1
        const dailyTarget = Math.max(
          1,
          Math.round(averageTransactionsPerDay * weekendFactor * todayProgress * (0.7 + Math.random() * 0.6)),
        )

        const openedAt = new Date(day)
        openedAt.setHours(openHour, randomInt(0, 20), 0, 0)
        const closedAt = new Date(day)
        const effectiveCloseHour = daysAgo === 0 ? Math.min(closeHour, clickedAt.getHours()) : closeHour
        closedAt.setHours(Math.max(openHour + 1, effectiveCloseHour), randomInt(0, 45), 0, 0)
        const cashierSession = await tx.cashierSession.create({
          data: {
            businessId,
            outletId: outlet.id,
            employeeId: cashier.id,
            openedAt,
            closedAt,
            initialCash: 500000,
            closingCash: 500000,
            expectedCash: 500000,
            difference: 0,
            isOpen: false,
            note: "DEMO_DATA",
          },
        })

        let dailyCashSales = 0
        for (let index = 0; index < dailyTarget; index++) {
          transactionCount += 1
          const createdAt = new Date(day)
          const latestHour = Math.max(openHour + 1, effectiveCloseHour)
          createdAt.setHours(randomInt(openHour, latestHour), randomInt(0, 59), randomInt(0, 59), 0)
          if (createdAt > clickedAt) createdAt.setTime(clickedAt.getTime() - randomInt(1, 30) * 60_000)

          const itemCount = randomInt(1, 4)
          const lineItems: { productId: string; name: string; price: number; quantity: number; subtotal: number }[] = []
          for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            const product = productRecords[randomInt(0, productRecords.length - 1)]
            const quantity = Math.random() < 0.18 ? 2 : 1
            lineItems.push({
              productId: product.id,
              name: product.name,
              price: product.basePrice,
              quantity,
              subtotal: product.basePrice * quantity,
            })
          }

          const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
          const discountAmount = Math.random() < 0.16 ? Math.round(subtotal * 0.1) : 0
          const taxAmount = Math.round((subtotal - discountAmount) * (business.taxRate / 100))
          const serviceAmount = Math.round((subtotal - discountAmount) * (business.serviceRate / 100))
          const totalAmount = subtotal - discountAmount + taxAmount + serviceAmount
          const customerId = Math.random() < 0.42 ? customerIds[randomInt(0, customerIds.length - 1)] : null
          const paymentRoll = Math.random()
          const method = paymentRoll < 0.55 ? "CASH" : paymentRoll < 0.85 ? "QRIS_STATIC" : "BANK_TRANSFER"
          const cashEntered = method === "CASH" ? Math.ceil(totalAmount / 10000) * 10000 : null
          if (method === "CASH") dailyCashSales += totalAmount

          const orderNumber = `${demoPrefix}${dateKey(day)}-${String(index + 1).padStart(3, "0")}`
          await tx.order.create({
            data: {
              businessId,
              outletId: outlet.id,
              employeeId: cashier.id,
              cashierSessionId: cashierSession.id,
              customerId,
              orderNumber,
              status: "PAID",
              orderType: Math.random() < 0.72 ? "TAKEAWAY" : "DINE_IN",
              subtotal,
              taxAmount,
              serviceAmount,
              discountAmount,
              totalAmount,
              paidAt: createdAt,
              createdAt,
              updatedAt: createdAt,
              items: { create: lineItems },
              payment: {
                create: {
                  businessId,
                  outletId: outlet.id,
                  employeeId: cashier.id,
                  method,
                  totalAmount,
                  cashEntered,
                  changeAmount: cashEntered == null ? null : cashEntered - totalAmount,
                  referenceNo: method === "CASH" ? null : `DEMO-${createdAt.getTime()}`,
                  status: "PAID",
                  paidAt: createdAt,
                  createdAt,
                },
              },
            },
          })
        }

        await tx.cashierSession.update({
          where: { id: cashierSession.id },
          data: {
            expectedCash: 500000 + dailyCashSales,
            closingCash: 500000 + dailyCashSales,
          },
        })
      }

      // Statistik pelanggan dihitung ulang berdasarkan seluruh transaksi bisnis yang tersimpan.
      for (const customerId of customerIds) {
        const [aggregate, lastOrder] = await Promise.all([
          tx.order.aggregate({
            where: { businessId, customerId, status: "PAID" },
            _count: { id: true },
            _sum: { totalAmount: true },
          }),
          tx.order.findFirst({
            where: { businessId, customerId, status: "PAID" },
            orderBy: { paidAt: "desc" },
            select: { paidAt: true },
          }),
        ])
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalVisits: aggregate._count.id,
            totalSpent: aggregate._sum.totalAmount ?? 0,
            lastVisit: lastOrder?.paidAt ?? null,
          },
        })
      }

      return { outletName: outlet.name, transactionCount }
    }, { maxWait: 10_000, timeout: 90_000 })

    revalidatePath("/dashboard")
    revalidatePath("/products")
    revalidatePath("/inventory")
    revalidatePath("/customers")
    revalidatePath("/promos")
    revalidatePath("/reports")

    return { success: true, ...result }
  } catch (error) {
    console.error("Seed demo data error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengisi data demo",
    }
  }
}
