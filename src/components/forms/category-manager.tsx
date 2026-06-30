"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { emitToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  productCount: number;
};

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [categories],
  );

  function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan kategori.");
        emitToast({ tone: "error", title: "Kategori gagal disimpan", description: result.message });
        return;
      }

      const next = editing
        ? categories.map((category) => (category.id === editing.id ? result : category))
        : [result, ...categories];
      setCategories(next);
      setOpen(false);
      setEditing(null);
      setError(null);
      emitToast({ tone: "success", title: editing ? "Kategori diperbarui" : "Kategori ditambahkan" });
    });
  }

  async function deleteCategory(id: string) {
    const ok = window.confirm("Hapus kategori ini? Jika sudah dipakai produk, sistem akan melakukan soft delete.");
    if (!ok) return;

    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Gagal menghapus kategori.");
      emitToast({ tone: "error", title: "Kategori gagal dihapus", description: result.message });
      return;
    }
    setCategories((prev) => prev.filter((item) => item.id !== id));
    emitToast({ tone: "success", title: "Kategori diperbarui", description: result.message || "Kategori berhasil dihapus." });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setOpen(true);
            setEditing(null);
          }}
        >
          <Plus size={16} />
          Tambah Kategori
        </Button>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="hidden grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-500 md:grid">
          <div>Nama kategori</div>
          <div>Produk</div>
          <div>Urutan</div>
          <div>Status</div>
          <div>Aksi</div>
        </div>

        {sorted.map((category) => (
          <div
            key={category.id}
            className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] md:items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">{category.name}</p>
              <p className="mt-1 text-sm text-slate-500">{category.description || category.slug}</p>
              <p className="mt-2 text-xs text-slate-400">Dibuat {formatDate(category.createdAt)}</p>
            </div>
            <div className="text-sm text-slate-700">{category.productCount} produk</div>
            <div className="text-sm text-slate-700">#{category.sortOrder}</div>
            <div>{category.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(category); setOpen(true); }}>
                <Pencil size={16} />
              </Button>
              <Button variant="danger" onClick={() => void deleteCategory(category.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">
                {editing ? "Edit kategori" : "Tambah kategori baru"}
              </h2>
              <form className="mt-6 space-y-4" onSubmit={saveCategory}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama kategori</label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi</label>
                  <Input name="description" defaultValue={editing?.description || ""} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Urutan tampil</label>
                  <Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} required />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
                  Kategori aktif
                </label>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
