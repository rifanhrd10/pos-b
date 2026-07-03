"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (logo) formData.set("logo", logo);

    const result = await setupBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/outlet");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-bayaro-navy">Bangun Toko Kamu</h1>
        <p className="mt-2 text-slate-500">Ceritakan tentang bisnis kamu</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex justify-center">
          <LogoUpload value={logo} onChange={setLogo} size="lg" />
        </div>

        {/* Nama bisnis */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Nama bisnis <span className="text-rose-500">*</span>
          </label>
          <Input name="name" placeholder="Nama bisnis kamu" required />
        </div>

        {/* Jenis usaha */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Jenis usaha <span className="text-rose-500">*</span>
          </label>
          <Select name="type" required defaultValue="">
            <option value="" disabled>
              Pilih jenis usaha
            </option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Nomor telepon */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Nomor telepon</label>
          <Input name="phone" placeholder="08xxxxxxxxxx" type="tel" />
        </div>

        {/* Alamat */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Alamat</label>
          <textarea
            name="address"
            placeholder="Alamat lengkap bisnis"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-blue-100 resize-none"
          />
        </div>

        {/* Kota & Provinsi */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Kota</label>
            <Input name="city" placeholder="Kota" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Provinsi</label>
            <Input name="province" placeholder="Provinsi" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-base"
        >
          {loading ? "Menyimpan..." : "Lanjut — Buat Outlet Pertama →"}
        </Button>
      </form>
    </div>
  );
}
