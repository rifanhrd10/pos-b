"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Bayaro Admin Template</p>
        <p>Dashboard, tabel, form, kalender, kanban, dan komponen UI lengkap dalam satu template.</p>
      </div>
    </footer>
  );
}

export function DashboardShell({
  userName,
  outletName,
  permissions,
  children,
}: {
  userName: string;
  outletName: string;
  permissions: string[];
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
        permissions={permissions}
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
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
