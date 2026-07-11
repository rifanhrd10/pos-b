import { auth, getBusinessContext } from "@/lib/auth";
import { getProducts } from "@/actions/products";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Filter, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const products = await getProducts(ctx.businessId);

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

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button variant="outline" className="sm:w-auto w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Nama Produk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kategori</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Harga</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Varian</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada produk. Klik "Tambah Produk" untuk mulai.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      <Link href={`/products/${product.id}`} className="hover:text-indigo-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{product.category?.name || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      Rp {Number(product.basePrice).toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {product._count.variants} varian, {product._count.toppings} topping
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={product.isActive ? "success" : "warning"}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <Link href={`/products/${product.id}/edit`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                          <Pencil size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
