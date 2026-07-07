"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectPlan } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";

import { Check, Zap, Building2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

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
  starter: Zap,
  pro: Rocket,
  enterprise: Building2,
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

function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return (
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price) + "/bln"
  );
}

function formatLimit(val: number, unit: string) {
  return val === -1 ? `Unlimited ${unit}` : `${val} ${unit}`;
}

export default function PlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data: Plan[]) => {
        setPlans(data);
        // Pre-select "starter" plan by default
        const starter = data.find((p) => p.name === "starter");
        if (starter) setSelectedPlanId(starter.id);
      });
  }, []);

  async function handleSubmit() {
    if (!selectedPlanId) {
      setError("Pilih salah satu plan terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
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
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1.5 text-sm font-medium text-cyan-700">
          <Zap className="h-3.5 w-3.5" />
          14 Hari Trial Pro Gratis untuk semua akun baru
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Pilih Plan</h1>
        <p className="text-slate-500">
          Pilih plan yang sesuai. Semua akun baru mendapat 14 hari akses Pro secara gratis.
        </p>
      </div>

      {plans.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon =
            PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] ?? Zap;
          const isSelected = selectedPlanId === plan.id;
          const isPro = plan.name === "pro";

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-md focus:outline-none",
                isSelected
                  ? "border-cyan-500 bg-cyan-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300",
                isPro && !isSelected && "border-cyan-200"
              )}
            >
              {isPro && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-cyan-500 text-white text-xs font-semibold px-3 py-1">
                  Paling Populer
                </span>
              )}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl mb-4",
                  isSelected
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                {plan.displayName}
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-3">
                {PLAN_DESCRIPTIONS[plan.name as keyof typeof PLAN_DESCRIPTIONS]}
              </p>
              <div className="text-2xl font-bold text-slate-900 mb-4">
                {formatPrice(plan.price)}
              </div>
              <ul className="space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {formatLimit(plan.maxOutlets, "outlet")}
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {formatLimit(plan.maxEmployees, "karyawan")}
                </li>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {FEATURE_LABELS[f] ?? f}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                  <Check className="h-4 w-4" />
                  Dipilih
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/onboarding/business")}
          disabled={loading}
        >
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedPlanId}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600"
        >
          {loading ? "Menyimpan..." : "Lanjut"}
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Plan dapat diubah kapan saja melalui halaman Pengaturan. Trial Pro 14
        hari tidak memerlukan kartu kredit.
      </p>
    </div>
  );
}
