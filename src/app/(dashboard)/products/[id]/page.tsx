import { auth } from "@/lib/auth";
import { getProduct } from "@/actions/products";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Package className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">Detail produk</p>
          </div>
        </div>
        <div className="sm:ml-auto">
          <Badge tone={product.isActive ? "success" : "warning"}>{product.isActive ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-slate-900">Informasi Produk</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Kategori:</span> {product.category?.name || "-"}
            </div>
            <div>
              <span className="text-slate-500">Deskripsi:</span> {product.description || "-"}
            </div>
            <div>
              <span className="text-slate-500">SKU:</span> {product.sku || "-"}
            </div>
            <div>
              <span className="text-slate-500">Barcode:</span> {product.barcode || "-"}
            </div>
            <div>
              <span className="text-slate-500">Harga Jual:</span> Rp {Number(product.basePrice).toLocaleString("id-ID")}
            </div>
            <div>
              <span className="text-slate-500">Pajak:</span> {Number(product.taxRate)}%
            </div>
            <div>
              <span className="text-slate-500">Lacak Stok:</span> {product.trackStock ? "Ya" : "Tidak"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-semibold text-slate-900">Varian</h2>
            {product.variants.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {product.variants.map((v) => (
                  <li key={v.id} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span>{v.name}</span>
                    <span className="text-slate-500">+Rp {Number(v.priceAdjustment).toLocaleString("id-ID")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Tidak ada varian.</p>
            )}
          </div>

          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-semibold text-slate-900">Topping</h2>
            {product.toppings.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {product.toppings.map((t) => (
                  <li key={t.id} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span>{t.name}</span>
                    <span className="text-slate-500">Rp {Number(t.price).toLocaleString("id-ID")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Tidak ada topping.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/products/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Produk
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="ghost">Kembali</Button>
        </Link>
      </div>
    </div>
  );
}
