"use server"

import { auth, getBusinessContext } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getAuthContext() {
  const session = await auth()
  if (!session?.user?.id) return null
  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) return null
  return { session, ctx, userId: session.user.id, businessId: ctx.businessId }
}

export type CleansingOption =
  | "transactions"
  | "customers"
  | "products"
  | "inventory"
  | "employees"
  | "all"

export async function cleanseData(options: CleansingOption[]) {
  const context = await getAuthContext()
  if (!context) return { success: false, error: "Unauthorized" }

  const { businessId } = context

  try {
    // Determine what to delete based on options
    const deleteAll = options.includes("all")
    const deleteTransactions = deleteAll || options.includes("transactions")
    const deleteCustomers = deleteAll || options.includes("customers")
    const deleteProducts = deleteAll || options.includes("products")
    const deleteInventory = deleteAll || options.includes("inventory")
    const deleteEmployees = deleteAll || options.includes("employees")

    await prisma.$transaction(async (tx) => {
      // 1. Transactions (orders, payments, cashier sessions, order promos)
      if (deleteTransactions) {
        // OrderItemTopping -> OrderItem -> OrderPromo -> Payment -> Order
        await tx.orderItemTopping.deleteMany({
          where: { orderItem: { order: { businessId } } },
        })
        await tx.orderItem.deleteMany({
          where: { order: { businessId } },
        })
        await tx.orderPromo.deleteMany({
          where: { order: { businessId } },
        })
        await tx.payment.deleteMany({ where: { businessId } })
        await tx.order.deleteMany({ where: { businessId } })
        await tx.cashierSession.deleteMany({ where: { businessId } })
        // Jika pelanggan tidak ikut dihapus, statistiknya tidak boleh menyisakan angka transaksi lama.
        await tx.customer.updateMany({
          where: { businessId },
          data: { totalVisits: 0, totalSpent: 0, lastVisit: null },
        })
      }

      // 2. Customers
      if (deleteCustomers) {
        await tx.customer.deleteMany({ where: { businessId } })
      }

      // 3. Products (variants, toppings, categories, promos)
      if (deleteProducts) {
        // Must delete inventory first if also cleaning products
        await tx.stockMovement.deleteMany({
          where: { stock: { outlet: { businessId } } },
        })
        await tx.stock.deleteMany({
          where: { outlet: { businessId } },
        })
        await tx.stockTransferItem.deleteMany({
          where: { transfer: { businessId } },
        })
        await tx.stockTransfer.deleteMany({ where: { businessId } })
        await tx.promoBundle.deleteMany({
          where: { promo: { businessId } },
        })
        await tx.promo.deleteMany({ where: { businessId } })
        await tx.productTopping.deleteMany({
          where: { product: { businessId } },
        })
        await tx.productVariant.deleteMany({
          where: { product: { businessId } },
        })
        await tx.product.deleteMany({ where: { businessId } })
        await tx.category.deleteMany({ where: { businessId } })
      }

      // 4. Inventory only (without deleting products)
      if (deleteInventory && !deleteProducts) {
        await tx.stockMovement.deleteMany({
          where: { stock: { outlet: { businessId } } },
        })
        await tx.stock.deleteMany({
          where: { outlet: { businessId } },
        })
        await tx.stockTransferItem.deleteMany({
          where: { transfer: { businessId } },
        })
        await tx.stockTransfer.deleteMany({ where: { businessId } })
      }

      // 5. Employees (except owner)
      if (deleteEmployees) {
        await tx.employeeOutlet.deleteMany({
          where: {
            employee: {
              businessId,
              userId: { not: context.userId },
            },
          },
        })
        // Keep the owner's employee record
        await tx.employee.deleteMany({
          where: {
            businessId,
            userId: { not: context.userId },
          },
        })
        // Delete non-system roles
        await tx.role.deleteMany({
          where: { businessId, isSystem: false },
        })
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/products")
    revalidatePath("/inventory")
    revalidatePath("/customers")
    revalidatePath("/employees")
    revalidatePath("/reports")

    return { success: true }
  } catch (error) {
    console.error("Cleansing data error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus data",
    }
  }
}
