"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";
import { ArrowRight, Sparkles, Shield, CloudLightning } from "lucide-react";

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
      router.push("/onboarding/business");
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left branded panel - Modern Gradient Mesh */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#071A49] via-[#0C2F6B] to-[#135FEF] p-12 text-white lg:flex">
        {/* Animated mesh background */}
        <div className="absolute -left-[20%] -top-[20%] h-[80%] w-[80%] rounded-full bg-cyan-300/20 blur-[150px]" />
        <div className="absolute -bottom-[30%] -right-[10%] h-[70%] w-[70%] rounded-full bg-violet-400/15 blur-[150px]" />
        <div className="absolute left-[30%] top-[40%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative z-10">
          <BayaroLogo dark />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-5 py-2.5 text-sm font-medium backdrop-blur-md shadow-lg shadow-black/5">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Daftar Gratis — Setup 2 Menit
          </div>
          <h1 className="font-heading text-5xl font-bold leading-[1.1] tracking-tight">
            Mulai digitalisasi <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-violet-200">bisnis kamu</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-blue-100/80">
            Dari coffee shop hingga barbershop, Bayaro POS membantu kamu mengelola penjualan, stok, dan laporan dalam satu dashboard terpadu.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Shield, title: "Gratis Selamanya", desc: "Tanpa biaya bulanan, tanpa kartu kredit" },
              { icon: CloudLightning, title: "Setup Cepat", desc: "Online dalam hitungan menit" },
              { icon: Sparkles, title: "Multi Kategori", desc: "Cocok untuk semua jenis usaha" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <item.icon className="h-4 w-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-blue-200/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200/60">
          © {new Date().getFullYear()} Bayaro Technologies.
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center lg:hidden">
            <BayaroLogo />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Buat Akun Baru
            </h2>
            <p className="mt-3 text-slate-500">
              Gratis selamanya. Isi data di bawah untuk memulai, lalu setup toko kamu setelahnya.
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <Input name="name" type="text" placeholder="Budi Santoso" className="h-12 bg-slate-50 text-base" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <Input name="email" type="email" placeholder="nama@bisnis.com" className="h-12 bg-slate-50 text-base" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Input name="password" type="password" placeholder="Min. 8 karakter" className="h-12 bg-slate-50 text-base" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Konfirmasi</label>
                <Input name="confirmPassword" type="password" placeholder="Ulangi password" className="h-12 bg-slate-50 text-base" required />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={loading} className="group w-full h-12 text-base">
                {loading ? "Mendaftarkan..." : (
                  <>
                    Daftar Gratis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-bayaro-blue transition-colors hover:text-blue-700 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
