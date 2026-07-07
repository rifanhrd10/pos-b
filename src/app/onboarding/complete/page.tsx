"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, seedDemoData } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Building2, Store, Clock, CreditCard, PartyPopper } from "lucide-react";

type Summary = {
  businessName: string;
  businessType: string;
  planName: string;
  trialEndsAt: string;
  outletCount: number;
  outletNames: string[];
  openTime: string;
  closeTime: string;
  hasShift: boolean;
  shiftCount: number;
};

export default function CompletePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/summary")
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  async function handleComplete() {
    setLoading(true);
    await completeOnboarding();
    router.push("/dashboard");
  }

  async function handleSeedAndComplete() {
    setSeedLoading(true);
    await seedDemoData();
    await completeOnboarding();
    router.push("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <PartyPopper className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Hampir selesai!</h1>
        <p className="text-slate-500">Cek ringkasan setup bisnis Anda sebelum masuk ke dashboard.</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Bisnis</p>
                <p className="font-semibold text-slate-900">{summary.businessName}</p>
                <p className="text-sm text-slate-500">{summary.businessType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Plan</p>
                <p className="font-semibold text-slate-900">
                  {summary.planName}{" "}
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Trial Pro s.d. {summary.trialEndsAt}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Outlet</p>
                <p className="font-semibold text-slate-900">{summary.outletCount} outlet</p>
                <p className="text-sm text-slate-500">{summary.outletNames.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Operasional</p>
                <p className="font-semibold text-slate-900">
                  {summary.openTime} – {summary.closeTime}
                </p>
                <p className="text-sm text-slate-500">
                  {summary.hasShift
                    ? `${summary.shiftCount} shift karyawan`
                    : "Tanpa shift, tutup kas 1x/hari"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!summary && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleComplete}
          disabled={loading || seedLoading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 h-12 text-base font-semibold"
        >
          {loading ? "Memuat dashboard..." : "Mulai Gunakan Bayaro →"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSeedAndComplete}
          disabled={loading || seedLoading}
          className="w-full h-11 text-sm text-slate-500"
        >
          {seedLoading ? "Menambahkan data..." : "Isi dengan data contoh (untuk mencoba fitur)"}
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Semua pengaturan dapat diubah kapan saja melalui halaman Pengaturan.
      </p>
    </div>
  );
}
