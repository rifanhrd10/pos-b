import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, rupiah } from "@/lib/utils";
import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      modifierGroups: { include: { modifierGroup: { include: { modifiers: true } } } },
    },
  });

  if (!product || product.deletedAt) notFound();

  const imageUrl = product.images[0]?.imageUrl || product.imageUrl || "/images/products/product-placeholder.svg";

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="Detail produk menampilkan snapshot foto utama, relasi kategori, harga, stok, dan modifier group yang akan muncul di halaman kasir."
        breadcrumb="Master Data / Produk / Detail"
        actions={
          <ProductDetailActions productId={product.id} productName={product.name} />
        }
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
          <Image src={imageUrl} alt={product.name} width={900} height={700} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              {product.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>}
              <Badge tone="info">{product.category.name}</Badge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Harga jual</p>
                <p className="mt-2 text-xl font-semibold text-bayaro-navy">{rupiah(decimalToNumber(product.sellPrice))}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Harga modal</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{rupiah(decimalToNumber(product.costPrice))}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Stok</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{product.stock}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">SKU</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{product.sku}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-500">{product.description || "Belum ada deskripsi produk."}</p>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Topping / Menu Tambahan</h2>
            <div className="mt-5 space-y-4">
              {product.modifierGroups.length ? (
                product.modifierGroups.map((group) => (
                  <div key={group.id} className="rounded-3xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{group.modifierGroup.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Minimal {group.modifierGroup.minSelect}, maksimal {group.modifierGroup.maxSelect}
                        </p>
                      </div>
                      {group.modifierGroup.isRequired ? <Badge tone="warning">Wajib</Badge> : <Badge>Opsional</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.modifierGroup.modifiers.map((modifier) => (
                        <Badge key={modifier.id} tone="info">
                          {modifier.name} +{rupiah(decimalToNumber(modifier.price))}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Produk ini belum memiliki modifier group.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
