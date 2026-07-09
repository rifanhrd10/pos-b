"use client";

import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { ReceiptModal } from "@/components/kasir/receipt-modal";
import { getOrderForReceipt } from "@/actions/kasir";

interface ReprintButtonProps {
  orderId: string;
  className?: string;
}

export function ReprintButton({ orderId, className }: ReprintButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<Awaited<ReturnType<typeof getOrderForReceipt>> | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderForReceipt(orderId);
      if (!data) {
        setError("Order tidak ditemukan.");
        return;
      }
      setReceiptData(data);
      setOpen(true);
    } catch {
      setError("Gagal memuat data struk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        title="Cetak Ulang"
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
        }
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Printer className="h-3.5 w-3.5" />
        )}
        Cetak Ulang
      </button>

      {error && (
        <span className="ml-2 text-xs text-rose-500">{error}</span>
      )}

      {open && receiptData && (
        <ReceiptModal
          order={receiptData.order}
          payment={receiptData.payment}
          businessName={receiptData.businessName}
          businessAddress={receiptData.businessAddress}
          businessPhone={receiptData.businessPhone}
          kasirName={receiptData.kasirName}
          receiptSettings={receiptData.receiptSettings}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
