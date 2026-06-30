"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emitToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/utils";

type Supplier = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
};

export function SupplierManager({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        const haystack = [
          supplier.name,
          supplier.contactPerson,
          supplier.phone,
          supplier.email,
          supplier.address,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [suppliers, query],
  );

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(editing ? `/api/suppliers/${editing.id}` : "/api/suppliers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan supplier.");
        emitToast({ tone: "error", title: "Supplier gagal disimpan", description: result.message });
        return;
      }
      setSuppliers((prev) => (editing ? prev.map((item) => (item.id === editing.id ? result : item)) : [result, ...prev]));
      setOpen(false);
      setEditing(null);
      setError(null);
      emitToast({ tone: "success", title: editing ? "Supplier diperbarui" : "Supplier ditambahkan", description: result.name });
    });
  }

  async function remove(id: string) {
    const ok = window.confirm("Hapus supplier ini dari daftar?");
    if (!ok) return;
    const response = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Gagal menghapus supplier.");
      emitToast({ tone: "error", title: "Supplier gagal dihapus", description: result.message });
      return;
    }
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
    emitToast({ tone: "success", title: "Supplier dihapus", description: result.message });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Input placeholder="Cari nama supplier, PIC, telepon, email, atau alamat..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button className="gap-2" onClick={() => { setOpen(true); setEditing(null); }}>
          <Plus size={16} />
          Tambah Supplier
        </Button>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.3fr_1fr_1fr_0.8fr] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-slate-900">{supplier.name}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${supplier.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {supplier.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{supplier.contactPerson || "PIC belum diisi"}</p>
              <p className="mt-2 text-xs text-slate-400">Dibuat {formatDate(supplier.createdAt)}</p>
            </div>
            <div className="text-sm text-slate-700">{supplier.phone || supplier.email || "-"}</div>
            <div className="text-sm text-slate-700">{supplier.address || "-"}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(supplier); setOpen(true); }}>
                <Pencil size={16} />
              </Button>
              <Button variant="danger" onClick={() => void remove(supplier.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!filteredSuppliers.length ? <div className="p-6 text-sm text-slate-500">Tidak ada supplier yang cocok.</div> : null}
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">{editing ? "Edit supplier" : "Tambah supplier"}</h2>
              <form className="mt-6 space-y-4" onSubmit={save}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama supplier</label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Contact person</label>
                  <Input name="contactPerson" defaultValue={editing?.contactPerson || ""} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nomor telepon</label>
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
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} />
                  Supplier aktif
                </label>
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
