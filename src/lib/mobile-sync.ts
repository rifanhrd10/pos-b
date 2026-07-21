import type { MobileAuthContext } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

const version = (date: Date) => date.getTime();

function mobileImageUrl(value: string | null) {
  if (!value || /^https?:\/\//i.test(value)) return value;
  const mediaBaseUrl = process.env.MOBILE_MEDIA_BASE_URL?.replace(/\/$/, "");
  return mediaBaseUrl ? `${mediaBaseUrl}/${value.replace(/^\//, "")}` : value;
}

export async function currentSyncCursor(businessId: string) {
  const latest = await prisma.syncChange.findFirst({
    where: { businessId },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  return (latest?.sequence ?? BigInt(0)).toString();
}

export async function catalogSnapshot(
  context: MobileAuthContext,
  changed?: Partial<Record<"category" | "product" | "outlet" | "customer" | "table", string[]>>
) {
  const primaryOutletId = context.selectedOutletId ?? context.outletIds[0];
  const [categories, products, outlets, tables, customers, paymentMethods] = await Promise.all([
    prisma.category.findMany({
      where: {
        businessId: context.businessId,
        ...(changed?.category ? { id: { in: changed.category } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: {
        businessId: context.businessId,
        ...(changed?.product ? { id: { in: changed.product } } : {}),
      },
      include: {
        stocks: primaryOutletId ? { where: { outletId: primaryOutletId } } : false,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.outlet.findMany({
      where: {
        businessId: context.businessId,
        id: { in: context.outletIds },
        ...(changed?.outlet ? { AND: { id: { in: changed.outlet } } } : {}),
      },
      orderBy: { name: "asc" },
    }),
    prisma.table.findMany({
      where: {
        businessId: context.businessId,
        outletId: { in: context.outletIds },
        ...(changed?.table ? { id: { in: changed.table } } : {}),
      },
      orderBy: [{ outlet: { name: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.customer.findMany({
      where: {
        businessId: context.businessId,
        ...(changed?.customer ? { id: { in: changed.customer } } : {}),
      },
      orderBy: { name: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { businessId: context.businessId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    categories: categories.map((item) => ({
      id: item.id,
      name: item.name,
      sortOrder: item.sortOrder,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
    products: products.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      basePrice: Math.round(item.basePrice),
      imageUrl: mobileImageUrl(item.image),
      stockQuantity: item.stocks.reduce((sum, stock) => sum + stock.quantity, 0),
      isActive: item.isActive,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
    outlets: outlets.map((item) => ({
      id: item.id,
      businessId: item.businessId,
      name: item.name,
      address: item.address,
      isActive: item.isActive,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
    tables: tables.map((item) => ({
      id: item.id,
      businessId: item.businessId,
      outletId: item.outletId,
      name: item.name,
      capacity: item.capacity,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
    customers: customers.map((item) => ({
      id: item.id,
      businessId: item.businessId,
      name: item.name,
      phone: item.phone,
      email: item.email,
      notes: item.notes,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
    paymentMethods: paymentMethods.map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      isEnabled: item.isEnabled,
      sortOrder: item.sortOrder,
      qrisImage: mobileImageUrl(item.qrisImage),
      qrisNote: item.qrisNote,
      provider: item.provider,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      walletNumber: item.walletNumber,
      walletName: item.walletName,
      version: version(item.updatedAt),
      updatedAt: item.updatedAt.getTime(),
      deletedAt: null as number | null,
    })),
  };
}

export function parseCursor(value: string | null) {
  if (!value) return BigInt(0);
  if (!/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}
