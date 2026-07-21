"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toPositiveInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function toSortOrder(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

async function getOwnedBusiness() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  if (!business) return { error: "Business not found" as const };
  return { businessId: business.id };
}

async function assertOutletOwned(outletId: string, businessId: string) {
  const outlet = await prisma.outlet.findFirst({
    where: { id: outletId, businessId },
    select: { id: true },
  });

  return Boolean(outlet);
}

function tableSyncChange(businessId: string, entityId: string, operation: "insert" | "update" | "delete") {
  return prisma.syncChange.create({
    data: {
      businessId,
      entityType: "table",
      entityId,
      operation,
    },
  });
}

export async function getTableMasterData(businessId: string) {
  const [outlets, tables] = await Promise.all([
    prisma.outlet.findMany({
      where: { businessId },
      select: { id: true, name: true, isActive: true },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    }),
    prisma.table.findMany({
      where: { businessId },
      include: {
        outlet: { select: { id: true, name: true } },
        _count: { select: { orders: true } },
      },
      orderBy: [{ outlet: { name: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return { outlets, tables };
}

export async function createTable(formData: FormData) {
  const ctx = await getOwnedBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const outletId = String(formData.get("outletId") || "");
  const name = String(formData.get("name") || "").trim();
  const capacity = toPositiveInt(formData.get("capacity"), 4);
  const sortOrder = toSortOrder(formData.get("sortOrder"), 0);

  if (!outletId) return { error: "Outlet wajib dipilih" };
  if (!name) return { error: "Nama meja wajib diisi" };

  const owned = await assertOutletOwned(outletId, ctx.businessId);
  if (!owned) return { error: "Outlet tidak ditemukan" };

  try {
    await prisma.$transaction(async (tx) => {
      const table = await tx.table.create({
        data: {
          businessId: ctx.businessId,
          outletId,
          name,
          capacity,
          sortOrder,
        },
        select: { id: true },
      });

      await tx.syncChange.create({
        data: {
          businessId: ctx.businessId,
          entityType: "table",
          entityId: table.id,
          operation: "insert",
        },
      });
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Nama meja sudah ada di outlet tersebut" };
    }
    return { error: "Gagal menambahkan meja" };
  }

  revalidatePath("/tables");
  revalidatePath("/pos");
  return { success: true };
}

export async function bulkCreateTables(formData: FormData) {
  const ctx = await getOwnedBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const outletId = String(formData.get("outletId") || "");
  const prefix = String(formData.get("prefix") || "Meja").trim() || "Meja";
  const startNumber = toPositiveInt(formData.get("startNumber"), 1);
  const count = Math.min(toPositiveInt(formData.get("count"), 10), 100);
  const capacity = toPositiveInt(formData.get("capacity"), 4);

  if (!outletId) return { error: "Outlet wajib dipilih" };

  const owned = await assertOutletOwned(outletId, ctx.businessId);
  if (!owned) return { error: "Outlet tidak ditemukan" };

  const existing = await prisma.table.findMany({
    where: { outletId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((table) => table.name.toLowerCase()));

  const rows = Array.from({ length: count }, (_, index) => {
    const number = startNumber + index;
    return {
      businessId: ctx.businessId,
      outletId,
      name: `${prefix} ${number}`,
      capacity,
      sortOrder: number,
    };
  }).filter((table) => !existingNames.has(table.name.toLowerCase()));

  if (rows.length === 0) {
    return { error: "Semua nama meja yang akan dibuat sudah ada" };
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.table.create({
        data: row,
        select: { id: true },
      })
    )
  );

  const createdTables = await prisma.table.findMany({
    where: {
      outletId,
      name: { in: rows.map((row) => row.name) },
    },
    select: { id: true },
  });

  if (createdTables.length > 0) {
    await prisma.syncChange.createMany({
      data: createdTables.map((table) => ({
        businessId: ctx.businessId,
        entityType: "table",
        entityId: table.id,
        operation: "insert",
      })),
    });
  }

  revalidatePath("/tables");
  revalidatePath("/pos");
  return { success: true, created: rows.length };
}

export async function updateTable(id: string, formData: FormData) {
  const ctx = await getOwnedBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const outletId = String(formData.get("outletId") || "");
  const name = String(formData.get("name") || "").trim();
  const capacity = toPositiveInt(formData.get("capacity"), 4);
  const sortOrder = toSortOrder(formData.get("sortOrder"), 0);

  if (!outletId) return { error: "Outlet wajib dipilih" };
  if (!name) return { error: "Nama meja wajib diisi" };

  const [table, ownedOutlet] = await Promise.all([
    prisma.table.findFirst({
      where: { id, businessId: ctx.businessId },
      select: { id: true },
    }),
    assertOutletOwned(outletId, ctx.businessId),
  ]);

  if (!table) return { error: "Meja tidak ditemukan" };
  if (!ownedOutlet) return { error: "Outlet tidak ditemukan" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.table.update({
        where: { id },
        data: { outletId, name, capacity, sortOrder },
      });

      await tx.syncChange.create({
        data: {
          businessId: ctx.businessId,
          entityType: "table",
          entityId: id,
          operation: "update",
        },
      });
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Nama meja sudah ada di outlet tersebut" };
    }
    return { error: "Gagal memperbarui meja" };
  }

  revalidatePath("/tables");
  revalidatePath("/pos");
  return { success: true };
}

export async function toggleTableStatus(id: string) {
  const ctx = await getOwnedBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const table = await prisma.table.findFirst({
    where: { id, businessId: ctx.businessId },
    select: { id: true, isActive: true },
  });

  if (!table) return { error: "Meja tidak ditemukan" };

  await prisma.table.update({
    where: { id },
    data: { isActive: !table.isActive },
  });
  await tableSyncChange(ctx.businessId, id, "update");

  revalidatePath("/tables");
  revalidatePath("/pos");
  return { success: true };
}

export async function deleteTable(id: string) {
  const ctx = await getOwnedBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const table = await prisma.table.findFirst({
    where: { id, businessId: ctx.businessId },
    include: { _count: { select: { orders: true } } },
  });

  if (!table) return { error: "Meja tidak ditemukan" };
  if (table._count.orders > 0) {
    return { error: "Meja sudah pernah dipakai transaksi. Nonaktifkan saja agar riwayat tetap aman." };
  }

  await prisma.table.delete({ where: { id } });
  await tableSyncChange(ctx.businessId, id, "delete");

  revalidatePath("/tables");
  revalidatePath("/pos");
  return { success: true };
}
