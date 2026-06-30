import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryManager } from "@/components/forms/category-manager";

export default async function CategoryPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Produk"
        description="Gunakan modal cepat untuk menambah, mengedit, mengaktifkan, atau menghapus kategori. Jika kategori sudah dipakai produk, sistem akan melakukan soft delete."
        breadcrumb="Master Data / Kategori"
      />
      <CategoryManager
        initialCategories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          createdAt: category.createdAt.toISOString(),
          productCount: category._count.products,
        }))}
      />
    </div>
  );
}
