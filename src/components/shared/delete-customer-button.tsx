"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCustomer(customerId);
      if (!result.ok) {
        setError(result.error ?? "Gagal menghapus pelanggan");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Hapus pelanggan"
      >
        <Trash2 size={15} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Hapus Pelanggan">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Pelanggan yang sudah memiliki transaksi akan dinonaktifkan supaya histori penjualan tetap aman.
          </p>
          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Memproses..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
