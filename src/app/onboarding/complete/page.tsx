"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Store, Users, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/actions/onboarding";

export default function CompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSeedDemo() {
    setLoading(true);
    await seedDemoData();
    router.push("/dashboard");
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="space-y-8 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-inner ring-1 ring-emerald-100">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <Sparkles className="h-4 w-4" />
          Setup Selesai
        </div>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-900">
          Toko kamu siap digunakan!
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
          Selamat! Semua fondasi bisnis kamu sudah siap. Sekarang kamu bisa mulai dari dashboard kosong atau isi demo data dulu untuk mencoba semua fitur.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Store, title: "Outlet Aktif", desc: "Cabang pertama sudah siap dipakai" },
          { icon: Users, title: "Kelola Tim", desc: "Tambah kasir, admin, atau manager" },
          { icon: Boxes, title: "Siap Jualan", desc: "Lanjut setup produk dan transaksi" },
        ].map((item, i) => (
          <div key={i} className="rounded-[24px] bg-white p-5 text-left shadow-md shadow-slate-200/40 ring-1 ring-slate-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bayaro-soft">
              <item.icon className="h-5 w-5 text-bayaro-blue" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 md:p-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Mau langsung coba dengan data demo?
          </h2>
          <p className="mt-3 text-slate-500">
            Kami akan menambahkan beberapa karyawan, outlet contoh, dan struktur awal agar kamu bisa langsung eksplorasi dashboard dengan pengalaman yang lebih hidup.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleSeedDemo} isLoading={loading} className="h-12 text-base">
              {loading ? "Menyiapkan Demo..." : "Ya, Isi Data Demo"}
            </Button>
            <Button variant="outline" onClick={handleSkip} disabled={loading} className="h-12 text-base">
              Mulai dari Dashboard Kosong
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
