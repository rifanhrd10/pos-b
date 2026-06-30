"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Omit<ToastItem, "id">>).detail;
      showToast(detail);
    };

    window.addEventListener("bayaro:toast", handler);
    return () => window.removeEventListener("bayaro:toast", handler);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {items.map((item) => {
          const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? CircleAlert : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto rounded-[24px] border p-4 shadow-soft backdrop-blur",
                item.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
                item.tone === "error" && "border-rose-200 bg-rose-50 text-rose-900",
                item.tone === "info" && "border-cyan-200 bg-cyan-50 text-cyan-900",
              )}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm opacity-80">{item.description}</p> : null}
                </div>
                <button
                  className="rounded-full p-1 opacity-60 transition hover:opacity-100"
                  onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

export function emitToast(toast: Omit<ToastItem, "id">) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("bayaro:toast", { detail: toast }));
}
