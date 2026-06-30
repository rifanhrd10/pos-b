"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { decimalToNumber, rupiah } from "@/lib/utils";

type ProductItem = {
  id: string;
  name: string;
  categoryName: string;
  imageUrl: string;
  sellPrice: unknown;
  stock: number;
  isActive: boolean;
  modifierGroups: { id: string; name: string }[];
};

export function ProductCatalogManager({ products }: { products: ProductItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => product.categoryName)))],
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchQuery =
          !query ||
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.categoryName.toLowerCase().includes(query.toLowerCase());
        const matchCategory = category === "all" || product.categoryName === category;
        const matchStatus =
          status === "all" ||
          (status === "active" && product.isActive) ||
          (status === "inactive" && !product.isActive) ||
          (status === "with-topping" && product.modifierGroups.length > 0);

        return matchQuery && matchCategory && matchStatus;
      }),
    [products, query, category, status],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[28px] bg-white p-5 shadow-soft md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <Input placeholder="Cari nama produk atau kategori..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Semua kategori" : item}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
          <option value="all">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
          <option value="with-topping">Punya topping</option>
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <Link key={product.id} href={`/produk/${product.id}`} className="overflow-hidden rounded-[28px] bg-white shadow-soft">
            <Image src={product.imageUrl} alt={product.name} width={640} height={420} className="h-52 w-full object-cover" />
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{product.categoryName}</p>
                </div>
                {product.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Harga jual</p>
                  <p className="mt-1 font-semibold text-bayaro-navy">{rupiah(decimalToNumber(product.sellPrice))}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Stok</p>
                  <p className="mt-1 font-semibold text-slate-900">{product.stock}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.modifierGroups.length ? product.modifierGroups.map((group) => <Badge key={group.id} tone="info">{group.name}</Badge>) : <Badge>Tidak ada topping</Badge>}
              </div>
            </div>
          </Link>
        ))}
        {!filtered.length ? <div className="rounded-[28px] bg-white p-8 text-sm text-slate-500 shadow-soft">Tidak ada produk yang cocok dengan filter.</div> : null}
      </div>
    </div>
  );
}
