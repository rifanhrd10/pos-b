"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
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

function SidebarContent({ collapsed, permissions }: { collapsed: boolean; permissions: string[] }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );
  const itemMap = new Map(visibleItems.map((item) => [item.href, item]));
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className={cn("flex h-full flex-col bg-[#071a49] pt-4 text-white transition-all duration-300", collapsed ? "px-3 pb-7" : "px-5 pb-7")}>
      <div className={cn("mb-8 flex min-h-[73px] border-b border-white/10 pb-4", collapsed ? "justify-center" : "justify-start")}>
        {collapsed ? (
          <BayaroLogo compact />
        ) : (
          <div className="inline-flex h-[56px] items-center rounded-[18px] bg-white px-4 shadow-[0_14px_30px_rgba(2,6,23,0.18)]">
            <BayaroLogo dark />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => {
          const isOpen = openDropdowns[section.label] ?? false;
          const sectionItems = section.items.filter((href) => itemMap.has(href));
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.label}>
              {!collapsed ? (
                section.dropdown ? (
                  <button
                    onClick={() => toggleDropdown(section.label)}
                    className="mb-2 flex w-full items-center justify-between rounded-xl px-3 py-1 transition hover:bg-white/5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300/80">
                      {section.label}
                    </p>
                    <ChevronDown
                      size={12}
                      className={cn("text-blue-300/80 transition-transform duration-200", isOpen && "rotate-180")}
                    />
                  </button>
                ) : (
                  <div className="mb-3 px-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300/80">
                      {section.label}
                    </p>
                  </div>
                )
              ) : null}

              {/* Items: always show for normal sections, conditionally for dropdowns */}
              {(!section.dropdown || isOpen || collapsed) && (
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
              )}
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
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  permissions: string[];
}) {
  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 hidden h-screen border-r border-[#0e235c] bg-[#071a49] transition-[width] duration-300 lg:block", collapsed ? "w-[96px]" : "w-[300px]")}>
        <SidebarContent collapsed={collapsed} permissions={permissions} />
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
              <SidebarContent collapsed={false} permissions={permissions} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
