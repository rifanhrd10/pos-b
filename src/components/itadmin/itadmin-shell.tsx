"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  CreditCard,
  Package,
  Server,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ShieldCheck,
  Megaphone,
  Receipt,
  Activity,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const ITADMIN_NAV = [
  { href: "/itadmin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/itadmin/businesses", label: "Daftar Toko", icon: Store },
  { href: "/itadmin/payments", label: "Verifikasi Bayar", icon: Receipt },
  { href: "/itadmin/plans", label: "Paket SaaS", icon: Package },
  { href: "/itadmin/reminders", label: "Pengumuman Pop-up", icon: Megaphone },
  { href: "/itadmin/logs", label: "Log Aktivitas", icon: Activity },
];

function ITAdminSidebarContent({
  collapsed,
  userName,
}: {
  collapsed: boolean;
  userName: string;
}) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[#071a49] pt-4 text-white transition-all duration-300",
        collapsed ? "px-3 pb-7" : "px-5 pb-7"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex min-h-[60px] items-center",
          collapsed ? "justify-center" : "justify-start pl-1"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-inner">
            <ShieldCheck size={18} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                IT Admin
              </p>
              <p className="text-[11px] text-blue-200/80">Platform Monitor</p>
            </div>
          )}
        </div>
      </div>

      {/* Identity card (collapsed: icon only) */}
      {!collapsed && (
        <div className="mb-6 mt-2 px-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur-sm transition hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <p className="truncate text-sm font-semibold tracking-wide text-white">
                {userName}
              </p>
              <p className="truncate text-[11px] font-medium text-blue-200/80">
                IT Administrator
              </p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="mb-6 mt-4 flex justify-center border-b border-white/10 pb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-inner">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {ITADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-blue-100/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: sign out */}
      <div className="mt-auto border-t border-white/10 pt-4 pb-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={collapsed ? "Keluar" : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            "text-blue-100/70 hover:bg-red-500/15 hover:text-red-200",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {showLogoutConfirm && typeof document !== "undefined" && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-5 shadow-sm border border-rose-100">
              <LogOut size={26} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Konfirmasi Keluar</h3>
            <p className="mt-2.5 text-sm text-slate-500 leading-relaxed font-medium">
              Apakah Anda yakin ingin mengakhiri sesi IT Admin?
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <a
                href="/login"
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-rose-700 transition-all shadow-md shadow-rose-200 hover:shadow-lg"
              >
                Ya, Keluar
              </a>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}

function ITAdminFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Bayaro — IT Admin Panel</p>
        <p>Platform Monitoring &amp; Management</p>
      </div>
    </footer>
  );
}

export function ITAdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={cn(
        "min-h-screen bg-transparent transition-[padding] duration-300",
        collapsed ? "lg:pl-[96px]" : "lg:pl-[300px]"
      )}
    >
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden h-screen border-r border-[#0e235c] bg-[#071a49] transition-[width] duration-300 lg:block",
          collapsed ? "w-[96px]" : "w-[300px]"
        )}
      >
        <ITAdminSidebarContent collapsed={collapsed} userName={userName} />
      </aside>

      {/* Sidebar — mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="h-full w-[86%] max-w-sm">
            <div className="relative h-full">
              <button
                className="absolute right-4 top-4 z-10 inline-flex rounded-full bg-white p-2 text-slate-700"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={18} />
              </button>
              <ITAdminSidebarContent collapsed={false} userName={userName} />
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen min-w-0 flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-[#f7faff]/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                    setCollapsed((v) => !v);
                    return;
                  }
                  setMobileOpen((v) => !v);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Toggle sidebar"
              >
                {collapsed ? (
                  <PanelLeftOpen size={18} />
                ) : (
                  <PanelLeftClose size={18} />
                )}
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Platform Administration
                </p>
                <p className="text-[11px] text-slate-500">
                  Monitoring &amp; Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-500">IT Administrator</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-4 py-4 md:px-6 md:py-5">{children}</main>

        <ITAdminFooter />
      </div>
    </div>
  );
}
