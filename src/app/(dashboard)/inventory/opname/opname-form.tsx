"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitOpname } from "@/actions/opname";
import type { OpnameItem } from "@/actions/opname";

interface OpnameFormProps {
  items: OpnameItem[];
  outletId: string;
  userId: string;
}

export default function OpnameForm({ items, outletId, userId }: OpnameFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track actual qty per item (keyed by index)
  const [actualQtys, setActualQtys] = useState<Record<number, number>>(
    () =>
      Object.fromEntries(items.map((item, i) => [i, item.currentQty]))
  );

  function handleQtyChange(index: number, value: string) {
    const parsed = parseInt(value, 10);
    setActualQtys((prev) => ({
      ...prev,
      [index]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  }

  function handleSubmit() {
    setError(null);
    setSuccess(null);

    const submitItems = items.map((item, i) => ({
      stockId: item.stockId,
      productId: item.productId,
      variantId: item.variantId,
      actualQty: actualQtys[i] ?? item.currentQty,
    }));

    startTransition(async () => {
      const result = await submitOpname({
        outletId,
        createdBy: userId,
        items: submitItems,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(
        `Stok opname berhasil disimpan. ${result.adjustedCount} produk disesuaikan.`
      );
      setTimeout(() => router.push("/inventory/opname"), 1500);
    });
  }

  function getDeltaDisplay(delta: number) {
    if (delta > 0)
      return (
        <span className="font-medium text-emerald-600">+{delta}</span>
      );
    if (delta < 0)
      return (
        <span className="font-medium text-red-500">{delta}</span>
      );
    return <span className="font-medium text-slate-400">0</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Opname</h1>
          <p className="text-sm text-slate-500">Hitung stok aktual produk</p>
        </div>
        <Button onClick={handleSubmit} disabled={isPending || items.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Menyimpan..." : "Simpan Opname"}
        </Button>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <ClipboardList className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Tidak ada produk dengan pelacakan stok aktif
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                    Produk
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                    SKU
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                    Stok Tercatat
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                    Stok Aktual
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                    Selisih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, i) => {
                  const actualQty = actualQtys[i] ?? item.currentQty;
                  const delta = actualQty - item.currentQty;

                  return (
                    <tr key={`${item.productId}-${item.variantId ?? "base"}`} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {item.productName}
                        {item.variantName && (
                          <span className="ml-1.5 text-xs text-slate-400">
                            ({item.variantName})
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {item.sku ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {item.currentQty}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          defaultValue={item.currentQty}
                          onChange={(e) => handleQtyChange(i, e.target.value)}
                          className="h-9 w-24 rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {getDeltaDisplay(delta)}
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
