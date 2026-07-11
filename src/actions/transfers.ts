"use server";

import { prisma } from "@/lib/prisma";
import { auth, getBusinessContext } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";
import { createTransferSchema } from "@/lib/validations";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransferItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateTransferData {
  businessId: string;
  fromOutletId: string;
  toOutletId: string;
  note?: string;
  createdBy: string;
  items: TransferItem[];
}

export interface TransferFilters {
  status?: string;
  fromOutletId?: string;
  toOutletId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Finds or creates a Stock record, then updates its quantity and records a
 * StockMovement — all within an existing Prisma transaction context.
 */
async function applyStockMovementInTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  opts: {
    outletId: string;
    productId: string;
    variantId: string | null;
    delta: number; // positive = IN, negative = OUT
    type: StockMovementType;
    transferId: string;
    createdBy: string;
  }
) {
  const { outletId, productId, variantId, delta, type, transferId, createdBy } = opts;

  // Resolve current stock
  const existing = await tx.stock.findFirst({
    where: { outletId, productId, variantId: variantId ?? null },
  });

  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + delta;

  // For OUT movements, ensure sufficient stock
  if (delta < 0 && newQty < 0) {
    throw new Error(
      `Insufficient stock for product ${productId}${variantId ? ` (variant ${variantId})` : ""} at outlet ${outletId}`
    );
  }

  let stock;
  if (variantId) {
    stock = await tx.stock.upsert({
      where: { outletId_productId_variantId: { outletId, productId, variantId } },
      update: { quantity: newQty },
      create: { outletId, productId, variantId, quantity: newQty },
    });
  } else if (existing) {
    stock = await tx.stock.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    stock = await tx.stock.create({
      data: { outletId, productId, quantity: newQty },
    });
  }

  await tx.stockMovement.create({
    data: {
      stockId: stock.id,
      type,
      quantity: delta,
      reference: transferId,
      createdBy,
    },
  });

  return stock;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getTransfers(businessId: string, filters?: TransferFilters) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const transfers = await prisma.stockTransfer.findMany({
      where: {
        businessId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.fromOutletId ? { fromOutletId: filters.fromOutletId } : {}),
        ...(filters?.toOutletId ? { toOutletId: filters.toOutletId } : {}),
      },
      include: {
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Resolve outlet names and creator info
    const outletIds = [
      ...new Set(transfers.flatMap((t) => [t.fromOutletId, t.toOutletId])),
    ];
    const userIds = [...new Set(transfers.map((t) => t.createdBy))];

    const [outlets, users] = await Promise.all([
      prisma.outlet.findMany({
        where: { id: { in: outletIds } },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      }),
    ]);

    const outletMap = Object.fromEntries(outlets.map((o) => [o.id, o]));
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    return transfers.map((t) => ({
      ...t,
      itemCount: t.items.length,
      fromOutlet: outletMap[t.fromOutletId] ?? null,
      toOutlet: outletMap[t.toOutletId] ?? null,
      createdByUser: userMap[t.createdBy] ?? null,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}

export async function getTransfer(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            // StockTransferItem has no direct product/variant relation in schema —
            // we resolve them manually below
          },
        },
      },
    });

    if (!transfer) return { error: "Transfer not found" };

    // Resolve outlet names
    const [fromOutlet, toOutlet] = await Promise.all([
      prisma.outlet.findUnique({
        where: { id: transfer.fromOutletId },
        select: { id: true, name: true },
      }),
      prisma.outlet.findUnique({
        where: { id: transfer.toOutletId },
        select: { id: true, name: true },
      }),
    ]);

    // Resolve product + variant names for items
    const productIds = [...new Set(transfer.items.map((i) => i.productId))];
    const variantIds = [
      ...new Set(transfer.items.map((i) => i.variantId).filter(Boolean) as string[]),
    ];

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      }),
      variantIds.length > 0
        ? prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]));

    return {
      ...transfer,
      fromOutlet,
      toOutlet,
      items: transfer.items.map((item) => ({
        ...item,
        product: productMap[item.productId] ?? null,
        variant: item.variantId ? (variantMap[item.variantId] ?? null) : null,
      })),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}

export async function createTransfer(data: CreateTransferData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  // Zod validation (validates fromOutletId, toOutletId, items)
  const parsed = createTransferSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const { businessId, fromOutletId, toOutletId, note, createdBy, items } = data;

    // Ownership check: businessId in payload must match authenticated user's business
    if (businessId !== ctx.businessId) return { success: false, error: "Forbidden" };

    const transfer = await prisma.stockTransfer.create({
      data: {
        businessId,
        fromOutletId,
        toOutletId,
        note: note ?? null,
        status: "pending",
        createdBy,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    revalidatePath("/inventory/transfers");

    return { success: true, transfer };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function approveTransfer(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  try {
    const transfer = await prisma.stockTransfer.findUnique({ where: { id } });

    if (!transfer) return { success: false, error: "Transfer not found" };
    if (transfer.businessId !== ctx.businessId) return { success: false, error: "Forbidden" };
    if (transfer.status !== "pending") {
      return { success: false, error: `Cannot approve a transfer with status "${transfer.status}"` };
    }

    await prisma.stockTransfer.update({
      where: { id },
      data: { status: "in_transit" },
    });

    revalidatePath("/inventory/transfers");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function receiveTransfer(id: string, receivedBy: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  try {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer) return { success: false, error: "Transfer not found" };
    if (transfer.businessId !== ctx.businessId) return { success: false, error: "Forbidden" };
    if (transfer.status !== "in_transit") {
      return {
        success: false,
        error: `Cannot receive a transfer with status "${transfer.status}"`,
      };
    }

    await prisma.$transaction(async (tx) => {
      // Deduct stock from source outlet and add to destination outlet atomically
      for (const item of transfer.items) {
        // OUT from fromOutlet
        await applyStockMovementInTx(tx, {
          outletId: transfer.fromOutletId,
          productId: item.productId,
          variantId: item.variantId ?? null,
          delta: -item.quantity,
          type: "TRANSFER",
          transferId: transfer.id,
          createdBy: receivedBy,
        });

        // IN to toOutlet
        await applyStockMovementInTx(tx, {
          outletId: transfer.toOutletId,
          productId: item.productId,
          variantId: item.variantId ?? null,
          delta: item.quantity,
          type: "TRANSFER",
          transferId: transfer.id,
          createdBy: receivedBy,
        });
      }

      // Mark transfer as received
      await tx.stockTransfer.update({
        where: { id },
        data: { status: "received", completedAt: new Date() },
      });
    });

    revalidatePath("/inventory/transfers");
    revalidatePath("/inventory");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function cancelTransfer(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { success: false, error: "Business not found" };

  try {
    const transfer = await prisma.stockTransfer.findUnique({ where: { id } });

    if (!transfer) return { success: false, error: "Transfer not found" };
    if (transfer.businessId !== ctx.businessId) return { success: false, error: "Forbidden" };
    if (transfer.status !== "pending" && transfer.status !== "in_transit") {
      return {
        success: false,
        error: `Cannot cancel a transfer with status "${transfer.status}"`,
      };
    }

    await prisma.stockTransfer.update({
      where: { id },
      data: { status: "cancelled" },
    });

    revalidatePath("/inventory/transfers");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
