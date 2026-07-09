"use client";

import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { OutletSwitcher } from "@/components/shared/outlet-switcher";
import { switchActiveOutlet } from "@/actions/outlets";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type OutletOption = {
  id: string;
  name: string;
};

export function Topbar({
  userName,
  outletName,
  collapsed,
  outlets,
  activeOutletId,
  onToggleSidebar,
}: {
  userName: string;
  outletName: string;
  collapsed: boolean;
  outlets: OutletOption[];
  activeOutletId: string | null;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSwitch = async (id: string | null) => {
    if (pending) return;
    setPending(true);
    try {
      await switchActiveOutlet(id);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          aria-label={collapsed ? "Tampilkan sidebar" : "Minimalkan sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div>
          <p className="text-lg font-semibold text-slate-900">Bayaro Admin</p>
          <p className="text-sm text-slate-500">Panel administrasi template</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
        
        {/* Date / Time (Minimalist) */}
        <div className="hidden items-center gap-4 lg:flex">
          <p className="text-[13px] font-medium text-slate-500">{today}</p>
          <div className="h-4 w-px bg-slate-300/60" />
        </div>

        <OutletSwitcher
          outlets={outlets}
          activeOutletId={activeOutletId}
          onSwitch={handleSwitch}
        />
        
        <div className="hidden h-4 w-px bg-slate-300/60 sm:block" />

        <UserDropdown userName={userName} outletName={outletName} />
      </div>
    </div>
  );
}

function UserDropdown({ userName, outletName }: { userName: string; outletName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="Menu Profil"
      >
        {userName.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Login sebagai</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{userName}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workspace Aktif</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{outletName}</p>
          </div>
          <div className="p-1.5">
            <a
              href="/login"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Keluar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
