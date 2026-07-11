import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, onInput, ...props }, ref) => {
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (type === "number") {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.-]/g, "");
      } else if (type === "tel") {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\-\s]/g, "");
      }
      if (onInput) {
        onInput(e as any);
      }
    };

    return (
      <input
        type={type}
        onInput={handleInput}
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-bayaro-blue focus:ring-4 focus:ring-blue-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
