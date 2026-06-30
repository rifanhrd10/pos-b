import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { decimalToNumber } from "@/lib/utils";
import { PosScreen } from "@/components/kasir/pos-screen";

export const dynamic = "force-dynamic";

export default async function KasirPage() {
  const session = await requireSession();
  const [products, categories, shift, paymentMethods] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        category: true,
        images: { where: { deletedAt: null, isPrimary: true }, take: 1 },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: { modifiers: { where: { deletedAt: null, isActive: true } } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.shift.findFirst({
      where: { userId: session.sub, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    }),
    prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#eef4ff] p-4 md:p-6 xl:p-7">
      <div className="mx-auto max-w-[1720px]">
        <PosScreen
          outletId={session.outletId || ""}
          cashierId={session.sub}
          shiftId={shift?.id}
          categories={categories.map((item) => ({ id: item.id, name: item.name }))}
          paymentMethods={paymentMethods.map((item) => ({ id: item.id, name: item.name, isAddon: item.isAddon }))}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            imageUrl: product.images[0]?.imageUrl || product.imageUrl,
            sellPrice: decimalToNumber(product.sellPrice),
            stock: product.stock,
            categoryId: product.categoryId,
            categoryName: product.category.name,
            modifierGroups: product.modifierGroups.map((group) => ({
              id: group.modifierGroup.id,
              name: group.modifierGroup.name,
              minSelect: group.modifierGroup.minSelect,
              maxSelect: group.modifierGroup.maxSelect,
              modifiers: group.modifierGroup.modifiers.map((modifier) => ({
                id: modifier.id,
                name: modifier.name,
                price: decimalToNumber(modifier.price),
              })),
            })),
          }))}
        />
      </div>
    </main>
  );
}
