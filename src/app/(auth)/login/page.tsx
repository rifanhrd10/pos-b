"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/actions/auth";
import { BayaroLogo } from "@/components/shared/logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<"admin" | "manager" | "kasir" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", loginEmail);
    formData.append("password", loginPassword);
    const result = await loginUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setLoadingDemo(null);
    } else {
      router.push(result?.redirectTo || "/dashboard");
    }
  };

  const handleDemo = async (role: 'admin' | 'kasir' | 'manager') => {
    const demoEmail = `${role}@bayaro.id`;
    setEmail(demoEmail);
    setPassword("demo123");
    setLoadingDemo(role);
    await performLogin(demoEmail, "demo123");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await performLogin(email, password);
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden text-on-background bg-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      <div className="absolute inset-0 md:hidden">
        <img alt="Bayaro POS coffee shop" className="h-full w-full object-cover" src="/images/bayaro-login-background.png" />
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px]" />
      </div>
      {/* Left Hero Column */}
      <section className="relative hidden w-7/12 md:flex flex-col justify-between overflow-hidden bg-primary">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img alt="Bayaro POS coffee shop" className="w-full h-full object-cover" src="/images/bayaro-login-background.png" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/82 via-slate-950/48 to-slate-950/12"></div>
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Top Header */}
        <header className="relative z-10 flex justify-between items-center w-full px-12 py-8">
          <BayaroLogo dark white />
          <div className="bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
            <span className="flex items-center gap-2 font-label-md text-label-md text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
              Bayaro POS v2.0
            </span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-16 max-w-4xl">
          <h2 className="font-display-lg text-display-lg text-white mb-6 leading-[1.1]">
            Solusi POS Terpercaya untuk <br /><span className="text-secondary-container">UMKM Indonesia.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-white/70 mb-16 max-w-xl">
            Kelola ribuan transaksi, monitor puluhan cabang, dan analisa performa bisnis secara real-time dari satu dashboard intuitif.
          </p>

          {/* Redesigned Minimal Feature Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">storefront</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Multi Cabang</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Satu akun untuk kendali penuh banyak toko.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">monitoring</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Real-time</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Pantau omzet langsung dari mana saja.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined text-secondary-container text-2xl">credit_card</span>
              </div>
              <h3 className="font-title-lg text-[16px] text-white mb-2 font-semibold">Multi Payment</h3>
              <p className="font-label-md text-[13px] text-white/50 leading-relaxed">Terima QRIS, Tunai, dan EDC instan.</p>
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

      {/* Right Login Column */}
      <section className="relative z-10 flex-1 bg-surface-container-lowest/95 md:bg-surface-container-lowest flex flex-col justify-center items-center px-8 py-8 lg:px-24">
        <div className="w-full max-w-md rounded-[28px] bg-white/92 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center mb-12">
            <BayaroLogo />
          </div>
          
          <div className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Selamat Datang</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Silakan masukkan email dan password untuk masuk ke dashboard admin.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
              <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface" 
                placeholder="nama@bisnis.com" 
              />
            </div>
            
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-md text-label-md text-on-surface-variant transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
                <Link className="font-label-md text-label-md text-secondary hover:underline" href="/forgot-password">Lupa password?</Link>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-surface pr-12" 
                  placeholder="••••••••" 
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>
            
            <button disabled={loading} className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98] custom-shadow disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
              {loading ? "Membuka Dashboard..." : "Masuk ke Dashboard"}
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Belum punya akun? <Link className="text-secondary font-semibold hover:underline" href="/register">Daftar Gratis Sekarang</Link>
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-outline-variant/60 bg-white/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">Akun Demo</p>
                <p className="mt-1 text-sm text-on-surface-variant">Klik salah satu akun untuk masuk otomatis.</p>
              </div>
              <span className="material-symbols-outlined text-primary">bolt</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { role: "admin" as const, label: "Owner", email: "admin@bayaro.id" },
                { role: "manager" as const, label: "Manager", email: "manager@bayaro.id" },
                { role: "kasir" as const, label: "Kasir", email: "kasir@bayaro.id" },
              ].map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemo(account.role)}
                  disabled={loading}
                  className="rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-left transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="block text-sm font-bold text-on-surface">
                    {loadingDemo === account.role ? "Masuk..." : account.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-on-surface-variant">{account.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kasir Entry */}
          <div className="relative my-6">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/40"></div>
            </div>
            <div className="relative flex justify-center text-label-md uppercase tracking-widest font-label-md">
              <span className="bg-white px-4 text-outline/50 md:bg-surface-container-lowest">atau</span>
            </div>
          </div>

          <Link
            href="/kasir/enter"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>point_of_sale</span>
            Masuk sebagai Kasir
          </Link>
        </div>

        {/* Footer Mobile */}
        <footer className="relative z-10 mt-16 w-full md:hidden flex flex-col gap-4 items-center">
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
