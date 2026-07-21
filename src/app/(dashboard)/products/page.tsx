import { auth, getBusinessContext } from "@/lib/auth";
import { getProducts } from "@/actions/products";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsTable, type ProductTableRow } from "./products-table";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const products = await getProducts(ctx.businessId);
  const productRows: ProductTableRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    categoryName: product.category?.name ?? null,
    basePrice: Number(product.basePrice),
    variantsCount: product._count.variants,
    toppingsCount: product._count.toppings,
    isActive: product.isActive,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produk</h1>
          <p className="text-sm text-slate-500">Kelola katalog produk Anda</p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <ProductsTable products={productRows} />
    </div>
  );
}
