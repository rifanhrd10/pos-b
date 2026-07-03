"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoUpload } from "@/components/shared/logo-upload";
import { createFirstOutlet } from "@/actions/onboarding";

export default function OutletPage() {
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

    const result = await createFirstOutlet(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/complete");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-bayaro-navy">Outlet Pertama Kamu</h1>
        <p className="mt-2 text-slate-500">
          Ini bisa cabang pusat atau satu-satunya toko kamu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex justify-center">
          <LogoUpload value={logo} onChange={setLogo} size="sm" />
        </div>

        {/* Nama outlet */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Nama outlet <span className="text-rose-500">*</span>
          </label>
          <Input name="name" placeholder="Cabang Pusat" required />
        </div>

        {/* Alamat outlet */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Alamat outlet</label>
          <Input name="address" placeholder="Alamat lengkap outlet" />
        </div>

        {/* Kota & Telepon */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Kota</label>
            <Input name="city" placeholder="Kota" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nomor telepon</label>
            <Input name="phone" placeholder="08xxxxxxxxxx" type="tel" />
          </div>
        </div>

        {/* Jam buka & tutup */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam buka</label>
            <Input name="openTime" type="time" defaultValue="08:00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam tutup</label>
            <Input name="closeTime" type="time" defaultValue="22:00" />
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
          {loading ? "Menyimpan..." : "Lanjut →"}
        </Button>
      </form>
    </div>
  );
}
