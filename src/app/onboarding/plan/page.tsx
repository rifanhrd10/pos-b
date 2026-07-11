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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-10 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] bg-[#eff4ff] text-[#004ac6] font-display-lg font-bold text-[28px] border border-[#c2d3ff]">02</div>
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[32px] text-on-surface tracking-tight font-bold">Pilih Plan</h1>
            <p className="text-primary font-label-md uppercase tracking-[0.1em] mt-1">Langkah Kedua: Skala Bisnis</p>
          </div>
        </div>
        <p className="font-body-md text-[15px] text-on-surface-variant max-w-4xl leading-relaxed mt-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10 pt-4">
        {plans.map((plan) => {
          const iconName = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] ?? "bolt";
          const isSelected = selectedPlanId === plan.id;
          const isPro = plan.name === "pro";

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "bg-white rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-1 hover:shadow-lg",
                isSelected
                  ? "border-2 border-primary shadow-[0_8px_30px_rgba(0,74,198,0.12)]"
                  : "border border-outline-variant/30 shadow-sm hover:border-outline-variant"
              )}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-outline-variant/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-300 group-hover:scale-110"></div>
              )}
              
              {isPro && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white font-label-sm text-[10px] py-1 px-4 rounded-b-lg uppercase tracking-wider shadow-sm z-20">
                  Paling Populer
                </div>
              )}

              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-4 relative z-10",
                  isSelected ? "bg-primary text-white shadow-md" : "bg-primary/10 text-primary",
                  isPro ? "mt-4" : ""
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{iconName}</span>
              </div>
              
              <h3 className="font-headline-sm text-[18px] text-on-surface mb-1 relative z-10 font-bold">
                {plan.displayName}
              </h3>
              <p className="font-body-md text-[13px] text-on-surface-variant mb-4 relative z-10 min-h-[40px]">
                {PLAN_DESCRIPTIONS[plan.name as keyof typeof PLAN_DESCRIPTIONS]}
              </p>
              
              <div className="mb-4 relative z-10 h-12 flex items-center">
                {plan.price === 0 ? (
                  <span className="font-display-lg text-[40px] font-bold text-on-surface tracking-tight leading-none">Gratis</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display-lg text-[32px] font-bold text-on-surface tracking-tight leading-none">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.price)}
                    </span>
                    <span className="font-body-md text-[13px] text-on-surface-variant font-medium">/bln</span>
                  </div>
                )}
              </div>
              
              <div className="w-full h-px bg-outline-variant/30 mb-5 relative z-10"></div>
              
              <ul className="space-y-3 mb-6 flex-1 relative z-10">
                <li className="flex items-center gap-3">
                  <span className={cn("material-symbols-outlined text-[18px]", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                  <span className="font-body-md text-[13px] text-on-surface">{formatLimit(plan.maxOutlets, "outlet")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className={cn("material-symbols-outlined text-[18px]", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                  <span className="font-body-md text-[13px] text-on-surface">{formatLimit(plan.maxEmployees, "karyawan")}</span>
                </li>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className={cn("material-symbols-outlined text-[18px]", isSelected ? "text-primary" : "text-on-surface-variant")}>check_circle</span>
                    <span className="font-body-md text-[13px] text-on-surface">{FEATURE_LABELS[f] ?? f}</span>
                  </li>
                ))}
              </ul>
              
              {isSelected ? (
                <button type="button" className="w-full py-2.5 rounded-lg bg-[#002f7a] text-white font-label-md text-[13px] flex items-center justify-center gap-2 relative z-10 transition-colors shadow-md mt-auto">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Plan Terpilih
                </button>
              ) : (
                <button type="button" className="w-full py-2.5 rounded-lg border border-outline-variant/50 text-on-surface font-label-md text-[13px] hover:bg-surface-container-low transition-colors relative z-10 mt-auto">
                  Pilih {plan.displayName}
                </button>
              )}
            </div>
          );
        })}
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
