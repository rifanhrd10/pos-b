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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDemo = (role: 'admin' | 'kasir' | 'manager') => {
    setEmail(`${role}@bayaro.id`);
    setPassword("demo123");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const result = await loginUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen overflow-hidden text-on-background bg-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Left Hero Column */}
      <section className="relative hidden w-7/12 md:flex flex-col justify-between overflow-hidden bg-primary">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img alt="Modern POS setup" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMkfvqYg4Vi6MlSuFFVlDYjk2X0HCKu0nQwBILABN3ocA9iXCisXldartSydijcBrYj2aMtqzuNBAAn_zP1Kru_2H0-wH4OfUsjblraA907u96kBPI4sS5b0HtXYCs2l--yDzyh77DfluVMR9mzebzHhGRzic0RWmvPPNSe7Gjr_LjtIcyRwOtNQALZ16mPepKaX3fK3EW_y77Rw5AHpYIgIKoHB572NzxCq27etXomtuaWM3Tlw" />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Top Header */}
        <header className="relative z-10 flex justify-between items-center w-full px-12 py-8">
          <BayaroLogo dark />
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
      <section className="flex-1 bg-surface-container-lowest flex flex-col justify-center items-center px-8 lg:px-24">
        <div className="w-full max-w-md">
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

          {/* Kasir Entry */}
          <div className="relative my-6">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/40"></div>
            </div>
            <div className="relative flex justify-center text-label-md uppercase tracking-widest font-label-md">
              <span className="bg-surface-container-lowest px-4 text-outline/50">atau</span>
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
        <footer className="mt-16 w-full md:hidden flex flex-col gap-4 items-center">
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
