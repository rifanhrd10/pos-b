"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Package,
  BarChart2,
  Server,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const ITADMIN_NAV = [
  { href: "/itadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itadmin/businesses", label: "Bisnis/Toko", icon: Store },
  { href: "/itadmin/subscriptions", label: "Subscription", icon: CreditCard },
  { href: "/itadmin/plans", label: "Paket & Harga", icon: Package },
  { href: "/itadmin/monitoring", label: "Monitoring", icon: BarChart2 },
  { href: "/itadmin/system", label: "System", icon: Server },
];

export function ITAdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`min-h-screen bg-slate-900 transition-[padding] duration-300 ${collapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-700/50 bg-slate-900 transition-[width] duration-300 ${
          collapsed ? "w-[80px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-sm">
            IT
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white">IT Admin</p>
              <p className="text-[11px] text-slate-400">Platform Monitor</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {ITADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3">
          <a
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Platform Administration</p>
              <p className="text-[11px] text-slate-500">Monitoring & Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-[11px] text-slate-500">IT Administrator</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-slate-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
