"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockAdjustForm } from "@/components/shared/stock-adjust-form";

export type StockRow = {
  productId: string;
  productName: string;
  sku: string | null;
  categoryName: string | null;
  stockId: string;
  outletId: string;
  outletName: string;
  quantity: number;
  minStock: number;
};

interface InventoryClientProps {
  rows: StockRow[];
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

export function InventoryClient({ rows }: InventoryClientProps) {
  const [activeRow, setActiveRow] = useState<StockRow | null>(null);

  function handleSuccess() {
    setActiveRow(null);
    // Reload to reflect updated stock. A router.refresh() would be ideal but
    // requires useRouter — window.location.reload() is simpler and safe here.
    window.location.reload();
  }

  return (
    <>
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
                  <>
                    <tr
                      key={`${row.productId}-${row.stockId}-${idx}`}
                      className="hover:bg-slate-50/50"
                    >
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
                        {row.stockId ? (
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setActiveRow(activeRow?.stockId === row.stockId ? null : row)
                            }
                          >
                            {activeRow?.stockId === row.stockId ? "Tutup" : "Sesuaikan"}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Belum ada stok</span>
                        )}
                      </td>
                    </tr>
                    {activeRow?.stockId === row.stockId && (
                      <tr key={`form-${row.stockId}`}>
                        <td colSpan={7} className="bg-slate-50/70 px-6 py-4">
                          <div className="max-w-sm">
                            <StockAdjustForm
                              stockId={row.stockId}
                              outletId={row.outletId}
                              productId={row.productId}
                              currentQty={row.quantity}
                              productName={row.productName}
                              onSuccess={handleSuccess}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
