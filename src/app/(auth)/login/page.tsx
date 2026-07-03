"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left branded panel */}
      <section className="relative hidden overflow-hidden bg-bayaro-navy lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07173f]/90 via-[#135FEF]/65 to-[#07173f]/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <BayaroLogo dark />
          <div className="max-w-xl">
            <p className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              Bayaro POS System
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Kelola bisnis kamu dari mana saja.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Sistem POS modern untuk semua jenis usaha — coffee shop, barbershop, vape store, restoran, dan lainnya.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4">
            {["Multi-Cabang", "Laporan Real-time", "Gratis Selamanya"].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-4 text-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-soft md:p-10">
          <div className="flex justify-center lg:hidden">
            <BayaroLogo />
          </div>
          <div className="mt-8 lg:mt-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">
              Masuk ke Bayaro
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Masukkan email dan password untuk mengakses dashboard.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="admin@bayaro.id" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input name="password" type="password" placeholder="Masukkan password" required />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded" /> Ingat saya
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-bayaro-blue hover:underline">
                Lupa password?
              </Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full justify-center py-3 text-base">
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-bayaro-blue hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
