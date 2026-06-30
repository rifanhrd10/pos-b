import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input kategori tidak valid." }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists && !exists.deletedAt) {
    return NextResponse.json({ message: "Slug kategori sudah dipakai." }, { status: 409 });
  }

  const category = await prisma.category.upsert({
    where: { slug },
    update: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
      deletedAt: null,
    },
    create: {
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
