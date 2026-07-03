"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[460px] rounded-[36px] shadow-soft bg-white p-8 sm:p-12">
      <div className="flex justify-center mb-8">
        <BayaroLogo />
      </div>

      <h2 className="font-heading text-2xl font-bold text-bayaro-navy text-center mb-2">
        Lupa Password
      </h2>
      <p className="text-slate-500 text-sm text-center mb-8">
        Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
      </p>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-sm text-emerald-700 text-center">
          <p className="font-semibold mb-1">Link reset sudah dikirim!</p>
          <p className="text-emerald-600">
            Silakan cek inbox email Anda untuk melanjutkan.
          </p>
        </div>
      ) : (
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-bayaro-blue font-semibold hover:underline">
          ← Kembali ke halaman login
        </Link>
      </p>
    </div>
  );
}
