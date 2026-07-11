"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { createPromo, updatePromo } from "@/actions/promo";
import { getErrorMessage } from "@/lib/errors";
import { Plus, Trash2 } from "lucide-react";

type BundleItem = {
  productId: string;
  requiredQty: number;
  freeQty: number;
};

interface PromoFormProps {
  businessId: string;
  products: Array<{ id: string; name: string; basePrice: number }>;
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    type?: string;
    discountType?: string;
    discountValue?: number;
    code?: string;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate?: string;
    endDate?: string;
    startHour?: number;
    endHour?: number;
    isActive?: boolean;
    bundleItems?: Array<{ productId: string; requiredQty: number; freeQty: number }>;
  };
  onSuccess?: () => void;
}

export function PromoForm({ businessId, products, initialData, onSuccess }: PromoFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "VOUCHER");
  const [discountType, setDiscountType] = useState(initialData?.discountType || "PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 0);
  const [code, setCode] = useState(initialData?.code || "");
  const [minOrderAmount, setMinOrderAmount] = useState(initialData?.minOrderAmount || 0);
  const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount || 0);
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || 0);
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [startHour, setStartHour] = useState(initialData?.startHour || 0);
  const [endHour, setEndHour] = useState(initialData?.endHour || 23);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>(
    initialData?.bundleItems || [{ productId: "", requiredQty: 1, freeQty: 1 }]
  );

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const addBundleItem = () => {
    setBundleItems([...bundleItems, { productId: "", requiredQty: 1, freeQty: 1 }]);
  };

  const removeBundleItem = (index: number) => {
    setBundleItems(bundleItems.filter((_, i) => i !== index));
  };

  const updateBundleItem = (index: number, field: keyof BundleItem, value: string | number) => {
    const updated = [...bundleItems];
    updated[index] = { ...updated[index], [field]: value };
    setBundleItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const data = {
        name,
        description,
        type: type as "VOUCHER" | "BUNDLE" | "HAPPY_HOUR",
        discountType: discountType as "PERCENTAGE" | "NOMINAL",
        discountValue: Number(discountValue),
        code: type === "VOUCHER" ? code : undefined,
        minOrderAmount: minOrderAmount > 0 ? Number(minOrderAmount) : undefined,
        maxDiscount: discountType === "PERCENTAGE" && maxDiscount > 0 ? Number(maxDiscount) : undefined,
        usageLimit: usageLimit > 0 ? Number(usageLimit) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        startHour: type === "HAPPY_HOUR" ? Number(startHour) : undefined,
        endHour: type === "HAPPY_HOUR" ? Number(endHour) : undefined,
        isActive,
        bundleItems: type === "BUNDLE" ? bundleItems.filter((item) => item.productId) : undefined,
      };

      if (initialData?.id) {
        const result = await updatePromo(initialData.id, data);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createPromo(businessId, data);
        if (result.error) {
          setError(result.error);
          return;
        }
      }

      if (onSuccess) onSuccess();
      router.push("/promos");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Info Dasar */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Informasi Dasar</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Promo <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Diskon Akhir Tahun"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tipe Promo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="VOUCHER"
                  checked={type === "VOUCHER"}
                  onChange={(e) => setType(e.target.value)}
                  className="h-4 w-4 text-bayaro-blue"
                />
                <span className="text-sm text-slate-700">Voucher</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="BUNDLE"
                  checked={type === "BUNDLE"}
                  onChange={(e) => setType(e.target.value)}
                  className="h-4 w-4 text-bayaro-blue"
                />
                <span className="text-sm text-slate-700">Bundle</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="HAPPY_HOUR"
                  checked={type === "HAPPY_HOUR"}
                  onChange={(e) => setType(e.target.value)}
                  className="h-4 w-4 text-bayaro-blue"
                />
                <span className="text-sm text-slate-700">Happy Hour</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi promo..."
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-bayaro-blue"
              />
              <span className="text-sm font-medium text-slate-700">Aktifkan promo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Diskon (for VOUCHER & HAPPY_HOUR) */}
      {(type === "VOUCHER" || type === "HAPPY_HOUR") && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Diskon</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tipe Diskon</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountType"
                    value="PERCENTAGE"
                    checked={discountType === "PERCENTAGE"}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="h-4 w-4 text-bayaro-blue"
                  />
                  <span className="text-sm text-slate-700">Persentase (%)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountType"
                    value="NOMINAL"
                    checked={discountType === "NOMINAL"}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="h-4 w-4 text-bayaro-blue"
                  />
                  <span className="text-sm text-slate-700">Nominal (Rp)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nilai Diskon <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder={discountType === "PERCENTAGE" ? "10" : "50000"}
                min="0"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Minimal Order (Rp)</label>
              <Input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>

            {discountType === "PERCENTAGE" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Maksimal Diskon (Rp)</label>
                <Input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kondisi Voucher */}
      {type === "VOUCHER" && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Kode Voucher</h2>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DISKON2024"
              maxLength={20}
              required
            />
            <Button type="button" variant="outline" onClick={generateCode}>
              Generate
            </Button>
          </div>
        </div>
      )}

      {/* Kondisi Bundle */}
      {type === "BUNDLE" && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Paket Bundle</h2>
            <Button type="button" variant="outline" onClick={addBundleItem}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </div>
          <div className="space-y-3">
            {bundleItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Produk</label>
                  <Select
                    value={item.productId}
                    onChange={(e) => updateBundleItem(index, "productId", e.target.value)}
                    required
                  >
                    <option value="">Pilih Produk</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-24">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Beli</label>
                  <Input
                    type="number"
                    value={item.requiredQty}
                    onChange={(e) => updateBundleItem(index, "requiredQty", Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Gratis</label>
                  <Input
                    type="number"
                    value={item.freeQty}
                    onChange={(e) => updateBundleItem(index, "freeQty", Number(e.target.value))}
                    min="0"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeBundleItem(index)}
                  disabled={bundleItems.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kondisi Happy Hour */}
      {type === "HAPPY_HOUR" && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Jam Operasional</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Jam Mulai</label>
              <Select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Jam Selesai</label>
              <Select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Periode */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Periode & Batasan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal Mulai</label>
            <DatePicker value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal Selesai</label>
            <DatePicker value={endDate} onChange={setEndDate} />
          </div>
          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Batas Penggunaan</label>
            <Input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              placeholder="0 = unlimited"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isPending}>
          {initialData?.id ? "Perbarui Promo" : "Buat Promo"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/promos")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
