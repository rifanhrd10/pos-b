"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check, Plus, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type OutletOption = {
  id: string;
  name: string;
  logo?: string | null;
  isActive: boolean;
};

export function OutletSwitcher({
  outlets,
  activeOutletId,
  onSwitch,
}: {
  outlets: OutletOption[];
  activeOutletId: string | null;
  onSwitch: (outletId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeOutlet = outlets.find((o) => o.id === activeOutletId);
  const label = activeOutlet?.name ?? "Semua Outlet";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Store size={16} className="text-slate-500" />
        <span className="max-w-[140px] truncate">{label}</span>
        <ChevronDown size={14} className={cn("text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg">
          {/* Semua Outlet */}
          <button
            onClick={() => { onSwitch(null); setOpen(false); }}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50",
              !activeOutletId && "bg-slate-50 font-medium text-bayaro-navy"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
              <Store size={14} className="text-slate-500" />
            </div>
            <span className="flex-1 text-left">Semua Outlet</span>
            {!activeOutletId && <Check size={14} className="text-bayaro-navy" />}
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Outlet List */}
          {outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => { onSwitch(outlet.id); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50",
                activeOutletId === outlet.id && "bg-slate-50 font-medium text-bayaro-navy"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                {outlet.logo ? (
                  <img src={outlet.logo} alt={outlet.name} className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <Store size={14} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="truncate">{outlet.name}</p>
                {!outlet.isActive && (
                  <p className="text-xs text-amber-600">Nonaktif</p>
                )}
              </div>
              {activeOutletId === outlet.id && <Check size={14} className="text-bayaro-navy" />}
            </button>
          ))}

          <div className="my-1 border-t border-slate-100" />

          {/* Add Outlet Link */}
          <Link
            href="/outlets/new"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-bayaro-navy hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
              <Plus size={14} className="text-bayaro-navy" />
            </div>
            <span>Tambah Outlet</span>
          </Link>
        </div>
      )}
    </div>
  );
}
