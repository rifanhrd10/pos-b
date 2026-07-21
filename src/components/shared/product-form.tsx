"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/actions/products";
import { getErrorMessage } from "@/lib/errors";

type ProductItemVariant = {
  id?: string;
  name: string;
  priceAdjustment: number;
  stock?: number;
};

type ProductVariantGroupItem = {
  id?: string;
  masterVariantId: string;
  masterVariant?: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
};

type ProductItemTopping = {
  id?: string;
  masterToppingId?: string | null;
  name: string;
  price: number;
};

type MasterVariantOption = {
  id: string;
  name: string;
  isActive: boolean;
  options: Array<{
    id: string;
    name: string;
    priceAdjustment: number;
    isActive: boolean;
    sortOrder: number;
  }>;
};

type MasterToppingOption = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
};

type ProductFormProps = {
  mode: "create" | "edit";
  businessId: string;
  product?: {
    id: string;
    name: string;
    description?: string | null;
    categoryId?: string | null;
    sku?: string | null;
    barcode?: string | null;
    basePrice: number;
    costPrice?: number | null;
    taxRate: number;
    image?: string | null;
    trackStock: boolean;
    variantGroups?: ProductVariantGroupItem[];
    variants?: ProductItemVariant[];
    toppings?: ProductItemTopping[];
  };
  masterVariants?: MasterVariantOption[];
  masterToppings?: MasterToppingOption[];
};

type CategoryOption = {
  id: string;
  name: string;
};

export function ProductForm({ mode, businessId, product, masterVariants = [], masterToppings = [] }: ProductFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? false);
  const [selectedVariantGroupIds, setSelectedVariantGroupIds] = useState<string[]>(
    () => product?.variantGroups?.map((variantGroup) => variantGroup.masterVariantId).filter((id): id is string => Boolean(id)) ?? []
  );
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>(
    () => product?.toppings?.map((topping) => topping.masterToppingId).filter((id): id is string => Boolean(id)) ?? []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(`/api/categories?businessId=${businessId}`);
        if (!response.ok) {
          throw new Error("Gagal memuat kategori");
        }

        const data = (await response.json()) as CategoryOption[];
        if (!cancelled) {
          setCategories(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const legacyVariants = useMemo(() => product?.variants ?? [], [product?.variants]);
  const legacyToppings = useMemo(() => product?.toppings?.filter((topping) => !topping.masterToppingId) ?? [], [product?.toppings]);

  function toggleVariantGroup(id: string) {
    setSelectedVariantGroupIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleTopping(id: string) {
    setSelectedToppingIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("categoryId", categoryId);
      formData.set("trackStock", String(trackStock));
      formData.set("variantGroupIds", JSON.stringify(selectedVariantGroupIds));
      formData.set("toppingIds", JSON.stringify(selectedToppingIds));

      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(product!.id, formData);

      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        router.push("/products");
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
        title={mode === "create" ? "Tambah Produk" : "Edit Produk"}
        description={mode === "create" ? "Buat produk baru untuk katalog Anda" : "Perbarui informasi produk"}
        breadcrumb={mode === "create" ? "Produk / Tambah" : "Produk / Edit"}
      />

      <div className="mx-auto max-w-4xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Produk <span className="text-red-500">*</span></label>
              <Input name="name" required placeholder="Contoh: Cappuccino" defaultValue={product?.name ?? ""} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</label>
              <Textarea name="description" placeholder="Deskripsi singkat produk" defaultValue={product?.description ?? ""} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
              <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">SKU</label>
              <Input name="sku" placeholder="SKU produk" defaultValue={product?.sku ?? ""} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Barcode</label>
              <Input name="barcode" placeholder="Barcode produk" defaultValue={product?.barcode ?? ""} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Jual <span className="text-red-500">*</span></label>
              <CurrencyInput name="basePrice" required defaultValue={product?.basePrice ?? 0} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Modal</label>
              <CurrencyInput name="costPrice" defaultValue={product?.costPrice ?? ""} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Pajak (%)</label>
              <Input name="taxRate" type="number" min="0" max="100" step="0.01" defaultValue={product?.taxRate ?? 0} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Gambar Produk</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploading}
                className="mb-2 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                onChange={async (event) => {
                  const picked = event.target.files?.[0];
                  if (!picked) return;
                  setIsUploading(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", picked);
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const json = (await res.json()) as { success?: boolean; url?: string; error?: string };
                    if (json.url) {
                      setImageUrl(json.url);
                    } else {
                      setError(json.error ?? "Upload gagal");
                    }
                  } catch (err) {
                    setError(getErrorMessage(err));
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              {isUploading && <p className="mb-1 text-xs text-slate-500">Uploading...</p>}
              <Input name="image" placeholder="https://..." value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <Checkbox checked={trackStock} onChange={setTrackStock} label="Lacak stok produk" />
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Varian</h3>
                <p className="text-sm text-slate-500">Pilih grup varian dari Master Data Varian. Detail pilihan mengikuti master.</p>
              </div>
            </div>

            {masterVariants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Belum ada grup master varian aktif. Tambahkan dulu di menu Master Varian.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {masterVariants.map((variant) => (
                  <div key={variant.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selectedVariantGroupIds.includes(variant.id) ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <Checkbox checked={selectedVariantGroupIds.includes(variant.id)} onChange={() => toggleVariantGroup(variant.id)} label="" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{variant.name}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {variant.options.map((option) => (
                          <span key={option.id} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                            {option.name}
                            {option.priceAdjustment > 0
                              ? ` +${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(option.priceAdjustment)}`
                              : ""}
                          </span>
                        ))}
                      </span>
                    </span>
                    {!variant.isActive ? <Badge tone="warning">Nonaktif</Badge> : null}
                  </div>
                ))}
              </div>
            )}
            {legacyVariants.length > 0 ? (
              <p className="text-xs text-amber-600">Ada {legacyVariants.length} varian lama berbasis product. Pilih grup master dan simpan ulang produk agar POS memakai struktur baru.</p>
            ) : null}
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Topping</h3>
                <p className="text-sm text-slate-500">Pilih topping dari Master Data Topping.</p>
              </div>
            </div>

            {masterToppings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Belum ada master topping aktif. Tambahkan dulu di menu Master Topping.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {masterToppings.map((topping) => (
                  <label key={topping.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selectedToppingIds.includes(topping.id) ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <Checkbox checked={selectedToppingIds.includes(topping.id)} onChange={() => toggleTopping(topping.id)} label="" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{topping.name}</span>
                      <span className="mt-1 block text-sm text-slate-500">
                        Harga tambahan {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(topping.price)}
                      </span>
                    </span>
                    {!topping.isActive ? <Badge tone="warning">Nonaktif</Badge> : null}
                  </label>
                ))}
              </div>
            )}
            {legacyToppings.length > 0 ? (
              <p className="text-xs text-amber-600">Ada {legacyToppings.length} topping lama tanpa master. Simpan ulang produk setelah memilih master untuk membersihkannya.</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : mode === "create" ? "Simpan Produk" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
