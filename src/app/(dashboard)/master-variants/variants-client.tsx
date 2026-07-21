"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createMasterVariant, deleteMasterVariant, updateMasterVariant } from "@/actions/master-options";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatRp } from "@/lib/format";

type VariantOptionRow = {
  id?: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
  sortOrder: number;
};

type MasterVariantRow = {
  id: string;
  name: string;
  isActive: boolean;
  options: VariantOptionRow[];
  _count?: { productGroups: number };
};

function createEmptyOption(sortOrder: number): VariantOptionRow {
  return { name: "", priceAdjustment: 0, isActive: true, sortOrder };
}

function VariantForm({
  row,
  onDone,
}: {
  row?: MasterVariantRow | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(row?.isActive ?? true);
  const [options, setOptions] = useState<VariantOptionRow[]>(
    row?.options?.length
      ? row.options.map((option, index) => ({ ...option, sortOrder: option.sortOrder ?? index }))
      : [createEmptyOption(0)]
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateOption(index: number, patch: Partial<VariantOptionRow>) {
    setOptions((current) =>
      current.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option))
    );
  }

  function addOption() {
    setOptions((current) => [...current, createEmptyOption(current.length)]);
  }

  function removeOption(index: number) {
    setOptions((current) => {
      if (current.length <= 1) return current;
      return current.filter((_, optionIndex) => optionIndex !== index).map((option, sortOrder) => ({ ...option, sortOrder }));
    });
  }

  function submit(formData: FormData) {
    setError("");
    formData.set("isActive", String(active));
    formData.set(
      "options",
      JSON.stringify(
        options.map((option, index) => ({
          ...option,
          sortOrder: index,
          name: option.name.trim(),
        }))
      )
    );

    startTransition(async () => {
      const result = row ? await updateMasterVariant(row.id, formData) : await createMasterVariant(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {error ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div> : null}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Grup Varian</label>
        <Input name="name" defaultValue={row?.name ?? ""} placeholder="Contoh: Penyajian, Level Gula, Ukuran" required />
      </div>

      <Checkbox checked={active} onChange={setActive} label="Grup aktif" />

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Detail Pilihan Varian</h4>
            <p className="text-xs text-slate-500">Tambahkan beberapa pilihan dalam satu grup varian.</p>
          </div>
          <Button type="button" variant="secondary" className="h-9 px-3 py-2 text-xs" onClick={addOption}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Tambah Detail
          </Button>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id ?? index} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Pilihan</label>
                  <Input
                    value={option.name}
                    onChange={(event) => updateOption(index, { name: event.target.value })}
                    placeholder="Contoh: Hot, Cold, Large"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Harga Tambahan</label>
                  <CurrencyInput
                    value={option.priceAdjustment}
                    onValueChange={(value) => updateOption(index, { priceAdjustment: value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 1}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-100 px-3 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Hapus detail varian"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3">
                <Checkbox
                  checked={option.isActive}
                  onChange={(checked) => updateOption(index, { isActive: checked })}
                  label="Pilihan aktif"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}

export function VariantsClient({ variants }: { variants: MasterVariantRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MasterVariantRow | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<MasterVariantRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteMasterVariant(deleting.id);
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
        title="Master Data Varian"
        description="Kelola grup varian dan detail pilihannya untuk dipakai di produk."
        breadcrumb="Produk / Master Varian"
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Grup Varian
          </Button>
        }
      />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Nama Grup</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Detail Pilihan</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Dipakai Product</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Belum ada master varian.
                  </td>
                </tr>
              ) : (
                variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{variant.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xl flex-wrap gap-1.5">
                        {variant.options.map((option) => (
                          <span
                            key={option.id ?? option.name}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                          >
                            {option.name}
                            {option.priceAdjustment > 0 ? ` +${formatRp(option.priceAdjustment)}` : ""}
                            {!option.isActive ? " · nonaktif" : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{variant._count?.productGroups ?? 0} produk</td>
                    <td className="px-4 py-3">
                      <Badge tone={variant.isActive ? "success" : "warning"}>
                        {variant.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                        onClick={() => setEditing(variant)}
                        aria-label="Edit varian"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleting(variant)}
                        aria-label="Hapus varian"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing ? "Edit Grup Varian" : "Tambah Grup Varian"}
      >
        <VariantForm row={editing} onDone={() => setEditing(undefined)} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus Master Varian">
        <p className="text-sm text-slate-600">
          Jika grup varian sudah dipakai product, data akan dinonaktifkan agar relasi dan histori transaksi tetap aman.
        </p>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isPending}>
            {isPending ? "Memproses..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
