import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      modifierGroups: { include: { modifierGroup: true } },
    },
  });
  if (!product || product.deletedAt) {
    return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input produk tidak valid." }, { status: 400 });
  }

  const duplicate = await prisma.product.findFirst({
    where: { sku: parsed.data.sku, NOT: { id } },
  });
  if (duplicate && !duplicate.deletedAt) {
    return NextResponse.json({ message: "SKU produk sudah dipakai." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
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
      },
    });

    await tx.productModifierGroup.deleteMany({ where: { productId: id } });
    if (parsed.data.modifierGroupIds.length) {
      await tx.productModifierGroup.createMany({
        data: parsed.data.modifierGroupIds.map((modifierGroupId) => ({ productId: id, modifierGroupId })),
      });
    }

    if (parsed.data.imageUrl) {
      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });

      const existing = await tx.productImage.findFirst({
        where: { productId: id, imageUrl: parsed.data.imageUrl },
      });

      if (existing) {
        await tx.productImage.update({
          where: { id: existing.id },
          data: { isPrimary: true, deletedAt: null },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: id,
            imageUrl: parsed.data.imageUrl,
            altText: parsed.data.name,
            isPrimary: true,
          },
        });
      }
    }
  });

  return NextResponse.json({ id, message: "Produk berhasil diperbarui." });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactionCount = await prisma.transactionItem.count({ where: { productId: id } });

  if (transactionCount > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return NextResponse.json({
      message: "Produk sudah memiliki riwayat transaksi sehingga dinonaktifkan dengan soft delete.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Produk berhasil dihapus." });
}
