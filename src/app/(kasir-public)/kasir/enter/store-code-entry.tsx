"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Lock } from "lucide-react";
import { verifyStoreCode } from "@/actions/kasir-public";

export function StoreCodeEntry() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await verifyStoreCode(code.trim());
      if (!result.ok) {
        setError(result.error);
      } else {
        router.push(`/kasir/enter/outlets?businessId=${result.businessId}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">POS Kasir</h1>
          <p className="text-sm text-blue-100/80 mt-1">
            Masukkan kode toko untuk memulai
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">
              Kode Toko
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Contoh: BAYARO01"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-lg font-bold text-slate-800 pl-11 pr-4 py-3.5 rounded-xl transition-all outline-none tracking-wider uppercase"
                autoFocus
                autoComplete="off"
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              code.trim() && !isPending
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 cursor-pointer active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isPending ? "Memverifikasi..." : "Lanjutkan"}
            {!isPending && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <a
            href="/login"
            className="text-slate-400 text-xs hover:text-slate-600 transition-colors"
          >
            Masuk sebagai Owner / Manager
          </a>
        </div>
      </div>
    </div>
  );
}
