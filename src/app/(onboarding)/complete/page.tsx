"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/actions/onboarding";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSeedDemo() {
    setLoading(true);
    await seedDemoData();
    router.push("/dashboard");
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8 pt-6">
      {/* Success icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-bayaro-navy">
          Toko Kamu Siap! 🎉
        </h1>
        <p className="text-slate-500">
          Selamat! Kamu sudah bisa mulai menggunakan Bayaro POS
        </p>
      </div>

      {/* Demo data card */}
      <div className="w-full rounded-[28px] border border-slate-100 bg-slate-50 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-center gap-2 text-bayaro-navy font-semibold">
          <Sparkles size={18} className="text-bayaro-blue" />
          <span>Mau coba dengan data demo?</span>
        </div>
        <p className="text-sm text-slate-500">
          Kami akan tambahkan beberapa karyawan dan outlet contoh agar kamu bisa
          langsung eksplorasi
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSeedDemo}
            disabled={loading}
            className="flex-1 py-3"
          >
            {loading ? "Mengisi data..." : "Ya, Isi Data Demo"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 py-3"
          >
            Tidak, Mulai Kosong
          </Button>
        </div>
      </div>
    </div>
  );
}
