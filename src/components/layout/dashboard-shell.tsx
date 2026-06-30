"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Bayaro POS Full Access</p>
        <p>Dashboard, kasir, transaksi, laporan, dan pengaturan outlet dalam satu sistem.</p>
      </div>
    </footer>
  );
}

export function DashboardShell({
  userName,
  outletName,
  children,
}: {
  userName: string;
  outletName: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-transparent transition-[padding] duration-300 ${collapsed ? "lg:pl-[96px]" : "lg:pl-[300px]"}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-col">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-[#f7faff]/95 px-4 py-4 backdrop-blur md:px-6">
          <Topbar
            userName={userName}
            outletName={outletName}
            collapsed={collapsed}
            onToggleSidebar={() => {
              if (window.innerWidth >= 1024) {
                setCollapsed((value) => !value);
                return;
              }
              setMobileOpen((value) => !value);
            }}
          />
        </div>
        <main className="flex-1 px-4 py-4 md:px-6 md:py-5">
          <div className="min-h-full rounded-[28px] border border-white/60 bg-white/42 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur md:p-5">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
