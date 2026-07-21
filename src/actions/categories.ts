"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function getCategories(businessId: string) {
  return prisma.category.findMany({
    where: { businessId },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) return null;

  return prisma.category.findFirst({
    where: { id, businessId: business.id },
  });
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, description } = result.data;

  const duplicate = await prisma.category.findFirst({
    where: { businessId: business.id, name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicate) return { error: "Nama kategori sudah digunakan" };

  await prisma.category.create({
    data: {
      businessId: business.id,
      name,
      description,
    },
  });

  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) return { error: "Business not found" };

  const category = await prisma.category.findFirst({
    where: { id, businessId: business.id },
    select: { id: true },
  });
  if (!category) return { error: "Category not found" };

  const { name, description } = result.data;

  const duplicate = await prisma.category.findFirst({
    where: {
      businessId: business.id,
      id: { not: id },
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (duplicate) return { error: "Nama kategori sudah digunakan" };

  await prisma.category.update({
    where: { id },
    data: { name, description },
  });

  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const category = await prisma.category.findFirst({
    where: { id, businessId: business.id },
  });
  if (!category) return { error: "Category not found" };

  await prisma.product.updateMany({
    where: { businessId: business.id, categoryId: id },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id } });

  return { success: true };
}
