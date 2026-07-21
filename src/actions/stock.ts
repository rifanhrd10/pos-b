"use server";

import { prisma } from "@/lib/prisma";
import { auth, getBusinessContext } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";
import { adjustStockSchema } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdjustStockData {
  outletId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  type: StockMovementType;
  note?: string;
  reference?: string;
  createdBy?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getStockOverview(businessId: string, outletId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const products = await prisma.product.findMany({
    where: { businessId, isActive: true, trackStock: true },
    include: {
      category: { select: { id: true, name: true } },
      stocks: {
        where: outletId ? { outletId } : undefined,
        include: {
          outlet: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return products.map((product) => ({
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    categoryName: product.category?.name ?? null,
    trackStock: product.trackStock,
    stocks: product.stocks.map((s) => ({
      stockId: s.id,
      outletId: s.outletId,
      outletName: s.outlet.name,
      quantity: s.quantity,
      minStock: s.minStock,
    })),
  }));
}

export async function getStockByProduct(productId: string, outletId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const stock = await prisma.stock.findFirst({
    where: { outletId, productId, variantId: null },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      outlet: { select: { id: true, name: true } },
      variant: true,
      movements: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!stock) return null;
  return stock;
}

export async function getLowStockItems(businessId: string, outletId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const stocks = await prisma.stock.findMany({
    where: {
      product: { businessId },
      ...(outletId ? { outletId } : {}),
    },
    include: {
      product: { select: { id: true, name: true, sku: true, trackStock: true } },
      outlet: { select: { id: true, name: true } },
    },
  });

  // Note: Prisma doesn't support column-to-column comparisons natively.
  // Filtering quantity <= minStock is done in-memory after fetching all stocks.
  // For very large catalogs, consider using a raw SQL query for performance.
  return stocks.filter(
    (s) => s.product.trackStock && s.quantity <= s.minStock
  );
}

export async function getMovementHistory(stockId: string, limit = 50) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  return prisma.stockMovement.findMany({
    where: { stockId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRecentMovements(businessId: string, limit = 100) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const movements = await prisma.stockMovement.findMany({
    where: {
      stock: {
        product: { businessId, trackStock: true },
      },
    },
    include: {
    stock: {
      include: {
        product: { select: { id: true, name: true, sku: true } },
          outlet: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return movements.map((m) => ({
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    stockBefore: m.stockBefore,
    stockAfter: m.stockAfter,
    note: m.note,
    reference: m.reference,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    productId: m.stock.product.id,
    productName: m.stock.product.name,
    productSku: m.stock.product.sku,
    outletId: m.stock.outletId,
    outletName: m.stock.outlet.name,
  }));
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function adjustStock(data: AdjustStockData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  // Zod validation
  const parsed = adjustStockSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const { outletId, productId, variantId, quantity, type, note, reference, createdBy } =
      data;

    const result = await prisma.$transaction(async (tx) => {
      const outlet = await tx.outlet.findFirst({
        where: { id: outletId, businessId: ctx.businessId },
        select: { id: true },
      });
      if (!outlet) throw new Error("Forbidden");

      const product = await tx.product.findFirst({
        where: { id: productId, businessId: ctx.businessId, trackStock: true, isActive: true },
        select: { id: true },
      });
      if (!product) throw new Error("Produk tidak dilacak stoknya atau tidak ditemukan");

      if ((type === "IN" || type === "OUT") && quantity <= 0) {
        throw new Error("Jumlah harus lebih dari 0");
      }

      const existing = await tx.stock.findFirst({
        where: { outletId, productId, variantId: variantId ?? null },
      });
      const currentQty = existing?.quantity ?? 0;

      let newQty: number;
      let delta: number;
      switch (type) {
        case "IN":
          delta = quantity;
          newQty = currentQty + quantity;
          break;
        case "OUT":
          delta = -quantity;
          newQty = currentQty - quantity;
          if (newQty < 0) throw new Error("Stok keluar melebihi stok tersedia");
          break;
        case "ADJUSTMENT":
          delta = quantity - currentQty;
          newQty = quantity;
          break;
        default:
          delta = quantity;
          newQty = currentQty + quantity;
          break;
      }

      const stock = existing
        ? await tx.stock.update({ where: { id: existing.id }, data: { quantity: newQty } })
        : await tx.stock.create({ data: { outletId, productId, variantId: variantId ?? undefined, quantity: newQty } });

      await tx.stockMovement.create({
        data: {
          stockId: stock.id,
          type,
          quantity: delta,
          stockBefore: currentQty,
          stockAfter: newQty,
          note: note ?? null,
          reference: reference ?? null,
          createdBy: createdBy ?? session.user.id,
        },
      });

      return stock;
    });

    revalidatePath("/inventory");

    return { success: true, stock: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function setMinStock(stockId: string, minStock: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  try {
    // Ownership check: verify the stock's outlet belongs to the current user's business
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      include: { outlet: { select: { businessId: true } } },
    });
    if (!stock) return { success: false, error: "Stock not found" };
    if (stock.outlet.businessId !== ctx.businessId) return { success: false, error: "Forbidden" };

    await prisma.stock.update({
      where: { id: stockId },
      data: { minStock },
    });

    revalidatePath("/inventory");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
