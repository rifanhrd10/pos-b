import type { NextRequest } from "next/server";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { getEntitlement } from "@/lib/mobile-subscription";
import { catalogSnapshot, parseCursor } from "@/lib/mobile-sync";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const cursor = parseCursor(request.nextUrl.searchParams.get("cursor"));
    if (cursor === null) throw new MobileApiError(422, "INVALID_CURSOR", "Cursor sinkronisasi tidak valid");

    const changes = await prisma.syncChange.findMany({
      where: { businessId: context.businessId, sequence: { gt: cursor } },
      orderBy: { sequence: "asc" },
      take: 500,
    });
    const ids: Record<"category" | "product" | "outlet" | "customer" | "table", string[]> = {
      category: [],
      product: [],
      outlet: [],
      customer: [],
      table: [],
    };
    const deleted: { entityType: string; entityId: string; deletedAt: number }[] = [];
    for (const change of changes) {
      if (change.operation === "delete") {
        deleted.push({
          entityType: change.entityType,
          entityId: change.entityId,
          deletedAt: change.createdAt.getTime(),
        });
      } else if (change.entityType in ids) {
        ids[change.entityType as keyof typeof ids].push(change.entityId);
      }
    }

    const [catalog, entitlement] = await Promise.all([
      catalogSnapshot(context, {
        category: [...new Set(ids.category)],
        product: [...new Set(ids.product)],
        outlet: [...new Set(ids.outlet)],
        customer: [...new Set(ids.customer)],
        table: [...new Set(ids.table)],
      }),
      getEntitlement({
        businessId: context.businessId,
        sessionId: context.sessionId,
        deviceId: context.deviceId,
      }),
    ]);

    const tombstones = deleted.reduce(
      (result, item) => {
        const base = {
          id: item.entityId,
          version: item.deletedAt,
          updatedAt: item.deletedAt,
          deletedAt: item.deletedAt,
        };
        if (item.entityType === "category") {
          result.categories.push({ ...base, name: "", sortOrder: 0 });
        } else if (item.entityType === "product") {
          result.products.push({
            ...base,
            categoryId: null,
            name: "",
            description: null,
            basePrice: 0,
            imageUrl: null,
            stockQuantity: 0,
            isActive: false,
            variantGroups: [],
            variants: [],
            toppings: [],
          });
        } else if (item.entityType === "outlet") {
          result.outlets.push({
            ...base,
            businessId: context.businessId,
            name: "",
            address: null,
            isActive: false,
          });
        } else if (item.entityType === "table") {
          result.tables.push({
            ...base,
            businessId: context.businessId,
            outletId: "",
            name: "",
            capacity: 0,
            isActive: false,
            sortOrder: 0,
          });
        } else if (item.entityType === "customer") {
          result.customers.push({
            ...base,
            businessId: context.businessId,
            name: "",
            phone: null,
            email: null,
            notes: null,
          });
        }
        return result;
      },
      {
        categories: [] as typeof catalog.categories,
        products: [] as typeof catalog.products,
        outlets: [] as typeof catalog.outlets,
        tables: [] as typeof catalog.tables,
        customers: [] as typeof catalog.customers,
      }
    );

    return noStoreJson({
      cursor: (changes.at(-1)?.sequence ?? cursor).toString(),
      categories: [...catalog.categories, ...tombstones.categories],
      products: [...catalog.products, ...tombstones.products],
      outlets: [...catalog.outlets, ...tombstones.outlets],
      tables: [...catalog.tables, ...tombstones.tables],
      customers: [...catalog.customers, ...tombstones.customers],
      paymentMethods: catalog.paymentMethods,
      deleted,
      entitlement,
      serverTime: Date.now(),
      hasMore: changes.length === 500,
    });
  } catch (error) {
    return apiError(error);
  }
}
