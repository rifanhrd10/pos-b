"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition",
          checked
            ? "border-bayaro-navy bg-bayaro-navy text-white"
            : "border-slate-300 bg-white hover:border-bayaro-blue",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
