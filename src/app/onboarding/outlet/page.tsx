"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, MapPin, Phone, Store, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoUpload } from "@/components/shared/logo-upload";
import { createOutlets } from "@/actions/onboarding";

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

    const result = await createOutlets(formData);

    if (result?.err) {
      setError(result.err);
      setLoading(false);
    } else {
      router.push("/onboarding/complete");
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
          Buat Outlet Pertama
        </h1>
        <p className="mt-1.5 text-base text-slate-500 max-w-xl">
          Ini adalah cabang pertama Anda. Dapat ditambah lagi nanti.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Logo Upload Section - Compact */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <LogoUpload value={logo} onChange={setLogo} size="sm" />
          <div className="mt-2 sm:mt-0">
            <h3 className="text-sm font-semibold text-slate-900">Logo Outlet (Opsional)</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs">
              Gunakan logo yang sama dengan bisnis, atau buat khusus outlet.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Compact Form Grid */}
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2 group/input">
            <label className="text-sm font-bold text-slate-900">Nama Outlet</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-bayaro-blue" />
              <Input name="name" placeholder="Contoh: Cabang Pusat Sudirman" className="h-11 border-slate-200 bg-white pl-10 text-sm shadow-sm transition-all focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300" required />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2 group/input">
            <label className="text-sm font-bold text-slate-900">Alamat Outlet</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within/input:text-bayaro-blue" />
              <textarea
                name="address"
                placeholder="Alamat lengkap outlet beroperasi"
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300 resize-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 group/input">
            <label className="text-sm font-bold text-slate-900">Kota</label>
            <Input name="city" placeholder="Jakarta" className="h-11 border-slate-200 bg-white text-sm shadow-sm transition-all focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300" />
          </div>

          <div className="space-y-1.5 group/input">
            <label className="text-sm font-bold text-slate-900">Nomor Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-bayaro-blue" />
              <Input name="phone" placeholder="08xxxxxxxxxx" type="tel" className="h-11 border-slate-200 bg-white pl-10 text-sm shadow-sm transition-all focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300" />
            </div>
          </div>

          <div className="space-y-1.5 group/input">
            <label className="text-sm font-bold text-slate-900">Jam Buka</label>
            <div className="relative">
              <Clock3 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-bayaro-blue" />
              <Input name="openTime" type="time" defaultValue="08:00" className="h-11 border-slate-200 bg-white pl-10 text-sm shadow-sm transition-all focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300" />
            </div>
          </div>

          <div className="space-y-1.5 group/input">
            <label className="text-sm font-bold text-slate-900">Jam Tutup</label>
            <div className="relative">
              <Clock3 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-bayaro-blue" />
              <Input name="closeTime" type="time" defaultValue="22:00" className="h-11 border-slate-200 bg-white pl-10 text-sm shadow-sm transition-all focus:border-bayaro-blue focus:ring-4 focus:ring-bayaro-blue/10 hover:border-slate-300" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex animate-in fade-in items-start gap-3 rounded-xl border border-rose-200/50 bg-rose-50 p-3 text-sm text-rose-600 shadow-sm">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">Hampir selesai! Tinggal selangkah lagi.</p>
          <Button type="submit" isLoading={loading} className="group/btn relative h-12 w-full overflow-hidden rounded-xl bg-bayaro-blue text-sm text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:-translate-y-[1px] sm:w-auto sm:min-w-[200px]">
            <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
              {loading ? "Menyimpan..." : "Selesaikan Setup"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
