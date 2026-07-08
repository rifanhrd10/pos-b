"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";

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

  // Fetch all products belonging to the business
  const products = await prisma.product.findMany({
    where: { businessId, isActive: true },
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

  // Filter client-side so we can compare quantity <= minStock
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

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function adjustStock(data: AdjustStockData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const { outletId, productId, variantId, quantity, type, note, reference, createdBy } =
      data;

    // Validate quantity is positive for IN/OUT
    if ((type === "IN" || type === "OUT") && quantity <= 0) {
      return { success: false, error: "Quantity must be positive" };
    }

    // Fetch or create Stock record (upsert)
    const existing = await prisma.stock.findFirst({
      where: {
        outletId,
        productId,
        variantId: variantId ?? null,
      },
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
        newQty = currentQty - quantity;
        if (newQty < 0) {
          return { success: false, error: "Insufficient stock" };
        }
        delta = -quantity;
        break;
      case "ADJUSTMENT":
        delta = quantity - currentQty;
        newQty = quantity;
        break;
      default:
        // TRANSFER / OPNAME: caller passes pre-computed delta
        delta = quantity;
        newQty = currentQty + quantity;
        break;
    }

    let stock;
    if (variantId) {
      stock = await prisma.stock.upsert({
        where: {
          outletId_productId_variantId: { outletId, productId, variantId },
        },
        update: { quantity: newQty },
        create: { outletId, productId, variantId, quantity: newQty },
      });
    } else if (existing) {
      stock = await prisma.stock.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      stock = await prisma.stock.create({
        data: { outletId, productId, quantity: newQty },
      });
    }

    await prisma.stockMovement.create({
      data: {
        stockId: stock.id,
        type,
        quantity: delta,
        note: note ?? null,
        reference: reference ?? null,
        createdBy: createdBy ?? session.user.id,
      },
    });

    revalidatePath("/inventory");

    return { success: true, stock };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function setMinStock(stockId: string, minStock: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
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
