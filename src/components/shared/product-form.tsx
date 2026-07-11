"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

type ProductItemTopping = {
  id?: string;
  name: string;
  price: number;
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
    variants?: ProductItemVariant[];
    toppings?: ProductItemTopping[];
  };
};

type CategoryOption = {
  id: string;
  name: string;
};

const emptyVariant = (): ProductItemVariant => ({ name: "", priceAdjustment: 0, stock: 0 });
const emptyTopping = (): ProductItemTopping => ({ name: "", price: 0 });

export function ProductForm({ mode, businessId, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? false);
  const [variants, setVariants] = useState<ProductItemVariant[]>(product?.variants?.length ? product.variants : [emptyVariant()]);
  const [toppings, setToppings] = useState<ProductItemTopping[]>(product?.toppings?.length ? product.toppings : [emptyTopping()]);

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

  const filteredVariants = useMemo(
    () => variants.filter((variant) => variant.name.trim() || variant.priceAdjustment > 0 || (variant.stock ?? 0) > 0),
    [variants]
  );
  const filteredToppings = useMemo(
    () => toppings.filter((topping) => topping.name.trim() || topping.price > 0),
    [toppings]
  );

  function updateVariant(index: number, key: keyof ProductItemVariant, value: string | number) {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index
          ? {
              ...variant,
              [key]: typeof value === "string" && key === "name" ? value : Number(value),
            }
          : variant
      )
    );
  }

  function updateTopping(index: number, key: keyof ProductItemTopping, value: string | number) {
    setToppings((current) =>
      current.map((topping, currentIndex) =>
        currentIndex === index
          ? {
              ...topping,
              [key]: key === "name" ? value : Number(value),
            }
          : topping
      )
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("categoryId", categoryId);
      formData.set("trackStock", String(trackStock));
      formData.set("variants", JSON.stringify(filteredVariants));
      formData.set("toppings", JSON.stringify(filteredToppings));

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
              <Input name="basePrice" type="number" min="0" step="0.01" required defaultValue={product?.basePrice ?? 0} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Modal</label>
              <Input name="costPrice" type="number" min="0" step="0.01" defaultValue={product?.costPrice ?? ""} />
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
                <p className="text-sm text-slate-500">Atur opsi varian dan penyesuaian harga.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setVariants((current) => [...current, emptyVariant()])}>
                Tambah Varian
              </Button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={`${variant.id ?? "variant"}-${index}`} className="grid gap-3 rounded-2xl border border-slate-100 p-4 md:grid-cols-4">
                  <Input
                    placeholder="Nama varian"
                    value={variant.name}
                    onChange={(event) => updateVariant(index, "name", event.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Harga tambahan"
                    value={variant.priceAdjustment}
                    onChange={(event) => updateVariant(index, "priceAdjustment", event.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stok"
                    value={variant.stock ?? 0}
                    onChange={(event) => updateVariant(index, "stock", event.target.value)}
                  />
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Topping</h3>
                <p className="text-sm text-slate-500">Tambahkan topping atau add-on produk.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setToppings((current) => [...current, emptyTopping()])}>
                Tambah Topping
              </Button>
            </div>

            <div className="space-y-3">
              {toppings.map((topping, index) => (
                <div key={`${topping.id ?? "topping"}-${index}`} className="grid gap-3 rounded-2xl border border-slate-100 p-4 md:grid-cols-3">
                  <Input
                    placeholder="Nama topping"
                    value={topping.name}
                    onChange={(event) => updateTopping(index, "name", event.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Harga"
                    value={topping.price}
                    onChange={(event) => updateTopping(index, "price", event.target.value)}
                  />
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setToppings((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
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
