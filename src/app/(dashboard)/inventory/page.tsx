import { auth, getBusinessContext } from "@/lib/auth";
import { getStockOverview } from "@/actions/stock";
import { getActiveOutletId } from "@/lib/outlet-context";
import { redirect } from "next/navigation";
import { InventoryClient, type StockRow } from "./inventory-client";

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

  const rows: StockRow[] = [];
  for (const product of stocks) {
    if (product.stocks.length === 0) {
      rows.push({
        productId: product.productId,
        productName: product.productName,
        sku: product.sku,
        categoryName: product.categoryName,
        stockId: "",
        outletId: activeOutletId ?? ctx.outletId ?? "",
        outletName: activeOutletId ? "Outlet aktif" : "—",
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
          outletId: s.outletId,
          outletName: s.outletName,
          quantity: Number(s.quantity),
          minStock: Number(s.minStock),
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok</h1>
          <p className="text-sm text-slate-500">Kelola stock awal, stock masuk, stock keluar, dan penyesuaian.</p>
        </div>
      </div>

      <InventoryClient rows={rows} />
    </div>
  );
}
