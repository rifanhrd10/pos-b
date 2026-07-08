"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────

type CreatePromoData = {
  name: string;
  description?: string;
  type: "VOUCHER" | "BUNDLE" | "HAPPY_HOUR";
  discountType: "PERCENTAGE" | "NOMINAL";
  discountValue: number;
  code?: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  startHour?: number;
  endHour?: number;
  isActive?: boolean;
  bundleItems?: Array<{ productId: string; requiredQty: number; freeQty: number }>;
};

type UpdatePromoData = Partial<Omit<CreatePromoData, "bundleItems">> & {
  bundleItems?: Array<{ productId: string; requiredQty: number; freeQty: number }>;
};

// ─── CRUD (for admin dashboard) ───────────────────────────────

export async function getPromos(
  businessId: string,
  options?: { isActive?: boolean; type?: "VOUCHER" | "BUNDLE" | "HAPPY_HOUR" }
) {
  return prisma.promo.findMany({
    where: {
      businessId,
      ...(options?.isActive !== undefined ? { isActive: options.isActive } : {}),
      ...(options?.type ? { type: options.type } : {}),
    },
    include: {
      bundleItems: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromo(id: string) {
  return prisma.promo.findUnique({
    where: { id },
    include: {
      bundleItems: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });
}

export async function createPromo(
  businessId: string,
  data: CreatePromoData
): Promise<{ promo?: unknown; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Validate ownership
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  // Validate required fields
  if (!data.name || !data.name.trim()) {
    return { error: "Nama promo wajib diisi" };
  }
  if (data.discountValue <= 0) {
    return { error: "Nilai diskon harus lebih besar dari 0" };
  }

  // VOUCHER type requires code
  let code = data.code?.trim().toUpperCase();
  if (data.type === "VOUCHER") {
    if (!code) {
      return { error: "Kode voucher wajib diisi" };
    }

    // Check unique code per business
    const existing = await prisma.promo.findFirst({
      where: { businessId, code },
    });
    if (existing) {
      return { error: "Kode sudah dipakai" };
    }
  }

  // Create promo
  const promo = await prisma.promo.create({
    data: {
      businessId,
      name: data.name,
      description: data.description,
      type: data.type,
      discountType: data.discountType,
      discountValue: data.discountValue,
      code,
      minOrderAmount: data.minOrderAmount,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      startHour: data.startHour,
      endHour: data.endHour,
      isActive: data.isActive ?? true,
    },
  });

  // Create bundle items if provided
  if (data.bundleItems && data.bundleItems.length > 0) {
    await prisma.promoBundle.createMany({
      data: data.bundleItems.map((item) => ({
        promoId: promo.id,
        productId: item.productId,
        requiredQty: item.requiredQty,
        freeQty: item.freeQty,
      })),
    });
  }

  return { promo };
}

export async function updatePromo(
  id: string,
  data: UpdatePromoData
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  // Fetch promo and validate ownership
  const promo = await prisma.promo.findUnique({
    where: { id },
  });
  if (!promo) return { ok: false, error: "Promo tidak ditemukan" };

  const business = await prisma.business.findFirst({
    where: { id: promo.businessId, ownerId: session.user.id },
  });
  if (!business) return { ok: false, error: "Unauthorized" };

  // Validate code uniqueness if changing
  if (data.code) {
    const code = data.code.trim().toUpperCase();
    if (code !== promo.code) {
      const existing = await prisma.promo.findFirst({
        where: { businessId: promo.businessId, code },
      });
      if (existing) {
        return { ok: false, error: "Kode sudah dipakai" };
      }
      data.code = code;
    }
  }

  // Update promo
  await prisma.promo.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      discountType: data.discountType,
      discountValue: data.discountValue,
      code: data.code,
      minOrderAmount: data.minOrderAmount,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      startHour: data.startHour,
      endHour: data.endHour,
      isActive: data.isActive,
    },
  });

  // Update bundle items if provided
  if (data.bundleItems) {
    // Delete existing and create new
    await prisma.promoBundle.deleteMany({
      where: { promoId: id },
    });

    if (data.bundleItems.length > 0) {
      await prisma.promoBundle.createMany({
        data: data.bundleItems.map((item) => ({
          promoId: id,
          productId: item.productId,
          requiredQty: item.requiredQty,
          freeQty: item.freeQty,
        })),
      });
    }
  }

  return { ok: true };
}

export async function deletePromo(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  // Fetch promo and validate ownership
  const promo = await prisma.promo.findUnique({
    where: { id },
  });
  if (!promo) return { ok: false, error: "Promo tidak ditemukan" };

  const business = await prisma.business.findFirst({
    where: { id: promo.businessId, ownerId: session.user.id },
  });
  if (!business) return { ok: false, error: "Unauthorized" };

  // Delete (cascade deletes bundleItems + orderPromos)
  await prisma.promo.delete({
    where: { id },
  });

  return { ok: true };
}

export async function togglePromoStatus(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  // Fetch promo and validate ownership
  const promo = await prisma.promo.findUnique({
    where: { id },
  });
  if (!promo) return { ok: false, error: "Promo tidak ditemukan" };

  const business = await prisma.business.findFirst({
    where: { id: promo.businessId, ownerId: session.user.id },
  });
  if (!business) return { ok: false, error: "Unauthorized" };

  // Toggle isActive
  await prisma.promo.update({
    where: { id },
    data: { isActive: !promo.isActive },
  });

  return { ok: true };
}

// ─── POS — Apply Promo ────────────────────────────────────────

export async function getActivePromos(
  businessId: string,
  orderTotal: number
): Promise<unknown[]> {
  const now = new Date();

  return prisma.promo.findMany({
    where: {
      businessId,
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        { OR: [{ minOrderAmount: null }, { minOrderAmount: { lte: orderTotal } }] },
        { OR: [{ usageLimit: null }, { usageCount: { lt: prisma.promo.fields.usageLimit } }] },
      ],
    },
    include: {
      bundleItems: {
        include: {
          product: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function applyPromoByCode(
  orderId: string,
  code: string
): Promise<{ ok: boolean; discountAmount?: number; promoName?: string; error?: string }> {
  // Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order tidak ditemukan" };

  // Find promo by code
  const promo = await prisma.promo.findFirst({
    where: {
      businessId: order.businessId,
      code: code.trim().toUpperCase(),
    },
    include: {
      bundleItems: {
        include: {
          product: { select: { basePrice: true } },
        },
      },
    },
  });
  if (!promo) return { ok: false, error: "Kode promo tidak ditemukan" };

  // Validate promo
  const validation = await validatePromo(promo, order);
  if (!validation.ok) return { ok: false, error: validation.error };

  // Check not already applied
  const existing = await prisma.orderPromo.findFirst({
    where: { orderId, promoId: promo.id },
  });
  if (existing) {
    return { ok: false, error: "Promo sudah diterapkan" };
  }

  // Calculate discount
  const discountAmount = await calculateDiscount(promo, order);
  if (discountAmount <= 0) {
    return { ok: false, error: "Promo tidak dapat diterapkan pada order ini" };
  }

  // Create OrderPromo record
  await prisma.orderPromo.create({
    data: {
      orderId,
      promoId: promo.id,
      discountAmount,
    },
  });

  // Increment usage count
  await prisma.promo.update({
    where: { id: promo.id },
    data: { usageCount: { increment: 1 } },
  });

  // Recalculate order totals
  await recalculateOrderWithPromos(orderId);

  return { ok: true, discountAmount, promoName: promo.name };
}

export async function applyPromoById(
  orderId: string,
  promoId: string
): Promise<{ ok: boolean; discountAmount?: number; promoName?: string; error?: string }> {
  // Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order tidak ditemukan" };

  // Find promo
  const promo = await prisma.promo.findUnique({
    where: { id: promoId },
    include: {
      bundleItems: {
        include: {
          product: { select: { basePrice: true } },
        },
      },
    },
  });
  if (!promo || promo.businessId !== order.businessId) {
    return { ok: false, error: "Promo tidak ditemukan" };
  }

  // Validate promo
  const validation = await validatePromo(promo, order);
  if (!validation.ok) return { ok: false, error: validation.error };

  // Check not already applied
  const existing = await prisma.orderPromo.findFirst({
    where: { orderId, promoId: promo.id },
  });
  if (existing) {
    return { ok: false, error: "Promo sudah diterapkan" };
  }

  // Calculate discount
  const discountAmount = await calculateDiscount(promo, order);
  if (discountAmount <= 0) {
    return { ok: false, error: "Promo tidak dapat diterapkan pada order ini" };
  }

  // Create OrderPromo record
  await prisma.orderPromo.create({
    data: {
      orderId,
      promoId: promo.id,
      discountAmount,
    },
  });

  // Increment usage count
  await prisma.promo.update({
    where: { id: promo.id },
    data: { usageCount: { increment: 1 } },
  });

  // Recalculate order totals
  await recalculateOrderWithPromos(orderId);

  return { ok: true, discountAmount, promoName: promo.name };
}

export async function removePromo(
  orderId: string,
  promoId: string
): Promise<{ ok: boolean; error?: string }> {
  // Find and delete OrderPromo record
  const orderPromo = await prisma.orderPromo.findFirst({
    where: { orderId, promoId },
  });
  if (!orderPromo) {
    return { ok: false, error: "Promo tidak ditemukan pada order ini" };
  }

  await prisma.orderPromo.delete({
    where: { id: orderPromo.id },
  });

  // Decrement usage count
  await prisma.promo.update({
    where: { id: promoId },
    data: { usageCount: { decrement: 1 } },
  });

  // Recalculate order totals
  await recalculateOrderWithPromos(orderId);

  return { ok: true };
}

// ─── Private Helpers ──────────────────────────────────────────

async function validatePromo(
  promo: { isActive: boolean; startDate: Date | null; endDate: Date | null; minOrderAmount: number | null; usageLimit: number | null; usageCount: number; startHour: number | null; endHour: number | null },
  order: { subtotal: number }
): Promise<{ ok: boolean; error?: string }> {
  // Check active
  if (!promo.isActive) {
    return { ok: false, error: "Promo tidak aktif" };
  }

  // Check date period
  const now = new Date();
  if (promo.startDate && promo.startDate > now) {
    return { ok: false, error: "Promo belum dimulai" };
  }
  if (promo.endDate && promo.endDate < now) {
    return { ok: false, error: "Promo sudah berakhir" };
  }

  // Check happy hour
  if (promo.startHour !== null && promo.endHour !== null) {
    const currentHour = now.getHours();
    if (currentHour < promo.startHour || currentHour >= promo.endHour) {
      return { ok: false, error: `Promo hanya berlaku jam ${promo.startHour}:00 - ${promo.endHour}:00` };
    }
  }

  // Check usage limit
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return { ok: false, error: "Kuota promo sudah habis" };
  }

  // Check min order amount
  if (promo.minOrderAmount !== null && order.subtotal < promo.minOrderAmount) {
    return { ok: false, error: `Minimal pembelian Rp ${promo.minOrderAmount.toLocaleString("id-ID")}` };
  }

  return { ok: true };
}

async function calculateDiscount(
  promo: {
    type: string;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
    bundleItems: Array<{ productId: string; requiredQty: number; freeQty: number; product: { basePrice: number } }>;
  },
  order: { subtotal: number; items: Array<{ productId: string; quantity: number; price: number }> }
): Promise<number> {
  if (promo.type === "BUNDLE") {
    // For BUNDLE type, check each bundle item requirement
    let totalBundleDiscount = 0;

    for (const bundleItem of promo.bundleItems) {
      // Find matching order items
      const orderItems = order.items.filter((item) => item.productId === bundleItem.productId);
      const totalQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      // Check if required qty met
      if (totalQty >= bundleItem.requiredQty) {
        // Calculate free items value
        const freeItemValue = bundleItem.freeQty * bundleItem.product.basePrice;
        totalBundleDiscount += freeItemValue;
      }
    }

    return totalBundleDiscount;
  }

  // VOUCHER or HAPPY_HOUR
  if (promo.discountType === "PERCENTAGE") {
    const discount = order.subtotal * (promo.discountValue / 100);
    return Math.min(discount, promo.maxDiscount ?? Infinity);
  }

  // NOMINAL
  return Math.min(promo.discountValue, order.subtotal);
}

async function recalculateOrderWithPromos(orderId: string): Promise<void> {
  // 1. Fetch order with items + orderPromos
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      promos: true,
    },
  });
  if (!order) return;

  // 2. Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // 3. Sum all promo discounts
  const totalDiscount = order.promos.reduce((sum, promo) => sum + promo.discountAmount, 0);

  // 4. Fetch business for tax and service rates
  const business = await prisma.business.findUnique({
    where: { id: order.businessId },
    select: { taxRate: true, serviceRate: true },
  });

  const taxRate = business?.taxRate ?? 0;
  const serviceRate = business?.serviceRate ?? 0;

  // 5. Calculate tax and service
  const taxAmount = subtotal * (taxRate / 100);
  const serviceAmount = subtotal * (serviceRate / 100);

  // 6. Calculate total (minimum 0)
  const totalAmount = Math.max(0, subtotal + taxAmount + serviceAmount - totalDiscount);

  // 7. Update Order record
  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      serviceAmount,
      totalAmount,
    },
  });
}
