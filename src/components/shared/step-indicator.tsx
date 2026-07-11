"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isCompleted && "bg-bayaro-navy text-white",
                  isActive && "bg-bayaro-blue text-white ring-4 ring-blue-100",
                  !isCompleted && !isActive && "bg-slate-100 text-slate-400",
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCompleted && "text-bayaro-navy",
                  isActive && "text-bayaro-blue",
                  !isCompleted && !isActive && "text-slate-400",
                )}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-3 rounded-full transition-colors",
                  isCompleted ? "bg-bayaro-navy" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
