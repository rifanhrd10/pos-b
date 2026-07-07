"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";
import { ArrowRight, Shield, CloudLightning, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Changed to redirect to /login after registration per user request
      router.push("/login");
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr] bg-white">
      {/* Left Premium Graphic Panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0F1C] p-12 text-white lg:flex">
        {/* Abstract 3D Background - High quality Unsplash abstract */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1C] via-[#0A0F1C]/50 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        
        {/* Dynamic Orbs for depth */}
        <div className="absolute -left-[10%] top-[20%] h-[50vh] w-[50vh] animate-[spin_20s_linear_infinite] rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute -right-[10%] bottom-[10%] h-[60vh] w-[60vh] animate-[spin_25s_linear_infinite_reverse] rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative z-10">
          <BayaroLogo dark />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-md shadow-lg shadow-black/20">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Daftar Gratis — Setup 2 Menit
          </div>
          <h1 className="font-heading text-5xl font-bold leading-[1.15] tracking-tight">
            Mulai digitalisasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">bisnis kamu.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Dari coffee shop hingga barbershop, Bayaro POS membantu kamu mengelola penjualan, stok, dan laporan dalam satu dashboard terpadu.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: Shield, title: "Gratis Selamanya", desc: "Tanpa biaya bulanan, tanpa kartu kredit" },
              { icon: CloudLightning, title: "Setup Cepat", desc: "Online dalam hitungan menit" },
              { icon: Sparkles, title: "Multi Kategori", desc: "Cocok untuk semua jenis usaha" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} Bayaro Technologies.
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="flex items-center justify-center bg-white p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex justify-center lg:hidden">
            <BayaroLogo />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Buat Akun Baru
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Gratis selamanya. Isi data di bawah untuk memulai.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-rose-200/50 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 group/input">
              <label className="text-sm font-semibold text-slate-700 transition-colors group-focus-within/input:text-bayaro-blue">Nama Lengkap</label>
              <Input name="name" type="text" placeholder="Budi Santoso" className="h-12 border-slate-200 bg-slate-50/50 text-base shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-bayaro-blue/20 hover:bg-slate-50" required />
            </div>
            
            <div className="space-y-2 group/input">
              <label className="text-sm font-semibold text-slate-700 transition-colors group-focus-within/input:text-bayaro-blue">Email Address</label>
              <Input name="email" type="email" placeholder="nama@bisnis.com" className="h-12 border-slate-200 bg-slate-50/50 text-base shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-bayaro-blue/20 hover:bg-slate-50" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 group/input">
                <label className="text-sm font-semibold text-slate-700 transition-colors group-focus-within/input:text-bayaro-blue">Password</label>
                <Input name="password" type="password" placeholder="Min. 8 karakter" className="h-12 border-slate-200 bg-slate-50/50 text-base shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-bayaro-blue/20 hover:bg-slate-50" required />
              </div>
              <div className="space-y-2 group/input">
                <label className="text-sm font-semibold text-slate-700 transition-colors group-focus-within/input:text-bayaro-blue">Konfirmasi</label>
                <Input name="confirmPassword" type="password" placeholder="Ulangi password" className="h-12 border-slate-200 bg-slate-50/50 text-base shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-bayaro-blue/20 hover:bg-slate-50" required />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="group/btn relative w-full h-12 overflow-hidden rounded-xl bg-bayaro-blue text-base text-white shadow-[0_4px_14px_0_rgb(0,118,255,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-[1px]">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Mendaftarkan..." : "Daftar Gratis"}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-bayaro-blue transition-colors hover:text-blue-700 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
