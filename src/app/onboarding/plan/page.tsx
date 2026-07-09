"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectPlan } from "@/actions/onboarding";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";

type Plan = {
  id: string;
  name: string;
  displayName: string;
  maxOutlets: number;
  maxEmployees: number;
  features: string[];
  price: number;
};

const PLAN_ICONS = {
  starter: "bolt",
  pro: "rocket_launch",
  enterprise: "domain",
};

const PLAN_DESCRIPTIONS = {
  starter: "Untuk bisnis baru atau 1 toko.",
  pro: "Untuk bisnis yang berkembang dengan beberapa outlet.",
  enterprise: "Untuk jaringan bisnis skala besar.",
};

const FEATURE_LABELS: Record<string, string> = {
  basic_reports: "Laporan dasar",
  shift: "Manajemen shift karyawan",
  advanced_reports: "Laporan lengkap & analitik",
  export: "Export data (Excel/PDF)",
  api: "Akses API",
  priority_support: "Support prioritas",
};

function formatLimit(val: number, unit: string) {
  return val === -1 ? `Unlimited ${unit}` : `${val} ${unit}`;
}

export default function PlanPage() {
  const router = useRouter();
  const { plan, setPlan } = useOnboardingStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plan.plan || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data: Plan[]) => {
        setPlans(data);
        // If no saved plan, pre-select "starter" plan by default
        if (!plan.plan) {
          const starter = data.find((p) => p.name === "starter");
          if (starter) setSelectedPlanId(starter.id);
        }
      });
  }, []);

  async function handleSubmit() {
    if (!selectedPlanId) {
      setError("Pilih salah satu plan terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    
    // Save to store
    setPlan({ plan: selectedPlanId });
    
    const formData = new FormData();
    formData.append("planId", selectedPlanId);
    const result = await selectPlan(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/outlet");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full relative">
      {/* Ambient Gradient Blobs for Immersive Feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-20%] w-[600px] h-[600px] bg-tertiary-fixed-dim rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
      
      {/* Header */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline-md shadow-sm border border-outline-variant/30">
            02
          </div>
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-1">Pilih Plan</h1>
            <p className="font-label-md text-label-md text-primary uppercase tracking-wider">Langkah Kedua: Skala Bisnis</p>
          </div>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-4xl">
          Pilih paket yang paling sesuai dengan kebutuhan bisnis Anda. <span className="text-primary font-medium">Anda dapat mencoba fitur premium gratis selama 14 hari.</span>
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-8 overflow-hidden">
          <div className="bg-primary w-2/5 h-full rounded-full transition-all duration-700 ease-out"></div>
        </div>
      </div>

      {plans.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[500px] rounded-2xl bg-surface-container-low animate-pulse" />
          ))}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
        {plans.map((plan) => {
          const iconName = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] ?? "bolt";
          const isSelected = selectedPlanId === plan.id;
          const isPro = plan.name === "pro";

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "bg-surface-container-lowest rounded-2xl p-gutter flex flex-col relative overflow-hidden transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,74,198,0.1)]",
                isSelected
                  ? "border-2 border-primary shadow-[0_8px_30px_rgba(0,74,198,0.12)]"
                  : "border border-outline-variant shadow-sm hover:border-primary-fixed-dim"
              )}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-highest rounded-bl-full -mr-8 -mt-8 transition-transform duration-300 group-hover:scale-110"></div>
              )}
              
              {isPro && !isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white font-label-sm text-label-sm py-1 px-4 rounded-full uppercase tracking-wider shadow-md z-20">
                  Paling Populer
                </div>
              )}

              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10",
                  isSelected ? "bg-primary text-white shadow-md" : "bg-surface-container text-primary",
                  (isPro && !isSelected) ? "mt-2" : ""
                )}
              >
                <span className="material-symbols-outlined">{iconName}</span>
              </div>
              
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 relative z-10">
                {plan.displayName}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10 h-10">
                {PLAN_DESCRIPTIONS[plan.name as keyof typeof PLAN_DESCRIPTIONS]}
              </p>
              
              <div className="mb-8 relative z-10">
                {plan.price === 0 ? (
                  <span className="font-display-lg text-display-lg text-on-surface">Gratis</span>
                ) : (
                  <>
                    <span className="font-display-lg text-display-lg text-on-surface">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.price)}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">/bln</span>
                  </>
                )}
              </div>
              
              <div className="w-full h-px bg-outline-variant/50 mb-8 relative z-10"></div>
              
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                <li className="flex items-start gap-3">
                  <span className={cn("material-symbols-outlined text-xl", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">{formatLimit(plan.maxOutlets, "outlet")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={cn("material-symbols-outlined text-xl", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">{formatLimit(plan.maxEmployees, "karyawan")}</span>
                </li>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={cn("material-symbols-outlined text-xl", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                    <span className="font-body-md text-body-md text-on-surface">{FEATURE_LABELS[f] ?? f}</span>
                  </li>
                ))}
              </ul>
              
              {isSelected ? (
                <button type="button" className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center justify-center gap-2 relative z-10 transition-colors hover:bg-primary hover:text-white">
                  <span className="material-symbols-outlined text-lg">check</span>
                  Plan Terpilih
                </button>
              ) : (
                <button type="button" className="w-full py-3 rounded-xl border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors relative z-10">
                  Pilih {plan.displayName}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Element */}
      <div className="mt-auto bg-primary-fixed rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-primary-fixed-dim/50 mb-12 relative z-10">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high shrink-0">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEMSRBxPJRCwKo_8_cLQRmW5FbvtHDC-HNQ9tGHt2_DJjYewTDKTmRp5TqjWFk-1KEZzY2mmSmkEUeE-FpzONG-GM0FKAooLjcAT7h2nL53ewGC_Xn7BfeH6KXePfiUJULjjjDdXBGRlnWuToDldKsNVV6nyAIGAyRS2a1FfBvF50k9JwARde3YAhaXzWFteftzu13ptciI7b9Bdy0kqrk2xwidt50MA_Ja5oOpHE5Zr7EPn5A-0GX" alt="Budi Santoso"/>
        </div>
        <div>
          <p className="font-body-lg text-body-lg text-on-primary-fixed-variant italic mb-2">"Sejak beralih ke Pro Plan, pengelolaan 5 cabang coffee shop saya jadi jauh lebih mudah dan transparan."</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Budi Santoso - Owner, Kopi Senja</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 text-sm text-error bg-error-container rounded-lg relative z-10">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-outline-variant/30 flex flex-col-reverse md:flex-row justify-end gap-4 relative z-10">
        <button 
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container transition-colors shadow-sm"
          type="button" 
          onClick={() => router.push("/onboarding/business")}
          disabled={loading}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali
        </button>
        <button 
          className="w-full md:w-auto px-8 py-3 rounded-xl bg-primary text-white font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_4px_14px_rgba(0,74,198,0.2)] hover:shadow-[0_6px_20px_rgba(0,74,198,0.3)]"
          type="button" 
          onClick={handleSubmit}
          disabled={loading || !selectedPlanId}
        >
          {loading ? "Menyimpan..." : "Lanjut ke Setup Outlet"}
          {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
}
