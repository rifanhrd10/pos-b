"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { emitToast } from "@/components/ui/toast-provider";

export function TransactionActions({
  transactionId,
  status,
}: {
  transactionId: string;
  status: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function act(action: "refund" | "cancel") {
    const ok = window.confirm(
      action === "refund"
        ? "Refund transaksi ini? Stok akan dikembalikan."
        : "Batalkan transaksi ini? Tindakan ini akan mengubah status transaksi.",
    );
    if (!ok) return;

    startTransition(async () => {
      const response = await fetch(`/api/transactions/${transactionId}/${action}`, {
        method: "POST",
      });
      const result = await response.json();
      setMessage(result.message || "Aksi selesai.");
      if (response.ok) {
        emitToast({
          tone: "success",
          title: action === "refund" ? "Refund berhasil" : "Transaksi dibatalkan",
          description: result.message,
        });
        window.location.reload();
      } else {
        emitToast({ tone: "error", title: "Aksi transaksi gagal", description: result.message });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {status === "PAID" ? <Button variant="secondary" onClick={() => act("refund")} disabled={pending}>Refund</Button> : null}
      {status !== "CANCELLED" && status !== "REFUNDED" ? (
        <Button variant="danger" onClick={() => act("cancel")} disabled={pending}>Cancel</Button>
      ) : null}
      <a href={`/api/transactions/${transactionId}/receipt`} target="_blank" rel="noreferrer">
        <Button variant="secondary" type="button">Lihat Struk</Button>
      </a>
      {message ? <p className="w-full text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
