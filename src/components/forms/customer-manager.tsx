"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emitToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  transactionCount: number;
};

export function CustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const haystack = [customer.name, customer.phone, customer.email, customer.address].join(" ").toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [customers, query],
  );

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    startTransition(async () => {
      const response = await fetch(editing ? `/api/customers/${editing.id}` : "/api/customers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan pelanggan.");
        emitToast({ tone: "error", title: "Pelanggan gagal disimpan", description: result.message });
        return;
      }
      setCustomers((prev) =>
        editing ? prev.map((item) => (item.id === editing.id ? result : item)) : [result, ...prev],
      );
      setOpen(false);
      setEditing(null);
      setError(null);
      emitToast({ tone: "success", title: editing ? "Pelanggan diperbarui" : "Pelanggan ditambahkan" });
    });
  }

  async function remove(id: string) {
    const ok = window.confirm("Hapus pelanggan ini? Riwayat transaksi akan tetap tersimpan.");
    if (!ok) return;
    const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Gagal menghapus pelanggan.");
      emitToast({ tone: "error", title: "Pelanggan gagal dihapus", description: result.message });
      return;
    }
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    emitToast({ tone: "success", title: "Pelanggan dihapus", description: result.message });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Input placeholder="Cari nama, HP, email, atau alamat pelanggan..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button className="gap-2" onClick={() => { setOpen(true); setEditing(null); }}>
          <Plus size={16} />
          Tambah Pelanggan
        </Button>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.3fr_1fr_1fr_0.8fr] md:items-center">
            <div>
              <p className="font-semibold text-slate-900">{customer.name}</p>
              <p className="mt-1 text-sm text-slate-500">{customer.phone || customer.email || "Belum ada kontak"}</p>
              <p className="mt-2 text-xs text-slate-400">Dibuat {formatDate(customer.createdAt)}</p>
            </div>
            <div className="text-sm text-slate-700">{customer.address || "-"}</div>
            <div className="text-sm text-slate-700">{customer.transactionCount} transaksi</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(customer); setOpen(true); }}>
                <Pencil size={16} />
              </Button>
              <Button variant="danger" onClick={() => void remove(customer.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!filteredCustomers.length ? <div className="p-6 text-sm text-slate-500">Tidak ada pelanggan yang cocok.</div> : null}
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">{editing ? "Edit pelanggan" : "Tambah pelanggan"}</h2>
              <form className="mt-6 space-y-4" onSubmit={save}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama</label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nomor HP</label>
                    <Input name="phone" defaultValue={editing?.phone || ""} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <Input name="email" type="email" defaultValue={editing?.email || ""} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Alamat</label>
                  <Textarea name="address" defaultValue={editing?.address || ""} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
                  <Textarea name="note" defaultValue={editing?.note || ""} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
