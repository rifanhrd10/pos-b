"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, MapPin, Phone, Store, Sparkles } from "lucide-react";
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

    const formData = new FormData(e.currentTarget);
    if (logo) formData.set("logo", logo);

    const result = await createFirstOutlet(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/onboarding/complete");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-bayaro-soft px-4 py-2 text-sm font-medium text-bayaro-blue">
          <Sparkles className="h-4 w-4" />
          Langkah 2 dari 3
        </div>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-900">
          Buat outlet pertama kamu
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">
          Ini bisa jadi cabang pusat atau satu-satunya outlet yang kamu miliki sekarang. Nanti kamu bisa tambah cabang lagi kapan saja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 md:p-8">
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <LogoUpload value={logo} onChange={setLogo} size="sm" />
          <div>
            <p className="font-semibold text-slate-900">Upload logo outlet</p>
            <p className="mt-1 text-sm text-slate-500">Boleh sama dengan logo bisnis, boleh beda.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Nama outlet</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="name" placeholder="Contoh: Cabang Pusat" className="h-12 bg-slate-50 pl-11 text-base" required />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Alamat outlet</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <textarea
                name="address"
                placeholder="Alamat lengkap outlet"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kota</label>
            <Input name="city" placeholder="Jakarta" className="h-12 bg-slate-50 text-base" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nomor telepon</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="phone" placeholder="08xxxxxxxxxx" type="tel" className="h-12 bg-slate-50 pl-11 text-base" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jam buka</label>
            <div className="relative">
              <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="openTime" type="time" defaultValue="08:00" className="h-12 bg-slate-50 pl-11 text-base" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jam tutup</label>
            <div className="relative">
              <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="closeTime" type="time" defaultValue="22:00" className="h-12 bg-slate-50 pl-11 text-base" />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">Kalau bisnis kamu punya banyak cabang, nanti bisa tambah outlet lagi.</p>
          <Button type="submit" isLoading={loading} className="h-12 min-w-[220px] text-base">
            {loading ? "Menyimpan..." : "Selesaikan Setup"}
          </Button>
        </div>
      </form>
    </div>
  );
}
