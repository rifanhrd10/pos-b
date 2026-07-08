export const dynamic = "force-dynamic";

import { auth, getBusinessContext } from "@/lib/auth";
import { getLowStockItems } from "@/actions/stock";
import { getActiveOutletId } from "@/lib/outlet-context";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function LowStockPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const activeOutletId = await getActiveOutletId();
  const result = await getLowStockItems(ctx.businessId, activeOutletId ?? undefined);

  // getLowStockItems returns { err } on auth failure, or Stock[] on success
  const items = Array.isArray(result) ? result : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stok Menipis</h1>
        <p className="text-sm text-slate-500">Produk yang perlu diisi ulang</p>
      </div>

      {/* Alert banner */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 rounded-[16px] border border-orange-200 bg-orange-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
          <p className="text-sm font-medium text-orange-800">
            Ada {items.length} produk yang perlu diisi ulang
          </p>
        </div>
      )}

      {/* Table card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
            <p className="text-base font-semibold text-slate-700">Semua stok dalam kondisi baik</p>
            <p className="mt-1 text-sm text-slate-400">Tidak ada produk yang perlu diisi ulang saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Produk</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Outlet</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Stok Saat Ini</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Min Stok</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kekurangan</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isOut = item.quantity === 0;
                  const shortage = item.minStock - item.quantity;
                  return (
                    <tr
                      key={item.id}
                      className={isOut ? "bg-red-50" : "bg-orange-50"}
                    >
                      {/* Produk */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-slate-800">{item.product.name}</p>
                        {item.product.sku && (
                          <p className="text-xs text-slate-400">{item.product.sku}</p>
                        )}
                      </td>

                      {/* Outlet */}
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {item.outlet.name}
                      </td>

                      {/* Stok Saat Ini */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={isOut ? "font-semibold text-red-600" : "font-semibold text-orange-600"}>
                          {item.quantity}
                        </span>
                      </td>

                      {/* Min Stok */}
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {item.minStock}
                      </td>

                      {/* Kekurangan */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-semibold text-red-600">{shortage}</span>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={isOut ? "danger" : "warning"}>
                          {isOut ? "Habis" : "Menipis"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
