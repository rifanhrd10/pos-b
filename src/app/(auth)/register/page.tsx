"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";

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
    <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 rounded-[36px] shadow-soft bg-white overflow-hidden">
      {/* Left branded panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-bayaro-navy to-[#102864] p-10 text-white">
        <BayaroLogo dark />
        <div className="space-y-4">
          <h1 className="font-heading text-3xl font-bold leading-tight">
            Mulai perjalanan bisnis Anda
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Daftar gratis dan nikmati kemudahan mengelola kasir, stok, dan laporan keuangan bisnis Anda dengan Bayaro POS.
          </p>
        </div>
        <p className="text-white/40 text-xs">© 2024 Bayaro. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <div className="lg:hidden mb-8">
          <BayaroLogo />
        </div>

        <h2 className="font-heading text-2xl font-bold text-bayaro-navy mb-2">
          Buat akun baru
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Isi data di bawah untuk membuat akun Bayaro Anda.
        </p>

        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
              Konfirmasi Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-bayaro-blue font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
