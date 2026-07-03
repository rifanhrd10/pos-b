"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";
import { ArrowRight, Store, BarChart3, CreditCard } from "lucide-react";

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
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left branded panel - Modern Glassmorphism */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-bayaro-navy p-12 text-white lg:flex">
        {/* Dynamic background elements */}
        <div className="absolute -left-[20%] -top-[10%] h-[70%] w-[70%] rounded-full bg-bayaro-blue/30 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-cyan-400/20 blur-[120px]" />
        
        <div className="relative z-10">
          <BayaroLogo dark />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            Bayaro POS v2.0
          </div>
          <h1 className="font-heading text-5xl font-bold leading-[1.15] tracking-tight">
            Sistem POS modern untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">skala tak terbatas.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-blue-100/80">
            Kelola ribuan transaksi, monitor puluhan cabang, dan analisa performa bisnis secara real-time dari satu dashboard intuitif.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Store, title: "Multi Cabang", desc: "Satu akun, banyak toko" },
              { icon: BarChart3, title: "Laporan Real-time", desc: "Pantau omzet langsung" },
              { icon: CreditCard, title: "Multi Payment", desc: "QRIS, Cash, EDC" },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <feature.icon className="mb-3 h-6 w-6 text-cyan-300" />
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs text-blue-200/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200/60">
          © {new Date().getFullYear()} Bayaro Technologies.
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center bg-slate-50 p-6 md:p-12 lg:bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center lg:hidden">
            <BayaroLogo />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang Kembali
            </h2>
            <p className="mt-3 text-slate-500">
              Silakan masukkan email dan password untuk masuk ke dashboard admin.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="nama@bisnis.com" 
                className="h-12 bg-slate-50 text-base lg:bg-white" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-bayaro-blue transition-colors hover:text-blue-700 hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 bg-slate-50 text-base lg:bg-white" 
                required 
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={loading} className="group w-full h-12 text-base">
                {loading ? "Membuka Dashboard..." : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun Bayaro?{" "}
              <Link href="/register" className="font-semibold text-bayaro-blue transition-colors hover:text-blue-700 hover:underline">
                Daftar Gratis Sekarang
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
