"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface OpnameItem {
  stockId?: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  currentQty: number;
  sku?: string;
}

export interface SubmitOpnameItem {
  stockId?: string;
  productId: string;
  variantId?: string;
  actualQty: number;
}

export interface SubmitOpnameData {
  outletId: string;
  createdBy: string;
  items: SubmitOpnameItem[];
}

/**
 * Fetches all stock items for an outlet to populate the opname form.
 * Returns existing Stock records + trackStock products with no Stock record yet (qty=0).
 */
export async function startOpname(
  outletId: string,
  businessId: string
): Promise<{ success: true; items: OpnameItem[] } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Get all existing Stock records for this outlet, joining product + variant
    const existingStocks = await prisma.stock.findMany({
      where: { outletId },
      include: {
        product: { select: { id: true, name: true, sku: true, trackStock: true, businessId: true } },
        variant: { select: { id: true, name: true } },
      },
    });

    // Filter to only stocks belonging to this business
    const businessStocks = existingStocks.filter(
      (s) => s.product.businessId === businessId && s.product.trackStock
    );

    const items: OpnameItem[] = businessStocks.map((s) => ({
      stockId: s.id,
      productId: s.productId,
      variantId: s.variantId ?? undefined,
      productName: s.product.name,
      variantName: s.variant?.name ?? undefined,
      currentQty: s.quantity,
      sku: s.product.sku ?? undefined,
    }));

    // Find trackStock products (with variants) that have no Stock record for this outlet yet
    const trackedProducts = await prisma.product.findMany({
      where: { businessId, isActive: true, trackStock: true },
      include: {
        variants: { where: { isActive: true }, select: { id: true, name: true } },
      },
    });

    for (const product of trackedProducts) {
      if (product.variants.length === 0) {
        // Simple product (no variants) — check if already in items
        const alreadyExists = items.some(
          (i) => i.productId === product.id && !i.variantId
        );
        if (!alreadyExists) {
          items.push({
            productId: product.id,
            productName: product.name,
            currentQty: 0,
            sku: product.sku ?? undefined,
          });
        }
      } else {
        // Product with variants — check each variant
        for (const variant of product.variants) {
          const alreadyExists = items.some(
            (i) => i.productId === product.id && i.variantId === variant.id
          );
          if (!alreadyExists) {
            items.push({
              productId: product.id,
              variantId: variant.id,
              productName: product.name,
              variantName: variant.name,
              currentQty: 0,
              sku: product.sku ?? undefined,
            });
          }
        }
      }
    }

    return { success: true, items };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

/**
 * Submits a completed stock opname. All items are processed atomically.
 * Skips StockMovement creation for items with delta=0 to keep history clean.
 */
export async function submitOpname(
  data: SubmitOpnameData
): Promise<{ success: true; adjustedCount: number } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const { outletId, createdBy, items } = data;
    let adjustedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { stockId, productId, variantId, actualQty } = item;

        let currentQty = 0;
        let resolvedStockId: string;

        if (stockId) {
          // Existing stock record — fetch current quantity
          const stock = await tx.stock.findUnique({
            where: { id: stockId },
            select: { quantity: true },
          });
          if (!stock) throw new Error(`Stock record not found: ${stockId}`);
          currentQty = stock.quantity;
          resolvedStockId = stockId;
        } else {
          // No stock record yet — create one with quantity=0
          const newStock = await tx.stock.create({
            data: {
              outletId,
              productId,
              variantId: variantId ?? null,
              quantity: 0,
            },
          });
          currentQty = 0;
          resolvedStockId = newStock.id;
        }

        const delta = actualQty - currentQty;

        // Update stock quantity to the actual counted value
        await tx.stock.update({
          where: { id: resolvedStockId },
          data: { quantity: actualQty },
        });

        // Only create a movement record if there was a change
        if (delta !== 0) {
          await tx.stockMovement.create({
            data: {
              stockId: resolvedStockId,
              type: "OPNAME",
              quantity: delta,
              note: "Stock Opname",
              createdBy: createdBy ?? session.user!.id,
            },
          });
          adjustedCount++;
        }
      }
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/opname");

    return { success: true, adjustedCount };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
