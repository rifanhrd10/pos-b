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
    <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 rounded-[36px] shadow-soft bg-white overflow-hidden">
      {/* Left branded panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-bayaro-navy to-[#102864] p-10 text-white">
        <BayaroLogo dark />
        <div className="space-y-4">
          <h1 className="font-heading text-3xl font-bold leading-tight">
            Kelola bisnis Anda dengan mudah
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Bayaro POS — solusi lengkap untuk manajemen kasir, inventori, dan laporan bisnis Anda dalam satu platform.
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
          Masuk ke akun Anda
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Selamat datang kembali! Silakan masuk untuk melanjutkan.
        </p>

        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Masukkan password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                className="rounded border-slate-300 text-bayaro-blue focus:ring-bayaro-blue"
              />
              Ingat saya
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-bayaro-blue hover:underline"
            >
              Lupa password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="text-bayaro-blue font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
