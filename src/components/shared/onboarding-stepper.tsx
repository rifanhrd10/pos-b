"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Profil Bisnis", path: "/onboarding/business" },
  { label: "Outlet", path: "/onboarding/outlet" },
  { label: "Selesai", path: "/onboarding/complete" },
];

function getStep(pathname: string) {
  if (pathname.includes("/complete")) return 2;
  if (pathname.includes("/outlet")) return 1;
  return 0;
}

export function OnboardingStepper() {
  const pathname = usePathname();
  const current = getStep(pathname);

  return (
    <nav className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                done && "bg-emerald-500 text-white",
                active && "bg-bayaro-blue text-white ring-4 ring-bayaro-blue/20",
                !done && !active && "bg-slate-200 text-slate-400",
              )}>
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </div>
              <span className={cn(
                "hidden text-sm font-medium sm:block",
                active && "text-slate-900",
                done && "text-emerald-600",
                !done && !active && "text-slate-400",
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-px w-8 transition-all",
                i < current ? "bg-emerald-400" : "bg-slate-200",
              )} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
