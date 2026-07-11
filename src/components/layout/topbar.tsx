"use client";

import { PanelLeftClose, PanelLeftOpen, LogOut, Database, Trash2, Loader2, Crown } from "lucide-react";
import { OutletSwitcher } from "@/components/shared/outlet-switcher";
import { switchActiveOutlet } from "@/actions/outlets";
import { seedDemoData } from "@/actions/demo";
import { cleanseData } from "@/actions/cleansing";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type OutletOption = {
  id: string;
  name: string;
};

type PlanInfo = {
  name: string;
  displayName: string;
  status: string;
};

export function Topbar({
  userName,
  userRole,
  outletName,
  collapsed,
  outlets,
  activeOutletId,
  plan,
  onToggleSidebar,
}: {
  userName: string;
  userRole: string;
  outletName: string;
  collapsed: boolean;
  outlets: OutletOption[];
  activeOutletId: string | null;
  plan?: PlanInfo | null;
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

        <PlanDropdown plan={plan} />

        <OutletSwitcher
          outlets={outlets}
          activeOutletId={activeOutletId}
          onSwitch={handleSwitch}
        />
        
        <div className="hidden h-4 w-px bg-slate-300/60 sm:block" />

        <UserDropdown userName={userName} userRole={userRole} outletName={outletName} />
      </div>
    </div>
  );
}

// ─── PLAN DROPDOWN ───────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, { maxOutlets: number; maxEmployees: number; features: string[] }> = {
  starter: {
    maxOutlets: 1,
    maxEmployees: 5,
    features: ["POS Kasir", "Laporan Dasar", "1 Outlet", "Maks 5 Karyawan"],
  },
  pro: {
    maxOutlets: 10,
    maxEmployees: 50,
    features: ["POS Kasir", "Multi Outlet (10)", "Shift Management", "Laporan Lengkap", "Export Data", "Maks 50 Karyawan"],
  },
  enterprise: {
    maxOutlets: -1,
    maxEmployees: -1,
    features: ["Semua Fitur Pro", "Unlimited Outlet", "Unlimited Karyawan", "API Access", "Priority Support"],
  },
};

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-indigo-50 text-indigo-700 border-indigo-200",
  enterprise: "bg-amber-50 text-amber-700 border-amber-200",
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  starter: "bg-slate-500",
  pro: "bg-indigo-600",
  enterprise: "bg-amber-600",
};

function PlanDropdown({ plan }: { plan?: PlanInfo | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const planName = plan?.name || "starter";
  const displayName = plan?.displayName || "Starter";
  const status = plan?.status || "trial";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:opacity-80 ${PLAN_COLORS[planName] || PLAN_COLORS.starter}`}
      >
        <Crown size={14} />
        <span className="hidden sm:inline">{displayName}</span>
        {status === "trial" && (
          <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">TRIAL</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2">
          {/* Current Plan */}
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Paket Aktif</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{displayName}</p>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${PLAN_BADGE_COLORS[planName] || PLAN_BADGE_COLORS.starter}`}>
                <Crown size={16} />
              </div>
            </div>
            {status === "trial" && (
              <p className="mt-1 text-xs text-orange-600 font-medium">Masa trial aktif</p>
            )}
            {status === "active" && (
              <p className="mt-1 text-xs text-green-600 font-medium">Berlangganan aktif</p>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(PLAN_FEATURES).map(([key, feat]) => {
              const isActive = key === planName;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-3 transition ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                      {key === "starter" ? "Starter" : key === "pro" ? "Pro" : "Enterprise"}
                    </p>
                    {isActive && (
                      <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">AKTIF</span>
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {feat.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-400" : "bg-slate-300"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Note */}
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-[11px] text-slate-400">
              Upgrade paket untuk fitur lebih lengkap. Hubungi admin untuk informasi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USER DROPDOWN (with Demo & Cleansing) ───────────────────────────────────

function UserDropdown({ userName, userRole, outletName }: { userName: string; userRole: string; outletName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"seed" | "cleanse" | null>(null);
  const [confirmCleanse, setConfirmCleanse] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmCleanse(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSeed() {
    setLoading("seed");
    const res = await seedDemoData();
    setLoading(null);
    if (res.success) {
      setOpen(false);
      router.refresh();
    } else {
      alert("Gagal: " + (res.error || "Unknown error"));
    }
  }

  async function handleCleanse() {
    if (!confirmCleanse) {
      setConfirmCleanse(true);
      return;
    }
    setLoading("cleanse");
    const res = await cleanseData(["all"]);
    setLoading(null);
    setConfirmCleanse(false);
    if (res.success) {
      setOpen(false);
      router.refresh();
    } else {
      alert("Gagal: " + (res.error || "Unknown error"));
    }
  }

  return (
    <div ref={ref} className="relative flex items-center gap-3">
      <button 
        type="button"
        onClick={() => { setOpen(!open); setConfirmCleanse(false); }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="Menu Profil"
      >
        {userName.charAt(0).toUpperCase()}
      </button>
      <div className="hidden text-left md:block">
        <p className="text-sm font-semibold text-slate-900">{userName}</p>
        <p className="text-[11px] font-medium text-slate-500">{userRole}</p>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          {/* User Info */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Login sebagai</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{userName}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Toko Anda</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{outletName}</p>
          </div>

          {/* Demo Tools */}
          <div className="border-b border-slate-100 p-1.5">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Demo Tools</p>
            <button
              type="button"
              onClick={handleSeed}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
            >
              {loading === "seed" ? (
                <Loader2 size={16} className="animate-spin text-emerald-600" />
              ) : (
                <Database size={16} className="text-emerald-600" />
              )}
              <div className="text-left">
                <p>Isi Data Demo</p>
                <p className="text-[11px] font-normal text-slate-400">Produk, pelanggan, promo, stok</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleCleanse}
              disabled={loading !== null}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                confirmCleanse
                  ? "bg-red-50 text-red-700"
                  : "text-slate-700 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {loading === "cleanse" ? (
                <Loader2 size={16} className="animate-spin text-red-600" />
              ) : (
                <Trash2 size={16} className="text-red-500" />
              )}
              <div className="text-left">
                <p>{confirmCleanse ? "Klik lagi untuk konfirmasi" : "Cleansing Data"}</p>
                <p className="text-[11px] font-normal text-slate-400">
                  {confirmCleanse ? "Semua data akan dihapus!" : "Hapus semua data demo"}
                </p>
              </div>
            </button>
          </div>

          {/* Logout */}
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
