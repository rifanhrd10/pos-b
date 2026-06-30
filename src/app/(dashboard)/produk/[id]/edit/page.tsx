import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { decimalToNumber } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, modifierGroups] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { modifierGroups: true },
    }),
    prisma.category.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.modifierGroup.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product || product.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${product.name}`}
        description="Perbarui informasi produk tanpa mengubah riwayat transaksi yang sudah tersimpan sebagai snapshot."
        breadcrumb="Master Data / Produk / Edit"
      />
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          description: product.description,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          sellPrice: decimalToNumber(product.sellPrice),
          costPrice: decimalToNumber(product.costPrice),
          stock: product.stock,
          minStock: product.minStock,
          isStockTracked: product.isStockTracked,
          isActive: product.isActive,
          modifierGroupIds: product.modifierGroups.map((item) => item.modifierGroupId),
        }}
        categories={categories.map((item) => ({ id: item.id, name: item.name }))}
        modifierGroups={modifierGroups.map((item) => ({ id: item.id, name: item.name }))}
      />
    </div>
  );
}
