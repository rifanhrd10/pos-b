"use server";

import { auth, getBusinessContext } from "@/lib/auth";
import { parseCurrencyValue } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { masterToppingSchema, masterVariantOptionSchema, masterVariantSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireBusiness() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) return { error: "Business not found" as const };
  return { businessId: ctx.businessId };
}

type RawVariantOption = {
  id?: string;
  name?: string;
  priceAdjustment?: unknown;
  isActive?: boolean;
  sortOrder?: number;
};

function parseVariantOptions(formData: FormData) {
  const raw = formData.get("options");
  let parsed: RawVariantOption[] = [];

  if (raw) {
    try {
      const json = JSON.parse(String(raw));
      parsed = Array.isArray(json) ? json : [];
    } catch {
      parsed = [];
    }
  }

  const cleaned = parsed
    .map((option, index) => ({
      id: option.id,
      name: String(option.name ?? "").trim(),
      priceAdjustment: parseCurrencyValue(String(option.priceAdjustment ?? "0")) ?? 0,
      isActive: option.isActive !== false,
      sortOrder: typeof option.sortOrder === "number" ? option.sortOrder : index,
    }))
    .filter((option) => option.name.length > 0);

  if (cleaned.length === 0) {
    return { error: "Minimal 1 pilihan varian wajib diisi" as const };
  }

  const duplicate = cleaned.find(
    (option, index) =>
      cleaned.findIndex((item) => item.name.toLowerCase() === option.name.toLowerCase()) !== index
  );
  if (duplicate) {
    return { error: `Pilihan varian "${duplicate.name}" duplikat` as const };
  }

  const safeOptions = [];
  for (const option of cleaned) {
    const safe = masterVariantOptionSchema.safeParse(option);
    if (!safe.success) return { error: safe.error.issues[0].message };
    safeOptions.push(safe.data);
  }

  return { options: safeOptions };
}

function revalidateMasterVariantPaths() {
  revalidatePath("/master-variants");
  revalidatePath("/products");
  revalidatePath("/pos");
}

export async function getMasterVariants(businessId?: string, includeInactive = true) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return [];
  if (businessId && businessId !== ctx.businessId) return [];

  return prisma.masterVariant.findMany({
    where: { businessId: ctx.businessId, ...(includeInactive ? {} : { isActive: true }) },
    include: {
      options: {
        where: includeInactive ? {} : { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: { select: { productGroups: true } },
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getMasterToppings(businessId?: string, includeInactive = true) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return [];
  if (businessId && businessId !== ctx.businessId) return [];

  return prisma.masterTopping.findMany({
    where: { businessId: ctx.businessId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ name: "asc" }],
  });
}

export async function createMasterVariant(formData: FormData) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = masterVariantSchema.safeParse({
    name: formData.get("name"),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const optionResult = parseVariantOptions(formData);
  if ("error" in optionResult) return { error: optionResult.error };

  try {
    await prisma.masterVariant.create({
      data: {
        businessId: ctx.businessId,
        name: parsed.data.name,
        isActive: parsed.data.isActive ?? true,
        options: {
          create: optionResult.options.map((option, index) => ({
            name: option.name,
            priceAdjustment: option.priceAdjustment,
            isActive: option.isActive ?? true,
            sortOrder: option.sortOrder ?? index,
          })),
        },
      },
    });
    revalidateMasterVariantPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Nama grup varian atau pilihan sudah ada" };
    }
    return { error: "Gagal menyimpan master varian" };
  }
}

export async function updateMasterVariant(id: string, formData: FormData) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const variant = await prisma.masterVariant.findFirst({
    where: { id, businessId: ctx.businessId },
    include: { options: { select: { id: true } } },
  });
  if (!variant) return { error: "Master varian tidak ditemukan" };

  const parsed = masterVariantSchema.safeParse({
    name: formData.get("name"),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const optionResult = parseVariantOptions(formData);
  if ("error" in optionResult) return { error: optionResult.error };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.masterVariant.update({
        where: { id },
        data: { name: parsed.data.name, isActive: parsed.data.isActive ?? true },
      });

      const incomingIds = optionResult.options
        .map((option) => option.id)
        .filter((optionId): optionId is string => Boolean(optionId));

      await tx.masterVariantOption.deleteMany({
        where: { masterVariantId: id, id: { notIn: incomingIds } },
      });

      for (const [index, option] of optionResult.options.entries()) {
        const data = {
          name: option.name,
          priceAdjustment: option.priceAdjustment,
          isActive: option.isActive ?? true,
          sortOrder: option.sortOrder ?? index,
        };

        if (option.id && variant.options.some((existing) => existing.id === option.id)) {
          await tx.masterVariantOption.update({ where: { id: option.id }, data });
        } else {
          await tx.masterVariantOption.create({ data: { masterVariantId: id, ...data } });
        }
      }
    });

    revalidateMasterVariantPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Nama grup varian atau pilihan sudah ada" };
    }
    return { error: "Gagal memperbarui master varian" };
  }
}

export async function deleteMasterVariant(id: string) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const variant = await prisma.masterVariant.findFirst({
    where: { id, businessId: ctx.businessId },
    include: { _count: { select: { productGroups: true } } },
  });
  if (!variant) return { error: "Master varian tidak ditemukan" };

  if (variant._count.productGroups > 0) {
    await prisma.masterVariant.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.masterVariant.delete({ where: { id } });
  }

  revalidateMasterVariantPaths();
  return { success: true };
}

export async function createMasterTopping(formData: FormData) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = masterToppingSchema.safeParse({
    name: formData.get("name"),
    price: parseCurrencyValue(formData.get("price")) ?? 0,
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.masterTopping.create({
      data: { businessId: ctx.businessId, ...parsed.data, isActive: parsed.data.isActive ?? true },
    });
    revalidatePath("/master-toppings");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Topping dengan nama tersebut sudah ada" };
    }
    return { error: "Gagal menyimpan master topping" };
  }
}

export async function updateMasterTopping(id: string, formData: FormData) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const topping = await prisma.masterTopping.findFirst({
    where: { id, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!topping) return { error: "Master topping tidak ditemukan" };

  const parsed = masterToppingSchema.safeParse({
    name: formData.get("name"),
    price: parseCurrencyValue(formData.get("price")) ?? 0,
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.masterTopping.update({ where: { id }, data: parsed.data });
    revalidatePath("/master-toppings");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Topping dengan nama tersebut sudah ada" };
    }
    return { error: "Gagal memperbarui master topping" };
  }
}

export async function deleteMasterTopping(id: string) {
  const ctx = await requireBusiness();
  if ("error" in ctx) return { error: ctx.error };

  const topping = await prisma.masterTopping.findFirst({
    where: { id, businessId: ctx.businessId },
    include: { _count: { select: { productToppings: true } } },
  });
  if (!topping) return { error: "Master topping tidak ditemukan" };

  if (topping._count.productToppings > 0) {
    await prisma.masterTopping.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.masterTopping.delete({ where: { id } });
  }

  revalidatePath("/master-toppings");
  return { success: true };
}
