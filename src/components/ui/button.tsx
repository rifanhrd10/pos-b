import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  isLoading?: boolean;
};

export function Button({ className, variant = "primary", isLoading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bayaro-blue disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        variant === "primary" && "bg-bayaro-blue text-white shadow-md shadow-bayaro-blue/20 hover:bg-blue-600 hover:shadow-lg hover:shadow-bayaro-blue/30",
        variant === "secondary" && "bg-bayaro-soft text-bayaro-navy hover:bg-blue-100",
        variant === "outline" && "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-600 hover:bg-slate-100",
        variant === "danger" && "bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/30",
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
