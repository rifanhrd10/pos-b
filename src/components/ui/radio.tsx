"use client";

import { cn } from "@/lib/utils";

type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
              checked
                ? "border-bayaro-navy bg-bayaro-soft"
                : "border-slate-200 bg-white hover:border-bayaro-blue hover:bg-slate-50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {/* Custom radio circle */}
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                checked ? "border-bayaro-navy" : "border-slate-300",
              )}
            >
              {checked && (
                <span className="h-2.5 w-2.5 rounded-full bg-bayaro-navy" />
              )}
            </span>
            <span className="flex-1">
              <span className={cn("block text-sm font-medium", checked ? "text-bayaro-navy" : "text-slate-700")}>
                {opt.label}
              </span>
              {opt.description && (
                <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
