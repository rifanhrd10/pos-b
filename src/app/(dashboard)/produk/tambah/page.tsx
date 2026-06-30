import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/forms/product-form";

export default async function AddProductPage() {
  const [categories, modifierGroups] = await Promise.all([
    prisma.category.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.modifierGroup.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Produk"
        description="Isi data produk, unggah foto, tentukan harga, stok, dan relasi topping agar langsung tampil di kasir."
        breadcrumb="Master Data / Produk / Tambah"
      />
      <ProductForm
        categories={categories.map((item) => ({ id: item.id, name: item.name }))}
        modifierGroups={modifierGroups.map((item) => ({ id: item.id, name: item.name }))}
      />
    </div>
  );
}
