"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { emitToast } from "@/components/ui/toast-provider";
import { rupiah } from "@/lib/utils";

type Category = { id: string; name: string };
type ModifierGroup = { id: string; name: string };
type Product = {
  id?: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  sellPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  isStockTracked: boolean;
  isActive: boolean;
  modifierGroupIds: string[];
};

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatRupiahInput(value: string) {
  const digits = normalizeDigits(value);
  if (!digits) return "";
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

function parseCurrency(value: string) {
  const digits = normalizeDigits(value);
  return digits ? Number(digits) : 0;
}

function slugifySkuName(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "PRODUK";
}

function createSku(name: string, suffix: string) {
  return `BYR-${slugifySkuName(name)}-${suffix}`;
}

export function ProductForm({
  product,
  categories,
  modifierGroups,
}: {
  product?: Product;
  categories: Category[];
  modifierGroups: ModifierGroup[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [skuSuffix] = useState(() => String(Date.now()).slice(-4));
  const [sku, setSku] = useState(product?.sku || createSku(product?.name || "", skuSuffix));
  const [sellPriceInput, setSellPriceInput] = useState(() => formatRupiahInput(String(product?.sellPrice ?? "")));
  const [costPriceInput, setCostPriceInput] = useState(() => formatRupiahInput(String(product?.costPrice ?? "")));
  const [preview, setPreview] = useState(product?.imageUrl || "/images/products/product-placeholder.svg");
  const [isStockTracked, setIsStockTracked] = useState(product?.isStockTracked ?? true);
  const [saving, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setError(null);
    const response = await fetch("/api/uploads/products", { method: "POST", body: formData });
    const result = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(result.message || "Upload foto gagal.");
      emitToast({ tone: "error", title: "Upload foto gagal", description: result.message });
      return;
    }

    setPreview(result.imageUrl);
    emitToast({ tone: "success", title: "Foto produk berhasil diunggah" });
    const hidden = document.querySelector<HTMLInputElement>("#imageUrl");
    if (hidden) hidden.value = result.imageUrl;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      sku: String(formData.get("sku") || ""),
      barcode: String(formData.get("barcode") || ""),
      description: String(formData.get("description") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      categoryId: String(formData.get("categoryId") || ""),
      sellPrice: Number(formData.get("sellPrice") || 0),
      costPrice: Number(formData.get("costPrice") || 0),
      stock: Number(formData.get("stock") || 0),
      minStock: Number(formData.get("minStock") || 0),
      isStockTracked: formData.get("isStockTracked") === "on",
      isActive: formData.get("isActive") === "on",
      modifierGroupIds: formData.getAll("modifierGroupIds").map(String),
    };

    startTransition(async () => {
      const response = await fetch(product?.id ? `/api/products/${product.id}` : "/api/products", {
        method: product?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Gagal menyimpan produk.");
        emitToast({ tone: "error", title: "Produk gagal disimpan", description: result.message });
        return;
      }

      emitToast({ tone: "success", title: product?.id ? "Produk diperbarui" : "Produk ditambahkan" });
      router.push(`/produk/${result.id || product?.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl || ""} hidden />
      <input name="sku" value={sku} readOnly hidden />
      <input name="barcode" value={product?.barcode || ""} readOnly hidden />
      <input name="sellPrice" value={parseCurrency(sellPriceInput)} readOnly hidden />
      <input name="costPrice" value={parseCurrency(costPriceInput)} readOnly hidden />

      <section className="grid gap-6 rounded-[28px] bg-white p-6 shadow-soft lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Informasi Produk</h2>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nama produk</label>
            <Input
              name="name"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!product?.id) {
                  setSku(createSku(nextName, skuSuffix));
                }
              }}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
            <Input value={sku} readOnly className="bg-slate-50 text-slate-600" />
            <p className="mt-2 text-xs text-slate-500">SKU dibuat otomatis oleh sistem Bayaro dan tersimpan saat produk disimpan.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi</label>
            <Textarea name="description" defaultValue={product?.description || ""} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Foto Produk</h2>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
            <Image src={preview} alt="Preview foto produk" width={720} height={480} className="h-72 w-full object-cover" />
          </div>
          <label className="inline-flex cursor-pointer rounded-2xl border border-dashed border-bayaro-blue px-4 py-3 text-sm font-semibold text-bayaro-blue">
            {uploading ? "Mengunggah..." : "Upload foto produk"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleUpload(file);
                }
              }}
            />
          </label>
          <p className="text-xs text-slate-500">Format JPG, JPEG, PNG, WebP dengan ukuran maksimal 2MB.</p>
        </div>
      </section>

      <section className="grid gap-6 rounded-[28px] bg-white p-6 shadow-soft lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Kategori & Harga</h2>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kategori</label>
            <select
              name="categoryId"
              defaultValue={product?.categoryId}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Harga jual</label>
              <Input
                value={sellPriceInput}
                onChange={(event) => setSellPriceInput(formatRupiahInput(event.target.value))}
                inputMode="numeric"
                placeholder="Rp 0"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Harga modal</label>
              <Input
                value={costPriceInput}
                onChange={(event) => setCostPriceInput(formatRupiahInput(event.target.value))}
                inputMode="numeric"
                placeholder="Rp 0"
                required
              />
            </div>
          </div>
          <div className="rounded-2xl bg-bayaro-soft p-4 text-sm text-slate-700">
            Margin estimasi:{" "}
            <span className="font-semibold text-bayaro-navy">
              {rupiah(parseCurrency(sellPriceInput) - parseCurrency(costPriceInput))}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Stok & Topping</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Stok awal</label>
              <Input
                name="stock"
                type="number"
                defaultValue={product?.stock ?? 0}
                required={isStockTracked}
                disabled={!isStockTracked}
                className={!isStockTracked ? "bg-slate-50 text-slate-400" : undefined}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Minimum stok</label>
              <Input
                name="minStock"
                type="number"
                defaultValue={product?.minStock ?? 0}
                required={isStockTracked}
                disabled={!isStockTracked}
                className={!isStockTracked ? "bg-slate-50 text-slate-400" : undefined}
              />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <input
              type="checkbox"
              name="isStockTracked"
              checked={isStockTracked}
              onChange={(event) => setIsStockTracked(event.target.checked)}
            />
            Lacak stok produk ini
          </label>
          <p className="text-xs leading-5 text-slate-500">
            Aktifkan untuk produk jadi seperti Aqua, snack kemasan, atau item yang memang dihitung per pcs. Nonaktifkan untuk menu racikan seperti nasi goreng bila stok bahan bakunya belum dimodelkan terpisah.
          </p>
          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">Modifier group</p>
            {modifierGroups.map((group) => (
              <label key={group.id} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="modifierGroupIds"
                  value={group.id}
                  defaultChecked={product?.modifierGroupIds?.includes(group.id)}
                />
                {group.name}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
            Produk aktif
          </label>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="sticky bottom-3 z-10 flex gap-3 rounded-[28px] bg-white p-4 shadow-soft">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );
}
