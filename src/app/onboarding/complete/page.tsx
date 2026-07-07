"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, Store, Users, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/actions/onboarding";
import { getErrorMessage } from "@/lib/errors";

export default function CompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSeedDemo() {
    setLoading(true);
    setError("");

    try {
      const result = await seedDemoData();
      if (result?.err) {
        setError(getErrorMessage(result.err));
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-center justify-center text-center mx-auto">
      {/* Success Icon */}
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_20px_40px_-15px_rgba(16,185,129,0.5)] ring-4 ring-emerald-50">
        <CheckCircle2 className="h-12 w-12" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm border border-emerald-100">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Toko kamu siap digunakan!
      </h1>
      <p className="mt-4 text-lg text-slate-500 max-w-lg">
        Langkah terakhir: Mau lanjut ke dashboard kosong, atau isi dengan <strong className="text-slate-800">data demo</strong> agar laporan langsung terlihat hidup?
      </p>

      {/* Demo Data Option Card */}
      <div className="mt-10 w-full max-w-[600px] rounded-[32px] border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-200/30">
        <div className="rounded-[24px] bg-slate-50/80 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">3 Akun</p>
                <p className="text-xs text-slate-500">Manajer & Kasir</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">2 Outlet</p>
                <p className="text-xs text-slate-500">Cabang Aktif</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">15+ Menu</p>
                <p className="text-xs text-slate-500">Kategori & Varian</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-6 mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200 text-left">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 p-6 sm:p-8 pt-6">
          <Button onClick={handleSeedDemo} isLoading={loading} className="h-14 w-full text-base font-semibold shadow-[0_8px_20px_0_rgb(16,185,129,0.3)] bg-emerald-500 hover:bg-emerald-600 hover:shadow-[0_12px_25px_rgba(16,185,129,0.25)] border-0 text-white transition-all hover:-translate-y-[2px] rounded-2xl">
            {loading ? "Menyiapkan Demo..." : "Ya, Isi dengan Data Demo"}
          </Button>
          <Button variant="outline" onClick={handleSkip} disabled={loading} className="h-14 w-full text-base font-medium border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl">
            Mulai dari Nol Saja
          </Button>
        </div>
      </div>
    </div>
  );
}
