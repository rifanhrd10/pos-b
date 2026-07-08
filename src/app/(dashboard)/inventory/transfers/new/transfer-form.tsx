"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTransfer } from "@/actions/transfers";
import type { TransferItem } from "@/actions/transfers";

type Outlet = { id: string; name: string };
type Variant = { id: string; name: string };
type Product = { id: string; name: string; sku: string | null; variants: Variant[] };

interface TransferFormProps {
  outlets: Outlet[];
  products: Product[];
  businessId: string;
  createdBy: string;
}

interface ItemRow {
  key: number;
  productId: string;
  variantId: string;
  quantity: number;
}

let keyCounter = 0;
function nextKey() {
  return ++keyCounter;
}

export default function TransferForm({ outlets, products, businessId, createdBy }: TransferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fromOutletId, setFromOutletId] = useState("");
  const [toOutletId, setToOutletId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ key: nextKey(), productId: "", variantId: "", quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    setItems((prev) => [...prev, { key: nextKey(), productId: "", variantId: "", quantity: 1 }]);
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(key: number, field: keyof Omit<ItemRow, "key">, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        // Reset variantId when product changes
        if (field === "productId") return { ...i, productId: value as string, variantId: "" };
        return { ...i, [field]: value };
      })
    );
  }

  function getVariants(productId: string): Variant[] {
    return products.find((p) => p.id === productId)?.variants ?? [];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fromOutletId) { setError("Pilih outlet asal."); return; }
    if (!toOutletId) { setError("Pilih outlet tujuan."); return; }
    if (fromOutletId === toOutletId) { setError("Outlet asal dan tujuan harus berbeda."); return; }
    if (items.length === 0) { setError("Tambahkan minimal satu item."); return; }

    const validItems: TransferItem[] = [];
    for (const row of items) {
      if (!row.productId) { setError("Pilih produk untuk setiap baris."); return; }
      if (row.quantity < 1) { setError("Jumlah harus minimal 1."); return; }
      validItems.push({
        productId: row.productId,
        variantId: row.variantId || undefined,
        quantity: row.quantity,
      });
    }

    startTransition(async () => {
      const result = await createTransfer({
        businessId,
        fromOutletId,
        toOutletId,
        note: note.trim() || undefined,
        createdBy,
        items: validItems,
      });

      if (result.success) {
        router.push("/inventory/transfers");
      } else {
        setError(result.error ?? "Gagal membuat transfer.");
      }
    });
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-slate-50 disabled:text-slate-400";
  const selectClass = inputClass;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()} type="button">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transfer Stok Baru</h1>
          <p className="text-sm text-slate-500">Transfer stok antar outlet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info card */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Informasi Transfer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Dari Outlet <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClass}
                value={fromOutletId}
                onChange={(e) => setFromOutletId(e.target.value)}
                required
              >
                <option value="">Pilih outlet asal...</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id} disabled={o.id === toOutletId}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ke Outlet <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClass}
                value={toOutletId}
                onChange={(e) => setToOutletId(e.target.value)}
                required
              >
                <option value="">Pilih outlet tujuan...</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id} disabled={o.id === fromOutletId}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Catatan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                rows={3}
                placeholder="Catatan transfer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Items card */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Item Transfer</h2>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((row, idx) => {
              const variants = getVariants(row.productId);
              return (
                <div key={row.key} className="flex items-start gap-3">
                  <span className="mt-2.5 min-w-[1.5rem] text-center text-xs text-slate-400 font-medium">
                    {idx + 1}
                  </span>

                  {/* Product */}
                  <div className="flex-1 min-w-0">
                    <select
                      className={selectClass}
                      value={row.productId}
                      onChange={(e) => updateItem(row.key, "productId", e.target.value)}
                      required
                    >
                      <option value="">Pilih produk...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.sku ? ` (${p.sku})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variant — only show when product has variants */}
                  {variants.length > 0 && (
                    <div className="w-40 shrink-0">
                      <select
                        className={selectClass}
                        value={row.variantId}
                        onChange={(e) => updateItem(row.key, "variantId", e.target.value)}
                      >
                        <option value="">Semua varian</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Qty */}
                  <div className="w-24 shrink-0">
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      value={row.quantity}
                      onChange={(e) => updateItem(row.key, "quantity", Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(row.key)}
                    disabled={items.length === 1}
                    className="mt-1.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Hapus baris"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">
              Belum ada item. Klik &quot;Tambah Produk&quot; untuk menambahkan.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Buat Transfer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
