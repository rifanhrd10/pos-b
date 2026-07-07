"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grid2X2, Pencil, Plus, Trash2, Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteCategory } from "@/actions/categories";

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  _count: { products: number };
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleDelete() {
    if (!deleteId) return;

    startTransition(async () => {
      await deleteCategory(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        description="Kelola kategori produk untuk memudahkan pengaturan menu dan inventaris"
        breadcrumb="Produk / Kategori"
        actions={
          <Link href="/categories/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Tambah Kategori
            </Button>
          </Link>
        }
      />

      {categories.length === 0 ? (
        <EmptyState title="Belum ada kategori" description="Tambahkan kategori pertama untuk mulai mengelompokkan produk Anda." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  {category.icon ? (
                    <span className="text-sm font-semibold uppercase">{category.icon.slice(0, 2)}</span>
                  ) : (
                    <Grid2X2 size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {category.description || "Belum ada deskripsi kategori."}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Package size={14} className="text-slate-400" />
                <span>{category._count.products} produk</span>
              </div>

              <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-100 pt-4">
                <Link href={`/categories/${category.id}/edit`}>
                  <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <Pencil size={15} />
                  </button>
                </Link>
                <button
                  onClick={() => setDeleteId(category.id)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Kategori">
        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus kategori ini? Produk terkait akan dilepas dari kategori.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
