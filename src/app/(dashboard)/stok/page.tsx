import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { StockAdjustmentManager } from "@/components/forms/stock-adjustment-manager";

export default async function StockPage() {
  const [trackedProducts, movements, modifiers] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, isStockTracked: true },
      include: { category: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    }),
    prisma.stockMovement.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { product: true, modifier: true },
    }),
    prisma.modifier.findMany({
      where: { deletedAt: null, isStockTracked: true },
      include: { modifierGroup: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok"
        description="Stok Bayaro difokuskan untuk produk yang memang perlu dihitung jumlahnya. Produk racikan bisa tetap dijual tanpa tracking stok sampai modul bahan baku dikembangkan."
        breadcrumb="Operasional / Stok"
        actions={<StockAdjustmentManager products={trackedProducts.map((product) => ({ id: product.id, name: product.name, stock: product.stock }))} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Stok Produk Terlacak</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Yang tampil di sini hanya produk dengan opsi <strong>lacak stok</strong> aktif, misalnya air mineral botol, roti kemasan, atau produk retail per unit.
          </p>
          <div className="mt-5 space-y-3">
            {trackedProducts.map((product) => (
              <div key={product.id} className="grid gap-3 rounded-3xl border border-slate-100 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] md:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.category.name}</p>
                </div>
                <div className="text-sm text-slate-700">Stok: {product.stock}</div>
                <div className="text-sm text-slate-700">Min: {product.minStock}</div>
                <div>{product.stock <= product.minStock ? <Badge tone="warning">Stok Rendah</Badge> : <Badge tone="success">Aman</Badge>}</div>
              </div>
            ))}
            {!trackedProducts.length ? <p className="text-sm text-slate-500">Belum ada produk yang mengaktifkan tracking stok.</p> : null}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Riwayat Pergerakan</h2>
            <div className="mt-5 space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{movement.product?.name || movement.modifier?.name || "Pergerakan stok"}</p>
                      <p className="text-sm text-slate-500">{movement.type} • {formatDate(movement.createdAt)}</p>
                    </div>
                    <Badge tone={movement.type === "SALE" ? "warning" : "info"}>{movement.quantity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Sebelum {movement.beforeStock} • Sesudah {movement.afterStock}</p>
                </div>
              ))}
              {!movements.length ? <p className="text-sm text-slate-500">Belum ada pergerakan stok.</p> : null}
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Stok Topping</h2>
            <div className="mt-5 space-y-3">
              {modifiers.length ? modifiers.map((modifier) => (
                <div key={modifier.id} className="flex items-center justify-between rounded-3xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{modifier.name}</p>
                    <p className="text-sm text-slate-500">{modifier.modifierGroup.name}</p>
                  </div>
                  <Badge tone={(modifier.stock || 0) <= 3 ? "warning" : "success"}>{modifier.stock || 0}</Badge>
                </div>
              )) : <p className="text-sm text-slate-500">Belum ada topping dengan tracking stok aktif.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
