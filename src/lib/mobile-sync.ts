import type { MobileAuthContext } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

const version = (date: Date) => date.getTime();

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
  changed?: Partial<Record<"category" | "product" | "outlet" | "customer", string[]>>
) {
  const primaryOutletId = context.outletIds[0];
  const [categories, products, outlets, customers] = await Promise.all([
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
    prisma.customer.findMany({
      where: {
        businessId: context.businessId,
        ...(changed?.customer ? { id: { in: changed.customer } } : {}),
      },
      orderBy: { name: "asc" },
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
      imageUrl: item.image,
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
