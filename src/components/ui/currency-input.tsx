"use client";

import * as React from "react";
import { formatCurrencyInput, parseCurrencyValue } from "@/lib/currency";
import { cn } from "@/lib/utils";

type CurrencyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "defaultValue" | "value" | "onChange"> & {
  defaultValue?: string | number | null;
  value?: string | number | null;
  onValueChange?: (value: number) => void;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(formatCurrencyInput(defaultValue ?? ""));
    const displayValue = isControlled ? formatCurrencyInput(value) : internalValue;

    function update(next: string) {
      const parsed = parseCurrencyValue(next) ?? 0;
      const formatted = formatCurrencyInput(parsed);
      if (!isControlled) setInternalValue(formatted);
      onValueChange?.(parsed);
    }

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(event) => update(event.target.value)}
        onBlur={(event) => update(event.target.value)}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-blue-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
