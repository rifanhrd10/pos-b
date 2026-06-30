import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true, images: true, modifierGroups: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await requireSession();
  const payload = await request.json();
  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input produk tidak valid." }, { status: 400 });
  }

  const duplicate = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (duplicate && !duplicate.deletedAt) {
    return NextResponse.json({ message: "SKU produk sudah dipakai." }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      outletId: session.outletId || "",
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      sku: parsed.data.sku,
      barcode: parsed.data.barcode || null,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || "/images/products/product-placeholder.svg",
      sellPrice: parsed.data.sellPrice,
      costPrice: parsed.data.costPrice,
      stock: parsed.data.stock,
      minStock: parsed.data.minStock,
      isStockTracked: parsed.data.isStockTracked,
      isActive: parsed.data.isActive,
      modifierGroups: parsed.data.modifierGroupIds.length
        ? {
            createMany: {
              data: parsed.data.modifierGroupIds.map((modifierGroupId) => ({ modifierGroupId })),
            },
          }
        : undefined,
      images: parsed.data.imageUrl
        ? {
            create: {
              imageUrl: parsed.data.imageUrl,
              altText: parsed.data.name,
              isPrimary: true,
            },
          }
        : undefined,
    },
  });

  return NextResponse.json({ id: product.id, message: "Produk berhasil dibuat." });
}
