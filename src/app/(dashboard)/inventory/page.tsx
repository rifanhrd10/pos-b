import { auth, getBusinessContext } from "@/lib/auth";
import { getStockOverview } from "@/actions/stock";
import { getActiveOutletId } from "@/lib/outlet-context";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const activeOutletId = await getActiveOutletId();
  const result = await getStockOverview(ctx.businessId, activeOutletId ?? undefined);

  // Handle unauthorized error
  if ("error" in result) redirect("/login");

  const stocks = result;

  // Flatten products × stocks into rows
  type StockRow = {
    productId: string;
    productName: string;
    sku: string | null;
    categoryName: string | null;
    stockId: string;
    outletName: string;
    quantity: number;
    minStock: number;
  };

  const rows: StockRow[] = [];
  for (const product of stocks) {
    if (product.stocks.length === 0) {
      // Product exists but has no stock record yet
      rows.push({
        productId: product.productId,
        productName: product.productName,
        sku: product.sku,
        categoryName: product.categoryName,
        stockId: "",
        outletName: "—",
        quantity: 0,
        minStock: 0,
      });
    } else {
      for (const s of product.stocks) {
        rows.push({
          productId: product.productId,
          productName: product.productName,
          sku: product.sku,
          categoryName: product.categoryName,
          stockId: s.stockId,
          outletName: s.outletName,
          quantity: Number(s.quantity),
          minStock: Number(s.minStock),
        });
      }
    }
  }

  function getStatusBadge(quantity: number, minStock: number) {
    if (quantity === 0) {
      return <Badge tone="danger">Habis</Badge>;
    }
    if (quantity <= minStock) {
      return <Badge tone="warning">Menipis</Badge>;
    }
    return <Badge tone="success">OK</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventori</h1>
          <p className="text-sm text-slate-500">Kelola stok produk per outlet</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Produk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kategori</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Outlet</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Stok</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Min Stok</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Belum ada data stok. Tambahkan stok melalui penyesuaian stok.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={`${row.productId}-${row.stockId}-${idx}`} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-slate-900">{row.productName}</div>
                      {row.sku && (
                        <div className="text-xs text-slate-400">{row.sku}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.categoryName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.outletName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.minStock}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getStatusBadge(row.quantity, row.minStock)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button variant="ghost">
                        Sesuaikan
                      </Button>
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
