"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BayaroLogo } from "@/components/shared/logo";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BayaroLogo />
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 md:p-10">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900">
                Cek Email Kamu!
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Kami sudah kirim link reset password ke email kamu. Silakan cek inbox (atau folder spam).
              </p>
              <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-bayaro-blue" />
                  <p className="text-sm text-slate-600">
                    Tidak menerima email? Coba periksa folder spam atau request ulang dalam beberapa menit.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-bayaro-blue transition-colors hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  Lupa Password?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Tenang, masukkan email terdaftar kamu dan kami kirim link reset.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="nama@bisnis.com"
                    className="h-12 bg-slate-50 text-base"
                    required
                  />
                </div>
                <Button type="submit" isLoading={loading} className="w-full h-12 text-base">
                  {loading ? "Mengirim Link..." : "Kirim Link Reset"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
