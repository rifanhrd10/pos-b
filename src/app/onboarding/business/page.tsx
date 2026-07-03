"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LogoUpload } from "@/components/shared/logo-upload";
import { setupBusiness } from "@/actions/onboarding";

const BUSINESS_TYPES = [
  { value: "COFFEE_SHOP", label: "Coffee Shop" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "VAPE_STORE", label: "Vape Store" },
  { value: "BARBERSHOP", label: "Barbershop" },
  { value: "RETAIL", label: "Retail" },
  { value: "FNB", label: "F&B" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "OTHER", label: "Lainnya" },
];

export default function BusinessPage() {
  const router = useRouter();
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (logo) formData.set("logo", logo);

    const result = await setupBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/onboarding/outlet");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-bayaro-soft px-4 py-2 text-sm font-medium text-bayaro-blue">
          <Sparkles className="h-4 w-4" />
          Langkah 1 dari 3
        </div>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-900">
          Ceritakan bisnis kamu
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">
          Mulai dengan identitas toko kamu. Informasi ini akan tampil di dashboard, struk, dan laporan penjualan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 md:p-8">
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <LogoUpload value={logo} onChange={setLogo} size="lg" />
          <div>
            <p className="font-semibold text-slate-900">Upload logo bisnis</p>
            <p className="mt-1 text-sm text-slate-500">PNG, JPG, atau WebP. Maksimal 2MB.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Nama bisnis</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="name" placeholder="Contoh: Kopi Bayaro" className="h-12 bg-slate-50 pl-11 text-base" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jenis usaha</label>
            <Select name="type" required defaultValue="" className="h-12 bg-slate-50 text-base">
              <option value="" disabled>Pilih jenis usaha</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nomor telepon</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="phone" placeholder="08xxxxxxxxxx" type="tel" className="h-12 bg-slate-50 pl-11 text-base" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Alamat bisnis</label>
            <textarea
              name="address"
              placeholder="Alamat lengkap bisnis kamu"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kota</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="city" placeholder="Jakarta" className="h-12 bg-slate-50 pl-11 text-base" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Provinsi</label>
            <Input name="province" placeholder="DKI Jakarta" className="h-12 bg-slate-50 text-base" />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">Nanti semua ini bisa kamu ubah lagi dari menu Settings.</p>
          <Button type="submit" isLoading={loading} className="h-12 min-w-[220px] text-base">
            {loading ? "Menyimpan..." : "Lanjut ke Outlet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
