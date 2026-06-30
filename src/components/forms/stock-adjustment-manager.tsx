"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emitToast } from "@/components/ui/toast-provider";

type ProductOption = { id: string; name: string; stock: number };

export function StockAdjustmentManager({ products }: { products: ProductOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      productId: String(formData.get("productId") || ""),
      quantity: Number(formData.get("quantity") || 0),
      note: String(formData.get("note") || ""),
    };

    startTransition(async () => {
      const response = await fetch("/api/stocks/adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal adjustment stok.");
        emitToast({ tone: "error", title: "Adjustment stok gagal", description: result.message });
        return;
      }
      emitToast({ tone: "success", title: "Adjustment stok tersimpan", description: result.message });
      window.location.reload();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Adjustment Stok</Button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Adjustment Stok</h2>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <select name="productId" defaultValue="" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="" disabled>Pilih produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} • stok {product.stock}</option>
                  ))}
                </select>
                <Input name="quantity" type="number" placeholder="Masukkan selisih stok. Contoh: 5 atau -2" required />
                <Input name="note" placeholder="Catatan adjustment" />
                {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Adjustment"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
