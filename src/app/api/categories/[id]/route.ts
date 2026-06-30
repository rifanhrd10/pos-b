import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.deletedAt) {
    return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input kategori tidak valid." }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const duplicate = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (duplicate) {
    return NextResponse.json({ message: "Slug kategori sudah dipakai." }, { status: 409 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  const count = await prisma.product.count({ where: { categoryId: category.id, deletedAt: null } });
  return NextResponse.json({ ...category, createdAt: category.createdAt.toISOString(), productCount: count });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });

  if (productCount > 0) {
    await prisma.category.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return NextResponse.json({
      message: `Kategori tidak bisa dihapus permanen karena masih dipakai ${productCount} produk. Kategori dinonaktifkan.`,
    });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "Kategori berhasil dihapus." });
}
