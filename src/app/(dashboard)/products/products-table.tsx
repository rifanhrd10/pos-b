"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, Pencil, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ProductTableRow = {
  id: string;
  name: string;
  image: string | null;
  categoryName: string | null;
  basePrice: number;
  variantsCount: number;
  toppingsCount: number;
  isActive: boolean;
};

type Props = {
  products: ProductTableRow[];
};

const pageSize = 10;

export function ProductsTable({ products }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        (product.categoryName ?? "").toLowerCase().includes(query);
      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && product.isActive) ||
        (status === "INACTIVE" && !product.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstItem = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, filtered.length);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatus(value: "ALL" | "ACTIVE" | "INACTIVE") {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Cari nama produk atau kategori..."
            className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { key: "ALL", label: "Semua" },
              { key: "ACTIVE", label: "Aktif" },
              { key: "INACTIVE", label: "Nonaktif" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateStatus(item.key as "ALL" | "ACTIVE" | "INACTIVE")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  status === item.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {filtered.length} produk
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Gambar</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Nama Produk</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kategori</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Harga</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Varian</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Produk tidak ditemukan.
                </td>
              </tr>
            ) : (
              visibleProducts.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3">
                    {product.image ? (
                      // URL produk dapat berasal dari upload lokal maupun CDN eksternal.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-100 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-400">
                        {product.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    <Link href={`/products/${product.id}`} className="hover:text-indigo-600">
                      {product.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{product.categoryName || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    Rp {product.basePrice.toLocaleString("id-ID")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {product.variantsCount} varian, {product.toppingsCount} topping
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={product.isActive ? "success" : "warning"}>
                      {product.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Menampilkan {firstItem}-{lastItem} dari {filtered.length} produk
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="px-3 py-2"
            disabled={safePage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            {safePage}/{totalPages}
          </span>
          <Button
            variant="outline"
            className="px-3 py-2"
            disabled={safePage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
