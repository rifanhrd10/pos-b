"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Store, Users, Boxes } from "lucide-react";
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
      if (result?.error) {
        setError(getErrorMessage(result.error));
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
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-emerald-50/50 to-cyan-50/80 px-6 py-10 text-center shadow-xl shadow-emerald-100/40 ring-1 ring-emerald-100 md:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-3 w-3 animate-bounce rounded-full bg-emerald-300/70" />
        <div className="absolute right-16 top-16 h-2 w-2 animate-pulse rounded-full bg-cyan-300/80" />
        <div className="absolute left-1/4 top-24 h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
        <div className="absolute bottom-20 right-1/4 h-3 w-3 animate-pulse rounded-full bg-fuchsia-300/70" />
        <div className="absolute bottom-12 left-20 h-2 w-2 rounded-full bg-sky-300/80" />
        <div className="absolute right-10 top-1/3 h-20 w-20 animate-[spin_18s_linear_infinite] rounded-full border border-emerald-200/70" />
        <div className="absolute bottom-10 left-1/3 h-16 w-16 animate-[spin_14s_linear_infinite] rounded-full border border-cyan-200/70" />
        <div className="absolute left-12 top-1/3 text-emerald-300/70 animate-pulse">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="absolute bottom-16 right-14 text-cyan-300/80 animate-pulse">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <div className="relative space-y-8">
        <div className="mx-auto flex h-28 w-28 animate-pulse items-center justify-center rounded-[32px] bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.75)] ring-8 ring-white/80">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Setup Selesai
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Toko kamu siap digunakan!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Semua fondasi bisnis sudah siap. Lanjut dengan dashboard kosong atau aktifkan data demo supaya tampilan laporan, outlet, dan tim langsung terasa hidup.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Store, title: "Outlet Aktif", desc: "Cabang pertama sudah siap dipakai" },
            { icon: Users, title: "Kelola Tim", desc: "Tambah kasir, admin, atau manager" },
            { icon: Boxes, title: "Siap Jualan", desc: "Lanjut setup produk dan transaksi" },
          ].map((item, i) => (
            <div key={i} className="rounded-[24px] bg-white/85 p-5 text-left shadow-lg shadow-slate-200/40 ring-1 ring-white/70 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-bayaro-soft to-cyan-100">
                <item.icon className="h-5 w-5 text-bayaro-blue" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-white/80 backdrop-blur-sm md:p-8">
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:text-left">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  Mau langsung coba dengan data demo?
                </h2>
                <p className="mt-3 text-slate-500">
                  Kami akan menambahkan struktur awal agar kamu bisa langsung eksplorasi dashboard dengan pengalaman yang lebih hidup.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {[
                    "3 Karyawan",
                    "2 Outlet",
                    "Role Manager & Kasir",
                    "PIN Demo",
                  ].map((badge) => (
                    <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 text-left shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Data Demo</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Karyawan</p>
                        <p className="text-xs text-slate-500">Manager + 2 kasir</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">3</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Outlet</p>
                        <p className="text-xs text-slate-500">Utama + cabang kedua</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-cyan-600">2</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button onClick={handleSeedDemo} isLoading={loading} className="h-12 text-base shadow-lg shadow-emerald-200/50">
                {loading ? "Menyiapkan Demo..." : "Ya, Isi Data Demo"}
              </Button>
              <Button variant="outline" onClick={handleSkip} disabled={loading} className="h-12 border-slate-200 bg-white/80 text-base backdrop-blur-sm">
                Mulai dari Dashboard Kosong
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
