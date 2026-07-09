"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, seedDemoData } from "@/actions/onboarding";
import { cn } from "@/lib/utils";

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-10 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] bg-[#eff4ff] text-[#004ac6] font-display-lg font-bold text-[28px] border border-[#c2d3ff]">05</div>
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[32px] text-on-surface tracking-tight font-bold">Pengecekan Akhir</h1>
            <p className="text-primary font-label-md uppercase tracking-[0.1em] mt-1">Langkah Kelima: Pengecekan Akhir</p>
          </div>
        </div>
        <p className="font-body-md text-[15px] text-on-surface-variant max-w-4xl leading-relaxed mt-6">
          Periksa kembali ringkasan pengaturan bisnis Anda. <span className="text-primary font-medium">Jika sudah sesuai, silakan selesaikan untuk masuk ke Dashboard.</span>
        </p>
        <div className="mt-8 h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary w-full transition-all duration-700 ease-out "></div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 md:p-8 relative z-10 space-y-8">
        
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <div>
                <p className="font-label-sm text-xs text-outline uppercase tracking-wider mb-1">Bisnis</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">{summary.businessName}</p>
                <p className="font-body-md text-sm text-on-surface-variant">{summary.businessType}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">credit_card</span>
              </div>
              <div>
                <p className="font-label-sm text-xs text-outline uppercase tracking-wider mb-1">Plan</p>
                <div className="flex flex-col gap-1">
                  <p className="font-headline-sm text-headline-sm text-on-surface">{summary.planName}</p>
                  <span className="inline-flex items-center gap-1 font-label-sm text-[10px] text-tertiary bg-tertiary/10 px-2 py-1 rounded-md w-fit">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    Trial Pro s.d. {summary.trialEndsAt}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <p className="font-label-sm text-xs text-outline uppercase tracking-wider mb-1">Outlet</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">{summary.outletCount} outlet</p>
                <p className="font-body-md text-sm text-on-surface-variant line-clamp-1">{summary.outletNames.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="font-label-sm text-xs text-outline uppercase tracking-wider mb-1">Operasional</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {summary.openTime} – {summary.closeTime}
                </p>
                <p className="font-body-md text-sm text-on-surface-variant">
                  {summary.hasShift
                    ? `${summary.shiftCount} shift karyawan`
                    : "Tanpa shift, tutup kas 1x/hari"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-surface-container-low animate-pulse border border-outline-variant/30" />
            ))}
          </div>
        )}

        <div className="pt-8 border-t border-outline-variant/20 space-y-4">
          <button
            onClick={handleComplete}
            disabled={loading || seedLoading || !summary}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-4 rounded-xl font-label-lg text-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? "Menyiapkan dashboard..." : "Selesaikan & Masuk Dashboard"}
            {!loading && <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>}
          </button>
          
          <button
            onClick={handleSeedAndComplete}
            disabled={loading || seedLoading || !summary}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">magic_button</span>
            {seedLoading ? "Menambahkan data..." : "Isi dengan data contoh (untuk mencoba fitur)"}
          </button>
        </div>
      </div>
    </div>
  );
}
