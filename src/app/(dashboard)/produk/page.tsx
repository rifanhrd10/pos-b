import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProductCatalogManager } from "@/components/products/product-catalog-manager";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      images: { where: { deletedAt: null, isPrimary: true }, take: 1 },
      modifierGroups: { include: { modifierGroup: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk"
        description="Kelola produk melalui halaman khusus agar form lebih nyaman untuk foto, harga, stok, dan relasi topping."
        breadcrumb="Master Data / Produk"
        actions={
          <Link href="/produk/tambah">
            <Button>Tambah Produk</Button>
          </Link>
        }
      />

      <ProductCatalogManager
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          categoryName: product.category.name,
          imageUrl: product.images[0]?.imageUrl || product.imageUrl || "/images/products/product-placeholder.svg",
          sellPrice: product.sellPrice,
          stock: product.stock,
          isActive: product.isActive,
          modifierGroups: product.modifierGroups.map((group) => ({ id: group.id, name: group.modifierGroup.name })),
        }))}
      />
    </div>
  );
}
