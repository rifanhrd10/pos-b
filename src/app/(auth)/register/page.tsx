"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { BayaroLogo } from "@/components/shared/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerUser(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(result?.redirectTo || "/onboarding/business");
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background font-body-md text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      <div className="absolute inset-0 md:hidden">
        <img
          alt="Bayaro POS coffee shop"
          className="h-full w-full object-cover"
          src="/images/bayaro-login-background.png"
        />
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px]" />
      </div>

      <section className="relative hidden w-7/12 flex-col justify-between overflow-hidden bg-primary md:flex">
        <div className="absolute inset-0 z-0">
          <img
            alt="Bayaro POS coffee shop"
            className="h-full w-full object-cover"
            src="/images/bayaro-login-background.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/82 via-slate-950/48 to-slate-950/12" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <header className="relative z-10 flex w-full items-center justify-between px-12 py-8">
          <BayaroLogo dark white />
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-xl">
            <span className="flex items-center gap-2 font-label-md text-label-md text-white/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary-container" />
              Mulai toko baru
            </span>
          </div>
        </header>

        <div className="relative z-10 max-w-4xl px-16">
          <h1 className="mb-6 font-display-lg text-display-lg leading-[1.1] text-white">
            Buat Akun Bayaro dan <br />
            <span className="text-secondary-container">kelola POS lebih rapi.</span>
          </h1>
          <p className="mb-12 max-w-xl font-body-lg text-body-lg text-white/70">
            Daftar akun owner, lanjutkan setup toko, pilih paket, lalu aktifkan outlet dan kasir dari dashboard.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[
              ["storefront", "Setup Toko", "Mulai dari profil bisnis dan kode toko."],
              ["point_of_sale", "POS Kasir", "Kelola transaksi web dan Android."],
              ["sync", "Sinkron Data", "Data toko siap dipakai lintas perangkat."],
            ].map(([icon, title, description]) => (
              <div key={title} className="glass-card rounded-2xl p-6 transition-all duration-300">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <span className="material-symbols-outlined text-2xl text-secondary-container">{icon}</span>
                </div>
                <h2 className="mb-2 text-[16px] font-semibold text-white">{title}</h2>
                <p className="text-[13px] leading-relaxed text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative z-10 px-12 py-8">
          <p className="font-label-md text-label-md text-white/30">
            © {new Date().getFullYear()} Bayaro Technologies. Hak Cipta Dilindungi.
          </p>
        </footer>
      </section>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center bg-surface-container-lowest/95 px-8 py-8 md:bg-surface-container-lowest lg:px-24">
        <div className="w-full max-w-md rounded-[28px] bg-white/92 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
          <div className="mb-10 flex justify-center md:hidden">
            <BayaroLogo />
          </div>

          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">Daftar Owner</p>
            <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Buat Akun Baru</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Isi data owner terlebih dahulu. Setelah daftar, Anda akan masuk ke onboarding toko.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
              <span className="material-symbols-outlined mt-0.5 text-red-500">error</span>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block font-label-md text-label-md text-on-surface-variant" htmlFor="name">
                Nama Owner
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3.5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="mb-2 block font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3.5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                placeholder="owner@tokosaya.com"
              />
            </div>

            <PasswordField
              id="password"
              label="Password"
              show={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />

            <PasswordField
              id="confirmPassword"
              label="Konfirmasi Password"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
            />

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? "Membuat Akun..." : "Daftar dan Lanjut Setup"}
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Sudah punya akun?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/login">
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
}: {
  id: "password" | "confirmPassword";
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-label-md text-label-md text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          required
          minLength={8}
          className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3.5 pr-12 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
          placeholder="Minimal 8 karakter"
        />
        <button
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={onToggle}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">{show ? "visibility" : "visibility_off"}</span>
        </button>
      </div>
    </div>
  );
}
