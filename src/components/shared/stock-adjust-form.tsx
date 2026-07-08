"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { adjustStock } from "@/actions/stock";
import { getErrorMessage } from "@/lib/errors";

type AdjustmentType = "IN" | "OUT" | "ADJUSTMENT";

interface StockAdjustFormProps {
  stockId?: string;
  outletId: string;
  productId: string;
  variantId?: string;
  currentQty: number;
  productName: string;
  onSuccess?: () => void;
}

export function StockAdjustForm({
  outletId,
  productId,
  variantId,
  currentQty,
  productName,
  onSuccess,
}: StockAdjustFormProps) {
  const [type, setType] = useState<AdjustmentType>("IN");
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const newQty = useMemo(() => {
    if (type === "IN") return currentQty + qty;
    if (type === "OUT") return currentQty - qty;
    return qty; // ADJUSTMENT is absolute
  }, [type, qty, currentQty]);

  const isNegative = newQty < 0;

  const isValid = useMemo(() => {
    if (type === "IN") return qty >= 1;
    if (type === "OUT") return qty >= 1 && !isNegative;
    return qty >= 0; // ADJUSTMENT
  }, [type, qty, isNegative]);

  const minQty = type === "ADJUSTMENT" ? 0 : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsPending(true);
    setError("");
    setSuccess(false);

    try {
      const result = await adjustStock({
        outletId,
        productId,
        variantId,
        quantity: qty,
        type,
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error ?? "Gagal menyesuaikan stok");
      } else {
        setSuccess(true);
        setQty(type === "ADJUSTMENT" ? currentQty : 1);
        setNote("");
        onSuccess?.();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-slate-700">{productName}</p>

      {/* Type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">Tipe</label>
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value as AdjustmentType);
            setQty(e.target.value === "ADJUSTMENT" ? currentQty : 1);
            setError("");
            setSuccess(false);
          }}
        >
          <option value="IN">Masuk</option>
          <option value="OUT">Keluar</option>
          <option value="ADJUSTMENT">Koreksi</option>
        </Select>
      </div>

      {/* Quantity */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">Jumlah</label>
        <Input
          type="number"
          min={minQty}
          step={1}
          value={qty}
          onChange={(e) => {
            setQty(Math.max(minQty, parseInt(e.target.value, 10) || 0));
            setError("");
            setSuccess(false);
          }}
        />
      </div>

      {/* Note */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">Catatan</label>
        <Input
          type="text"
          placeholder="Catatan penyesuaian..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Preview */}
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          isNegative
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        Stok saat ini:{" "}
        <span className="font-semibold text-slate-800">{currentQty}</span>
        {" → "}Stok baru:{" "}
        <span
          className={`font-semibold ${isNegative ? "text-rose-600" : "text-slate-800"}`}
        >
          {newQty}
        </span>
        {isNegative && (
          <span className="ml-2 text-xs text-rose-600">Stok tidak cukup</span>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {/* Success */}
      {success && (
        <p className="text-sm text-emerald-600">Stok berhasil disesuaikan.</p>
      )}

      <Button
        type="submit"
        isLoading={isPending}
        disabled={!isValid || isPending}
        className="w-full"
      >
        Simpan
      </Button>
    </form>
  );
}
