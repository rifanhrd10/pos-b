"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Store } from "lucide-react";
import { navItems, navSections } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { BayaroLogo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";

const TOUR_MAP: Record<string, string> = {
  "/dashboard": "dashboard",
  "/employees": "employees",
  "/outlets": "outlets",
  "/settings": "settings",
};

function SidebarContent({ collapsed, permissions, planFeatures, businessName, outletName }: { collapsed: boolean; permissions: string[]; planFeatures?: string[]; businessName: string; outletName: string }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => {
    // Must have role permission
    if (item.permission && !permissions.includes(item.permission)) return false;
    // Must have plan feature (if planFeatures provided)
    if (planFeatures && planFeatures.length > 0 && item.permission) {
      if (!planFeatures.includes(item.permission)) return false;
    }
    return true;
  });
  const itemMap = new Map(visibleItems.map((item) => [item.href, item]));

  return (
    <div className={cn("flex h-full flex-col bg-[#071a49] pt-4 text-white transition-all duration-300", collapsed ? "px-3 pb-7" : "px-5 pb-7")}>
      <div className={cn("flex min-h-[60px] items-center", collapsed ? "justify-center" : "justify-start pl-1 ml-[-10px]")}>
        <BayaroLogo dark={!collapsed} compact={collapsed} white />
      </div>

      {!collapsed && (
        <div className="mb-6 mt-[-10px] px-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur-sm transition hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-inner">
              <Store size={18} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <p className="truncate text-sm font-semibold tracking-wide text-white">{businessName}</p>
              <p className="truncate text-[11px] font-medium text-blue-200/80">
                {outletName && outletName !== businessName ? outletName : "Pusat"}
              </p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="mb-6 mt-4 flex justify-center border-b border-white/10 pb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-inner" title={businessName}>
            <Store size={18} />
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navSections.map((section) => {
          const sectionItems = section.items.filter((href) => itemMap.has(href));
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.label}>
              {!collapsed && (
                <div className="mb-3 px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300/80">
                    {section.label}
                  </p>
                </div>
              )}

              <nav className="space-y-1.5">
                  {sectionItems.map((href) => {
                    const item = itemMap.get(href);
                    if (!item) return null;
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        {...(TOUR_MAP[item.href] ? { "data-tour": TOUR_MAP[item.href] } : {})}
                        className={cn(
                          "flex rounded-2xl text-sm transition",
                          collapsed ? "justify-center px-2 py-3" : "items-center justify-between px-3 py-3",
                          active
                            ? "bg-white text-[#071a49] shadow-[0_10px_24px_rgba(255,255,255,0.16)]"
                            : "text-blue-100 hover:bg-white/8",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                          <Icon size={18} />
                          {!collapsed ? item.label : null}
                        </span>
                        {!collapsed && item.badge ? <Badge tone="info">{item.badge}</Badge> : null}
                      </Link>
                    );
                  })}
                </nav>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  permissions,
  planFeatures,
  businessName,
  outletName,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  permissions: string[];
  planFeatures?: string[];
  businessName: string;
  outletName: string;
}) {
  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 hidden h-screen border-r border-[#0e235c] bg-[#071a49] transition-[width] duration-300 lg:block", collapsed ? "w-[96px]" : "w-[300px]")}>
        <SidebarContent collapsed={collapsed} permissions={permissions} planFeatures={planFeatures} businessName={businessName} outletName={outletName} />
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="h-full w-[86%] max-w-sm">
            <div className="relative h-full">
              <button
                className="absolute right-4 top-4 z-10 inline-flex rounded-full bg-white p-2 text-slate-700"
                onClick={onCloseMobile}
                aria-label="Tutup menu"
              >
                <X size={18} />
              </button>
              <SidebarContent collapsed={false} permissions={permissions} planFeatures={planFeatures} businessName={businessName} outletName={outletName} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
