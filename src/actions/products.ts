"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { parseCurrencyValue } from "@/lib/currency";

export async function getProducts(
  businessId: string,
  options?: { search?: string; categoryId?: string; isActive?: boolean }
) {
  return prisma.product.findMany({
    where: {
      businessId,
      ...(options?.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { sku: { contains: options.search, mode: "insensitive" } },
              { barcode: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options?.isActive !== undefined ? { isActive: options.isActive } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { variantGroups: true, toppings: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) return null;

  return prisma.product.findFirst({
    where: { id, businessId: business.id },
    include: {
      category: { select: { id: true, name: true } },
      variantGroups: { orderBy: { sortOrder: "asc" }, include: { masterVariant: { include: { options: true } } } },
      variants: { orderBy: { sortOrder: "asc" } },
      toppings: { orderBy: { id: "asc" }, include: { masterTopping: true } },
    },
  });
}

function parseIdList(value: FormDataEntryValue | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
  } catch {
    return [];
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    categoryId: (formData.get("categoryId") as string) || undefined,
    sku: (formData.get("sku") as string) || undefined,
    barcode: (formData.get("barcode") as string) || undefined,
    basePrice: parseCurrencyValue(formData.get("basePrice")),
    costPrice: parseCurrencyValue(formData.get("costPrice")),
    taxRate: (formData.get("taxRate") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    trackStock: formData.get("trackStock") === "true",
  };

  const result = productSchema.omit({ variants: true, toppings: true }).safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const variantGroupIds = parseIdList(formData.get("variantGroupIds"));
  const toppingIds = parseIdList(formData.get("toppingIds"));

  const [masterVariantGroups, masterToppings] = await Promise.all([
    prisma.masterVariant.findMany({
      where: { id: { in: variantGroupIds }, businessId: business.id, isActive: true, options: { some: { isActive: true } } },
      orderBy: [{ name: "asc" }],
    }),
    prisma.masterTopping.findMany({
      where: { id: { in: toppingIds }, businessId: business.id, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  await prisma.product.create({
    data: {
      businessId: business.id,
      ...result.data,
      variantGroups: {
        create: masterVariantGroups.map((variant, i) => ({
          masterVariantId: variant.id,
          sortOrder: i,
          isRequired: true,
        })),
      },
      toppings: {
        create: masterToppings.map((topping) => ({
          masterToppingId: topping.id,
          name: topping.name,
          price: topping.price,
        })),
      },
    },
  });

  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    categoryId: (formData.get("categoryId") as string) || undefined,
    sku: (formData.get("sku") as string) || undefined,
    barcode: (formData.get("barcode") as string) || undefined,
    basePrice: parseCurrencyValue(formData.get("basePrice")),
    costPrice: parseCurrencyValue(formData.get("costPrice")),
    taxRate: (formData.get("taxRate") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    trackStock: formData.get("trackStock") === "true",
  };

  const result = productSchema.omit({ variants: true, toppings: true }).safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) return { error: "Business not found" };

  const product = await prisma.product.findFirst({
    where: { id, businessId: business.id },
    select: { id: true },
  });
  if (!product) return { error: "Product not found" };

  const variantGroupIds = parseIdList(formData.get("variantGroupIds"));
  const toppingIds = parseIdList(formData.get("toppingIds"));
  const [masterVariantGroups, masterToppings] = await Promise.all([
    prisma.masterVariant.findMany({
      where: { id: { in: variantGroupIds }, businessId: business.id },
      orderBy: [{ name: "asc" }],
    }),
    prisma.masterTopping.findMany({
      where: { id: { in: toppingIds }, businessId: business.id },
      orderBy: { name: "asc" },
    }),
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.productVariantGroup.deleteMany({ where: { productId: id } });
    await tx.productTopping.deleteMany({ where: { productId: id } });
    await tx.product.update({
      where: { id },
      data: {
        ...result.data,
        variantGroups: {
          create: masterVariantGroups.map((variant, i) => ({
            masterVariantId: variant.id,
            sortOrder: i,
            isRequired: true,
          })),
        },
        toppings: {
          create: masterToppings.map((topping) => ({
            masterToppingId: topping.id,
            name: topping.name,
            price: topping.price,
          })),
        },
      },
    });
  });

  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const product = await prisma.product.findFirst({
    where: { id, businessId: business.id },
  });
  if (!product) return { error: "Product not found" };

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
}

export async function bulkUpdateProducts(ids: string[], data: { isActive?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  await prisma.product.updateMany({
    where: { id: { in: ids }, businessId: business.id },
    data,
  });

  return { success: true };
}
