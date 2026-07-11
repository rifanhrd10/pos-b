"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, updateCategory } from "@/actions/categories";
import { getErrorMessage } from "@/lib/errors";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
  };
};

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = mode === "create"
        ? await createCategory(formData)
        : await updateCategory(category!.id, formData);

      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        router.push("/categories");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
        description={mode === "create" ? "Buat kategori produk baru untuk bisnis Anda" : "Perbarui informasi kategori produk"}
        breadcrumb={mode === "create" ? "Produk / Kategori / Tambah" : "Produk / Kategori / Edit"}
      />

      <div className="mx-auto max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kategori <span className="text-red-500">*</span></label>
            <Input
              name="name"
              required
              placeholder="Contoh: Minuman"
              defaultValue={category?.name ?? ""}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</label>
            <Textarea
              name="description"
              placeholder="Deskripsi singkat kategori"
              defaultValue={category?.description ?? ""}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Icon</label>
            <Input
              name="icon"
              placeholder="Contoh: coffee, cup-soda"
              defaultValue={category?.icon ?? ""}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : mode === "create" ? "Simpan Kategori" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
