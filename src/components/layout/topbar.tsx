"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Database,
  Trash2,
  Loader2,
  Crown,
  X,
  Store,
  CalendarDays,
  Activity,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { OutletSwitcher } from "@/components/shared/outlet-switcher";
import { switchActiveOutlet } from "@/actions/outlets";
import { seedDemoData } from "@/actions/demo";
import { cleanseData } from "@/actions/cleansing";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type OutletOption = {
  id: string;
  name: string;
};

type PlanInfo = {
  name: string;
  displayName: string;
  status: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
};

const DEMO_PERIODS = [
  { days: 7, label: "7 hari", description: "Demo singkat" },
  { days: 30, label: "30 hari", description: "Rekomendasi" },
  { days: 60, label: "60 hari", description: "Tren 2 bulan" },
  { days: 90, label: "90 hari", description: "Data lengkap" },
];

const DEMO_VOLUMES = [
  { average: 5, label: "Ringan", description: "±5 transaksi/hari" },
  { average: 10, label: "Normal", description: "±10 transaksi/hari" },
  { average: 18, label: "Ramai", description: "±18 transaksi/hari" },
];

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
  const subscriptionEndDate = plan?.status === "trial" ? plan?.trialEndsAt : plan?.currentPeriodEnd;
  const subscriptionLabel = subscriptionEndDate
    ? `${plan?.status === "trial" ? "Trial" : "Subscription"} berakhir: ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(subscriptionEndDate))}`
    : null;

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
        <div className="hidden items-center gap-3 lg:flex">
          <p className="text-[13px] font-medium text-slate-500">{today}</p>
          {subscriptionLabel ? (
            <>
              <div className="h-4 w-px bg-slate-300/60" />
              <p className="max-w-[280px] truncate text-[13px] font-semibold text-slate-700">{subscriptionLabel}</p>
            </>
          ) : null}
          <div className="h-4 w-px bg-slate-300/60" />
        </div>

        <PlanDropdown plan={plan} />

        <OutletSwitcher
          outlets={outlets}
          activeOutletId={activeOutletId}
          onSwitch={handleSwitch}
        />
        
        <div className="hidden h-4 w-px bg-slate-300/60 sm:block" />

        <UserDropdown
          userName={userName}
          userRole={userRole}
          outletName={outletName}
          outlets={outlets}
          activeOutletId={activeOutletId}
        />
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
  const trialEndsAt = plan?.trialEndsAt ? new Date(plan.trialEndsAt) : null;
  const isTrialExpired = status === "trial" && trialEndsAt ? trialEndsAt.getTime() < Date.now() : false;
  const trialText = trialEndsAt
    ? `Trial berakhir: ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(trialEndsAt)}`
    : "Masa trial aktif";

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
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${isTrialExpired ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"}`}>
            {isTrialExpired ? "TRIAL HABIS" : "TRIAL"}
          </span>
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
              <p className={`mt-1 text-xs font-medium ${isTrialExpired ? "text-rose-600" : "text-orange-600"}`}>
                {isTrialExpired ? "Masa trial telah berakhir" : trialText}
              </p>
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

function UserDropdown({
  userName,
  userRole,
  outletName,
  outlets,
  activeOutletId,
}: {
  userName: string;
  userRole: string;
  outletName: string;
  outlets: OutletOption[];
  activeOutletId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"seed" | "cleanse" | null>(null);
  const [confirmCleanse, setConfirmCleanse] = useState(false);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [seedOutletId, setSeedOutletId] = useState(activeOutletId ?? outlets[0]?.id ?? "");
  const [historyDays, setHistoryDays] = useState(30);
  const [averageTransactions, setAverageTransactions] = useState(10);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const estimatedTransactions = historyDays * averageTransactions;
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - historyDays + 1);
  const compactDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

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
    if (!seedOutletId) return;
    setLoading("seed");
    const res = await seedDemoData({
      outletId: seedOutletId,
      historyDays,
      averageTransactionsPerDay: averageTransactions,
    });
    setLoading(null);
    if (res.success) {
      setShowSeedDialog(false);
      setOpen(false);
      router.refresh();
      const count = "transactionCount" in res ? res.transactionCount : 0;
      const targetOutlet = "outletName" in res ? res.outletName : "outlet terpilih";
      alert(`${count} transaksi demo berhasil dibuat di ${targetOutlet}.`);
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
              onClick={() => {
                setSeedOutletId(activeOutletId ?? outlets[0]?.id ?? "");
                setShowSeedDialog(true);
                setOpen(false);
              }}
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
                <p className="text-[11px] font-normal text-slate-400">Pilih outlet, periode, dan volume transaksi</p>
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
                  {confirmCleanse ? "Seluruh data bisnis aktif akan dihapus!" : "Hapus data hanya dari bisnis aktif"}
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

      {showSeedDialog && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-dialog-title"
            className="flex max-h-[calc(100vh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:max-h-[calc(100vh-40px)]"
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 px-5 py-4 text-white sm:px-6">
              <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-24 left-28 h-40 w-40 rounded-full bg-blue-300/10" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur">
                  <Sparkles size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-100">Demo Data Generator</p>
                  <h2 id="demo-dialog-title" className="mt-1 text-lg font-bold tracking-tight sm:text-xl">Siapkan data toko dalam sekali klik</h2>
                  <p className="mt-1 text-sm leading-relaxed text-indigo-100/90">
                    Pilih outlet dan pola keramaian. Sistem akan menyusun transaksi realistis sampai hari ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeedDialog(false)}
                  disabled={loading === "seed"}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                  aria-label="Tutup dialog data demo"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <section>
                <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Store size={15} /></span>
                  Outlet tujuan
                </div>
                <select
                  aria-label="Outlet tujuan"
                  value={seedOutletId}
                  onChange={(event) => setSeedOutletId(event.target.value)}
                  disabled={loading === "seed"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                  ))}
                </select>
              </section>

              <section>
                <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><CalendarDays size={15} /></span>
                  Periode riwayat
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DEMO_PERIODS.map((period) => {
                    const selected = historyDays === period.days;
                    return (
                      <button
                        key={period.days}
                        type="button"
                        onClick={() => setHistoryDays(period.days)}
                        disabled={loading === "seed"}
                        className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-sm font-bold">{period.label}</span>
                        <span className={`mt-0.5 block text-[10px] ${selected ? "text-indigo-500" : "text-slate-400"}`}>{period.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Activity size={15} /></span>
                  Tingkat keramaian
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_VOLUMES.map((volume) => {
                    const selected = averageTransactions === volume.average;
                    return (
                      <button
                        key={volume.average}
                        type="button"
                        onClick={() => setAverageTransactions(volume.average)}
                        disabled={loading === "seed"}
                        className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
                          selected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-sm font-bold">{volume.label}</span>
                        <span className={`mt-0.5 block text-[10px] ${selected ? "text-emerald-600" : "text-slate-400"}`}>{volume.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-2.5 rounded-2xl bg-slate-900 p-3.5 text-white sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Estimasi hasil</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">±{estimatedTransactions.toLocaleString("id-ID")}</span>
                    <span className="text-sm text-slate-300">transaksi</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {compactDate.format(periodStart)} – {compactDate.format(periodEnd)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:max-w-[220px] sm:justify-end">
                  {["Produk", "Pelanggan", "Stok", "Pembayaran", "Laporan"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-200">{item}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 pt-2.5 text-[11px] text-slate-300 sm:col-span-2">
                  <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
                  Demo lama pada outlet ini diganti; transaksi asli dan data bisnis lain tetap aman.
                </div>
              </section>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-6">
              <p className="hidden text-xs text-slate-400 sm:block">Proses biasanya selesai dalam beberapa detik.</p>
              <div className="ml-auto flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSeedDialog(false)}
                  disabled={loading === "seed"}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={!seedOutletId || loading === "seed"}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === "seed" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {loading === "seed" ? "Menyusun data..." : "Buat Data Demo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
