"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createMasterTopping, deleteMasterTopping, updateMasterTopping } from "@/actions/master-options";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatRp } from "@/lib/format";

type MasterToppingRow = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  _count?: { productToppings: number };
};

function ToppingForm({ row, onDone }: { row?: MasterToppingRow | null; onDone: () => void }) {
  const router = useRouter();
  const [active, setActive] = useState(row?.isActive ?? true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    formData.set("isActive", String(active));
    startTransition(async () => {
      const result = row ? await updateMasterTopping(row.id, formData) : await createMasterTopping(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-4">
      {error ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div> : null}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Topping</label>
        <Input name="name" defaultValue={row?.name ?? ""} placeholder="Contoh: Extra Cheese" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Tambahan</label>
        <CurrencyInput name="price" defaultValue={row?.price ?? 0} />
        <p className="mt-1 text-xs text-slate-500">Isi 0 jika topping ini gratis.</p>
      </div>
      <Checkbox checked={active} onChange={setActive} label="Aktif" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
      </div>
    </form>
  );
}

export function ToppingsClient({ toppings }: { toppings: MasterToppingRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MasterToppingRow | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<MasterToppingRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteMasterTopping(deleting.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Topping"
        description="Kelola topping yang dapat dipilih di produk."
        breadcrumb="Produk / Master Topping"
        actions={<Button onClick={() => setEditing(null)}><Plus className="mr-2 h-4 w-4" />Tambah Topping</Button>}
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Nama Topping</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Harga Tambahan</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {toppings.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Belum ada master topping.</td></tr>
              ) : toppings.map((topping) => (
                <tr key={topping.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{topping.name}</td>
                  <td className="px-4 py-3 text-slate-600">{formatRp(topping.price)}</td>
                  <td className="px-4 py-3"><Badge tone={topping.isActive ? "success" : "warning"}>{topping.isActive ? "Aktif" : "Nonaktif"}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setEditing(topping)} aria-label="Edit topping"><Pencil size={15} /></button>
                    <button className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => setDeleting(topping)} aria-label="Hapus topping"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? "Edit Master Topping" : "Tambah Master Topping"}>
        <ToppingForm row={editing} onDone={() => setEditing(undefined)} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus Master Topping">
        <p className="text-sm text-slate-600">Jika topping sudah dipakai product, data akan dinonaktifkan agar histori product tetap aman.</p>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Batal</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isPending}>{isPending ? "Memproses..." : "Hapus"}</Button>
        </div>
      </Modal>
    </div>
  );
}
