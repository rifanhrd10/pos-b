"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema, variantSchema, toppingSchema } from "@/lib/validations";
import { z } from "zod";

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
      _count: { select: { variants: true, toppings: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      variants: { orderBy: { sortOrder: "asc" } },
      toppings: { orderBy: { id: "asc" } },
    },
  });
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
    basePrice: formData.get("basePrice"),
    costPrice: (formData.get("costPrice") as string) || undefined,
    taxRate: (formData.get("taxRate") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    trackStock: formData.get("trackStock") === "true",
  };

  const result = productSchema.omit({ variants: true, toppings: true }).safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  let variants: z.infer<typeof variantSchema>[] = [];
  let toppings: z.infer<typeof toppingSchema>[] = [];

  const variantsRaw = formData.get("variants") as string | null;
  if (variantsRaw) {
    try {
      variants = JSON.parse(variantsRaw);
    } catch {
      return { error: "Format varian/topping tidak valid" };
    }
  }

  const toppingsRaw = formData.get("toppings") as string | null;
  if (toppingsRaw) {
    try {
      toppings = JSON.parse(toppingsRaw);
    } catch {
      return { error: "Format varian/topping tidak valid" };
    }
  }

  await prisma.product.create({
    data: {
      businessId: business.id,
      ...result.data,
      variants: {
        create: variants.map((v, i) => ({ ...v, sortOrder: i })),
      },
      toppings: {
        create: toppings,
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
    basePrice: formData.get("basePrice"),
    costPrice: (formData.get("costPrice") as string) || undefined,
    taxRate: (formData.get("taxRate") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    trackStock: formData.get("trackStock") === "true",
  };

  const result = productSchema.omit({ variants: true, toppings: true }).safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  let variants: z.infer<typeof variantSchema>[] = [];
  let toppings: z.infer<typeof toppingSchema>[] = [];

  const variantsRaw = formData.get("variants") as string | null;
  if (variantsRaw) {
    try {
      variants = JSON.parse(variantsRaw);
    } catch {
      return { error: "Format varian/topping tidak valid" };
    }
  }

  const toppingsRaw = formData.get("toppings") as string | null;
  if (toppingsRaw) {
    try {
      toppings = JSON.parse(toppingsRaw);
    } catch {
      return { error: "Format varian/topping tidak valid" };
    }
  }

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productTopping.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...result.data,
        variants: {
          create: variants.map((v, i) => ({ ...v, sortOrder: i })),
        },
        toppings: {
          create: toppings,
        },
      },
    }),
  ]);

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
