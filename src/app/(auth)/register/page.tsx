"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { BayaroLogo } from "@/components/shared/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <main className="flex min-h-screen overflow-hidden text-on-background bg-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Left Hero Column */}
      <section className="relative hidden w-7/12 md:flex flex-col justify-between overflow-hidden bg-primary">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img alt="Modern POS setup" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2564&auto=format&fit=crop" />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Top Header */}
        <header className="relative z-10 flex justify-between items-center w-full px-12 py-8">
          <BayaroLogo dark white />
          <div className="bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
            <span className="flex items-center gap-2 font-label-md text-label-md text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
              Setup Cuma 2 Menit
            </span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-16 max-w-4xl">
          <h2 className="font-display-lg text-display-lg text-white mb-6 leading-[1.1]">
            Mulai digitalisasi <br /><span className="text-secondary-container">bisnis kamu.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-white/70 mb-16 max-w-xl">
            Dari coffee shop hingga barbershop, Bayaro POS membantu kamu mengelola penjualan, stok, dan laporan dalam satu dashboard terpadu.
          </p>

          {/* Redesigned Minimal Feature Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">loyalty</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Gratis Selamanya</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Tanpa biaya bulanan, tanpa kartu kredit.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">speed</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Setup Cepat</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Langsung online dalam hitungan menit saja.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">category</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Multi Kategori</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Cocok dan fleksibel untuk semua jenis usaha.</p>
            </div>
          </div>
        </div>

        {/* Footer Left */}
        <footer className="relative z-10 px-12 py-8">
          <p className="font-label-md text-label-md text-white/30">
            © {new Date().getFullYear()} Bayaro Technologies. Hak Cipta Dilindungi.
          </p>
        </footer>
      </section>

      {/* Right Form Column */}
      <section className="flex-1 bg-surface-container-lowest flex flex-col justify-center items-center px-8 lg:px-24 overflow-y-auto py-12">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center mb-10">
            <BayaroLogo />
          </div>
          
          <div className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Buat Akun Baru</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Gratis selamanya. Isi data di bawah untuk memulai.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
              <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary" htmlFor="name">Nama Lengkap</label>
              <input 
                id="name" 
                name="name"
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface" 
                placeholder="Budi Santoso" 
              />
            </div>
            
            <div className="group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email"
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface" 
                placeholder="nama@bisnis.com" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface pr-12" 
                    placeholder="Min. 8 karakter" 
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button" tabIndex={-1}>
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary" htmlFor="confirmPassword">Konfirmasi Password</label>
                <div className="relative">
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface pr-12" 
                    placeholder="Ulangi password" 
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button" tabIndex={-1}>
                    <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <button disabled={loading} className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98] custom-shadow disabled:opacity-70 disabled:cursor-not-allowed mt-2" type="submit">
              {loading ? "Mendaftarkan..." : "Daftar Gratis"}
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sudah punya akun? <Link className="text-secondary font-semibold hover:underline" href="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>

        {/* Footer Mobile */}
        <footer className="mt-12 w-full md:hidden flex flex-col gap-4 items-center pb-8">
          <div className="flex gap-6">
            <Link className="font-label-md text-label-md text-outline hover:text-on-surface" href="#">Bantuan</Link>
            <Link className="font-label-md text-label-md text-outline hover:text-on-surface" href="#">Privasi</Link>
            <Link className="font-label-md text-label-md text-outline hover:text-on-surface" href="#">Syarat</Link>
          </div>
          <p className="font-label-md text-label-md text-outline">© {new Date().getFullYear()} Bayaro Technologies.</p>
        </footer>
      </section>
    </main>
  );
}
