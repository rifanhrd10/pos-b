import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { ModifierManager } from "@/components/forms/modifier-manager";

export default async function ToppingPage() {
  const [groups, modifiers] = await Promise.all([
    prisma.modifierGroup.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            modifiers: { where: { deletedAt: null } },
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.modifier.findMany({
      where: { deletedAt: null },
      include: { modifierGroup: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Topping / Menu Tambahan"
        description="Kelola grup topping dan item topping yang akan dipakai produk di halaman kasir. Semua perubahan langsung tersimpan ke database."
        breadcrumb="Master Data / Topping"
      />
      <ModifierManager
        initialGroups={groups.map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          isRequired: group.isRequired,
          isActive: group.isActive,
          modifierCount: group._count.modifiers,
          productCount: group._count.products,
        }))}
        initialModifiers={modifiers.map((modifier) => ({
          id: modifier.id,
          modifierGroupId: modifier.modifierGroupId,
          groupName: modifier.modifierGroup.name,
          name: modifier.name,
          price: decimalToNumber(modifier.price),
          costPrice: modifier.costPrice ? decimalToNumber(modifier.costPrice) : null,
          sku: modifier.sku,
          stock: modifier.stock,
          isStockTracked: modifier.isStockTracked,
          isActive: modifier.isActive,
        }))}
      />
    </div>
  );
}
