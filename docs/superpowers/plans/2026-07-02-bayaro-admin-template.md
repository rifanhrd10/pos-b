# Bayaro Admin Template — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Bayaro POS into a fully static reusable admin template with 17 pages, removing all Prisma/auth/API dependencies, preserving the design language.

**Architecture:** Next.js 15 App Router, all pages are static server components (no Prisma), interactivity via `"use client"` components with local state only. New nav structure with UI Elements + Pages + User sections.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, lucide-react

## Global Constraints

- All Tailwind classes must use existing tokens: bayaro-navy, bayaro-blue, bayaro-soft, shadow-soft, rounded-[24px]/rounded-[28px]
- Fonts: Manrope body, Sora headings (already in globals.css)
- No new npm dependencies unless absolutely necessary
- All dummy data is hardcoded in `const` blocks at the top of each file
- All text uses Bahasa Indonesia
- No Prisma, no API routes, no auth imports anywhere

---

## Task 1: Cleanup & Foundation

**Files:**
- Delete: `src/app/api/` (entire directory)
- Delete: `prisma/` (entire directory)
- Delete: `middleware.ts`
- Delete: `src/lib/auth.ts`
- Delete: `src/lib/prisma.ts`
- Delete: `src/lib/validations.ts`
- Delete: `src/lib/report-filters.ts`
- Delete: `src/components/forms/` (entire directory)
- Delete: `src/components/kasir/` (entire directory)
- Delete: `src/components/transactions/` (entire directory)
- Delete: `src/components/products/` (entire directory)
- Delete: `src/components/shared/logout-form.tsx`
- Delete: `src/app/(pos)/` (entire directory)
- Delete: old dashboard pages: `add-on-starter/`, `karyawan-shift/`, `kategori/`, `laporan/`, `outlet/`, `pelanggan/`, `pembayaran/`, `pengaturan/`, `produk/`, `role-permission/`, `stok/`, `struk/`, `supplier/`, `topping/`, `transaksi/`, `kasir/`
- Modify: `package.json`
- Modify: `next.config.ts`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/lib/nav.ts`
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Delete all backend/core directories**

```bash
rm -rf src/app/api
rm -rf prisma
rm -f middleware.ts
rm -f src/lib/auth.ts
rm -f src/lib/prisma.ts
rm -f src/lib/validations.ts
rm -f src/lib/report-filters.ts
rm -rf src/components/forms
rm -rf src/components/kasir
rm -rf src/components/transactions
rm -rf src/components/products
rm -f src/components/shared/logout-form.tsx
rm -rf "src/app/(pos)"
```

- [ ] **Step 2: Delete old dashboard pages**

```bash
rm -rf "src/app/(dashboard)/add-on-starter"
rm -rf "src/app/(dashboard)/karyawan-shift"
rm -rf "src/app/(dashboard)/kategori"
rm -rf "src/app/(dashboard)/laporan"
rm -rf "src/app/(dashboard)/outlet"
rm -rf "src/app/(dashboard)/pelanggan"
rm -rf "src/app/(dashboard)/pembayaran"
rm -rf "src/app/(dashboard)/pengaturan"
rm -rf "src/app/(dashboard)/produk"
rm -rf "src/app/(dashboard)/role-permission"
rm -rf "src/app/(dashboard)/stok"
rm -rf "src/app/(dashboard)/struk"
rm -rf "src/app/(dashboard)/supplier"
rm -rf "src/app/(dashboard)/topping"
rm -rf "src/app/(dashboard)/transaksi"
rm -rf "src/app/(dashboard)/kasir"
```

- [ ] **Step 3: Update package.json — remove heavy deps**

Remove from dependencies: `@prisma/client`, `bcryptjs`, `jose`, `zod`
Remove from devDependencies: `prisma`
Remove scripts: `prisma:generate`, `prisma:migrate`, `prisma:seed`, `full-access`

New `package.json`:
```json
{
  "name": "bayaro-admin-template",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.525.0",
    "next": "^15.3.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/node": "^24.0.13",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.3",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 4: Update next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: Update `src/lib/nav.ts` with new admin template structure**

```typescript
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Table,
  Tag,
  ToggleLeft,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export type NavSection = {
  label: string;
  description: string;
  items: string[];
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ui/tables", label: "Tables", icon: Table },
  { href: "/ui/forms", label: "Forms", icon: FileText },
  { href: "/ui/cards", label: "Cards", icon: CreditCard },
  { href: "/ui/modals", label: "Modals & Dialogs", icon: ToggleLeft },
  { href: "/ui/buttons", label: "Buttons & Badges", icon: Tag },
  { href: "/ui/alerts", label: "Alerts & Toast", icon: Bell },
  { href: "/pages/calendar", label: "Calendar", icon: Calendar },
  { href: "/pages/kanban", label: "Kanban Board", icon: Kanban },
  { href: "/pages/file-manager", label: "File Manager", icon: FolderOpen },
  { href: "/pages/chat", label: "Chat", icon: MessageSquare },
  { href: "/pages/invoice", label: "Invoice", icon: FileText },
  { href: "/pages/pricing", label: "Pricing", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export const navSections: NavSection[] = [
  {
    label: "Ringkasan",
    description: "Overview dan statistik utama.",
    items: ["/dashboard"],
  },
  {
    label: "UI Elements",
    description: "Komponen dan elemen UI siap pakai.",
    items: ["/ui/tables", "/ui/forms", "/ui/cards", "/ui/modals", "/ui/buttons", "/ui/alerts"],
  },
  {
    label: "Pages",
    description: "Halaman-halaman siap pakai untuk aplikasi.",
    items: ["/pages/calendar", "/pages/kanban", "/pages/file-manager", "/pages/chat", "/pages/invoice", "/pages/pricing"],
  },
  {
    label: "User",
    description: "Akun dan pengaturan pengguna.",
    items: ["/profile", "/settings"],
  },
];
```

- [ ] **Step 6: Simplify `src/app/(dashboard)/layout.tsx`**

```typescript
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell userName="Admin Bayaro" outletName="Bayaro HQ">
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 7: Update `src/components/layout/topbar.tsx` — remove LogoutForm**

Replace the LogoutForm with a static user avatar button:
```typescript
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";

export function Topbar({
  userName,
  outletName,
  collapsed,
  onToggleSidebar,
}: {
  userName: string;
  outletName: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
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
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right lg:block">
          <p className="text-xs text-slate-500">Hari ini</p>
          <p className="text-sm font-semibold text-slate-900">{today}</p>
        </div>
        <div className="hidden rounded-2xl bg-slate-50 px-4 py-2 text-right md:block">
          <p className="text-xs text-slate-500">Workspace</p>
          <p className="text-sm font-semibold text-slate-900">{outletName}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-white">
          <p className="text-xs text-slate-300">Admin</p>
          <p className="text-sm font-semibold">{userName}</p>
        </div>
        <a
          href="/login"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          title="Keluar"
        >
          <LogOut size={18} />
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Update root `src/app/page.tsx`**

```typescript
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
```

- [ ] **Step 9: Commit cleanup**

```bash
git add -A
git commit -m "chore: cleanup core - remove prisma/auth/api, restructure as admin template"
```

---

## Task 2: New UI Components

**Files:**
- Create: `src/components/ui/alert.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/checkbox.tsx`
- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/modal.tsx`
- Modify: `src/components/ui/badge.tsx` — add `danger` tone

- [ ] **Step 1: Create `src/components/ui/alert.tsx`**

```typescript
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type AlertTone = "info" | "success" | "warning" | "danger";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
};

const styles: Record<AlertTone, string> = {
  info: "bg-cyan-50 border-cyan-200 text-cyan-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger: "bg-rose-50 border-rose-200 text-rose-800",
};

const iconStyles: Record<AlertTone, string> = {
  info: "text-cyan-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-rose-500",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", styles[tone], className)}>
      <Icon size={18} className={cn("mt-0.5 shrink-0", iconStyles[tone])} />
      <div className="text-sm">
        {title && <p className="font-semibold">{title}</p>}
        <p className={cn(title && "mt-1 opacity-80")}>{children}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/select.tsx`**

```typescript
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 transition focus:border-bayaro-blue focus:outline-none focus:ring-2 focus:ring-bayaro-blue/20 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/ui/checkbox.tsx`**

```typescript
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition",
          checked
            ? "border-bayaro-navy bg-bayaro-navy text-white"
            : "border-slate-300 bg-white hover:border-bayaro-blue",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/switch.tsx`**

```typescript
"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-200",
          checked ? "bg-bayaro-navy" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
```

- [ ] **Step 5: Create `src/components/ui/modal.tsx`**

```typescript
"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className={cn("w-full rounded-[28px] bg-white shadow-soft", sizeClass)}>
        {title && (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update `src/components/ui/badge.tsx` — add danger tone**

```typescript
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "info" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-slate-100 text-slate-700",
        tone === "success" && "bg-emerald-100 text-emerald-700",
        tone === "warning" && "bg-amber-100 text-amber-700",
        tone === "info" && "bg-cyan-100 text-cyan-700",
        tone === "danger" && "bg-rose-100 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Alert, Select, Checkbox, Switch, Modal components; extend Badge"
```

---

## Task 3: Dashboard Page (Static)

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace dashboard page with static data version**

```typescript
import Link from "next/link";
import { TrendingUp, ShoppingCart, Users, Package, ArrowRight, BarChart2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Pengguna", value: "2,840", change: "+12%", up: true },
  { label: "Transaksi Hari Ini", value: "148", change: "+8%", up: true },
  { label: "Produk Aktif", value: "634", change: "+3%", up: true },
  { label: "Omzet Bulan Ini", value: "Rp 48,2 jt", change: "-2%", up: false },
];

const recentActivity = [
  { id: "TRX-20240601", user: "Budi Santoso", amount: "Rp 245.000", status: "success", date: "2 menit lalu" },
  { id: "TRX-20240602", user: "Siti Rahma", amount: "Rp 120.000", status: "success", date: "8 menit lalu" },
  { id: "TRX-20240603", user: "Andi Wijaya", amount: "Rp 890.000", status: "pending", date: "15 menit lalu" },
  { id: "TRX-20240604", user: "Rina Kusuma", amount: "Rp 67.500", status: "success", date: "22 menit lalu" },
  { id: "TRX-20240605", user: "Doni Prasetyo", amount: "Rp 312.000", status: "danger", date: "1 jam lalu" },
];

const topProducts = [
  { name: "Kopi Susu Gula Aren", sold: 248, revenue: "Rp 3,7 jt", pct: 88 },
  { name: "Matcha Latte", sold: 190, revenue: "Rp 2,9 jt", pct: 72 },
  { name: "Americano", sold: 165, revenue: "Rp 1,8 jt", pct: 62 },
  { name: "Croissant Original", sold: 130, revenue: "Rp 1,3 jt", pct: 49 },
  { name: "Teh Tarik Spesial", sold: 112, revenue: "Rp 1,1 jt", pct: 42 },
];

const quickLinks = [
  { href: "/ui/tables", label: "Tables", description: "Lihat komponen tabel", icon: BarChart2 },
  { href: "/ui/forms", label: "Forms", description: "Elemen form input", icon: Package },
  { href: "/pages/calendar", label: "Calendar", description: "Halaman kalender", icon: ShoppingCart },
  { href: "/profile", label: "Profile", description: "Halaman profil pengguna", icon: Users },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Selamat datang di Bayaro Admin Template. Lihat ringkasan statistik dan navigasi ke komponen UI."
        breadcrumb="Beranda / Dashboard"
        actions={
          <Link href="/ui/tables">
            <Button>Jelajahi Komponen</Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp size={14} className={item.up ? "text-emerald-500" : "text-rose-500"} />
              <span className={`text-xs font-semibold ${item.up ? "text-emerald-600" : "text-rose-600"}`}>{item.change}</span>
              <span className="text-xs text-slate-400">vs bulan lalu</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Top Products */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Produk Terlaris</h2>
              <Badge tone="info">Bulan ini</Badge>
            </div>
            <div className="mt-5 space-y-4">
              {topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{p.name}</span>
                    <span className="text-slate-500">{p.sold} terjual · {p.revenue}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-bayaro-navy transition-all"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 transition hover:border-bayaro-blue hover:shadow-soft"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-bayaro-soft text-bayaro-navy">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Highlight cards */}
          <div className="rounded-[24px] border border-slate-200 bg-[#071a49] p-5 text-white shadow-soft">
            <p className="text-sm text-blue-200">Template Info</p>
            <p className="mt-2 text-xl font-semibold">Bayaro Admin v1.0</p>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Template admin siap pakai dengan Next.js 15, Tailwind CSS, dan komponen UI lengkap.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Halaman", value: "17" },
                { label: "Komponen", value: "40+" },
                { label: "Framework", value: "Next.js 15" },
                { label: "Style", value: "Tailwind CSS" },
              ].map((h) => (
                <div key={h.label} className="rounded-[16px] bg-white/10 p-3">
                  <p className="text-xs text-blue-200">{h.label}</p>
                  <p className="mt-1 font-semibold">{h.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Aktivitas Terbaru</h2>
              <Button variant="secondary" className="text-xs py-1.5 px-3">Lihat Semua</Button>
            </div>
            <div className="mt-4 space-y-3">
              {recentActivity.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-[16px] border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tx.id}</p>
                    <p className="text-xs text-slate-500">{tx.user} · {tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-bayaro-navy">{tx.amount}</p>
                    <Badge tone={tx.status === "success" ? "success" : tx.status === "pending" ? "warning" : "danger"}>
                      {tx.status === "success" ? "Lunas" : tx.status === "pending" ? "Pending" : "Batal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/dashboard/
git commit -m "feat: dashboard page with static data"
```

---

## Task 4: Auth Pages (Static)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Update login page (remove auth checks)**

```typescript
import Image from "next/image";
import Link from "next/link";
import { BayaroLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-bayaro-navy lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07173f]/90 via-[#135FEF]/65 to-[#07173f]/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <BayaroLogo />
          <div className="max-w-xl">
            <p className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur inline-block">Bayaro Admin Template</p>
            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Admin panel modern yang ringan dan siap dipakai.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Template Next.js dengan komponen UI lengkap: tabel, form, kalender, kanban, chat, invoice, dan banyak lagi.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4">
            {["Next.js 15", "Tailwind CSS", "TypeScript"].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-4 text-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-soft md:p-10">
          <div className="flex justify-center lg:hidden">
            <BayaroLogo />
          </div>
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">Masuk ke Bayaro</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Login admin</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Masukkan email dan password untuk mengakses dashboard.
            </p>
          </div>

          <form action="/dashboard" method="get" className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="admin@bayaro.id" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input name="password" type="password" placeholder="Masukkan password" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded" /> Ingat saya
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-bayaro-blue hover:underline">
                Lupa password?
              </Link>
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Masuk ke Dashboard
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-bayaro-blue hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create register page**

```typescript
import Link from "next/link";
import { BayaroLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-bayaro-navy lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07173f]/90 via-[#135FEF]/65 to-[#07173f]/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <BayaroLogo />
          <div className="max-w-xl">
            <p className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur inline-block">Bergabung Sekarang</p>
            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Mulai kelola bisnis kamu dengan Bayaro.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Daftar gratis, siap digunakan dalam hitungan menit. Tidak perlu kartu kredit.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4">
            {["Gratis selamanya", "Setup 5 menit", "No credit card"].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-4 text-sm backdrop-blur">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-soft md:p-10">
          <div className="flex justify-center lg:hidden">
            <BayaroLogo />
          </div>
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">Daftar Akun Baru</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Buat akun</h2>
          </div>

          <form action="/dashboard" method="get" className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nama depan</label>
                <Input placeholder="Budi" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nama belakang</label>
                <Input placeholder="Santoso" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input type="email" placeholder="budi@contoh.id" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input type="password" placeholder="Min. 8 karakter" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Konfirmasi password</label>
              <Input type="password" placeholder="Ulangi password" />
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Buat Akun
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-bayaro-blue hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Create forgot-password page**

Create `src/app/(auth)/forgot-password/page.tsx`:
```typescript
import Link from "next/link";
import { BayaroLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <BayaroLogo />
        </div>
        <div className="rounded-[36px] bg-white p-8 shadow-soft md:p-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">Reset Password</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Lupa password?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Masukkan email kamu dan kami akan kirim link untuk reset password.
            </p>
          </div>
          <form action="/login" method="get" className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email terdaftar</label>
              <Input type="email" placeholder="budi@contoh.id" />
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Kirim Link Reset
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Ingat password kamu?{" "}
            <Link href="/login" className="font-medium text-bayaro-blue hover:underline">
              Kembali ke login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/
git commit -m "feat: static auth pages - login, register, forgot-password"
```

---

## Task 5: UI Tables Page

**Files:**
- Create: `src/app/(dashboard)/ui/tables/page.tsx`

- [ ] **Step 1: Create tables page with static data and client-side search/filter**

The page shows: (1) basic table, (2) data table with search, sort columns indicator, pagination, and row actions.

Create `src/app/(dashboard)/ui/tables/page.tsx` as a client component with:
- 20 rows of dummy user data (id, name, email, role, status, date)
- Search input that filters rows client-side
- Status filter dropdown
- Pagination (5 rows per page)
- Row action buttons (Edit, Delete)
- Badge for status column

File: 130-170 lines. Use `"use client"` directive since it needs useState for filtering/pagination.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/tables/
git commit -m "feat: UI tables page with static datatable"
```

---

## Task 6: UI Forms Page

**Files:**
- Create: `src/app/(dashboard)/ui/forms/page.tsx`

- [ ] **Step 1: Create forms showcase page**

Show all form elements in sections:
1. Text inputs (default, focus, error, disabled states)
2. Select dropdowns
3. Textarea
4. Checkboxes (group)
5. Radio buttons (group)
6. Switch toggles
7. File upload area
8. Complete example form (with submit button)

Use `"use client"` for Checkbox/Switch interactivity.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/forms/
git commit -m "feat: UI forms page showcasing all form elements"
```

---

## Task 7: UI Cards Page

**Files:**
- Create: `src/app/(dashboard)/ui/cards/page.tsx`

- [ ] **Step 1: Create cards showcase page**

Show card variants in sections:
1. Stat cards (with trend indicator, icon)
2. Content cards (title + body + footer)
3. Image cards (product-style with image placeholder)
4. Pricing cards (basic/pro/enterprise)
5. User profile card
6. Dark card (navy bg)
7. Glassmorphism card

All static, no interactivity needed.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/cards/
git commit -m "feat: UI cards page showcasing card variants"
```

---

## Task 8: UI Modals Page

**Files:**
- Create: `src/app/(dashboard)/ui/modals/page.tsx`

- [ ] **Step 1: Create modals showcase page (client component)**

Show modal variants triggered by buttons:
1. Basic modal (title + content + close)
2. Confirmation dialog (with Cancel/Confirm actions)
3. Form modal (with input fields)
4. Large modal (size lg)
5. Alert/danger dialog

Use the `Modal` component from `src/components/ui/modal.tsx`. Each variant has a "Preview" button that opens it.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/modals/
git commit -m "feat: UI modals page with interactive modal demos"
```

---

## Task 9: UI Buttons & Badges Page

**Files:**
- Create: `src/app/(dashboard)/ui/buttons/page.tsx`

- [ ] **Step 1: Create buttons & badges showcase (static)**

Sections:
1. Button variants (primary, secondary, ghost, danger)
2. Button sizes (sm, md, lg via className)
3. Button states (disabled, loading with spinner)
4. Icon buttons (with lucide icons left/right)
5. Button groups
6. Badge tones (default, success, warning, info, danger)
7. Badge sizes

All static display, no interactivity needed.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/buttons/
git commit -m "feat: UI buttons & badges page"
```

---

## Task 10: UI Alerts Page

**Files:**
- Create: `src/app/(dashboard)/ui/alerts/page.tsx`

- [ ] **Step 1: Create alerts showcase page (client component)**

Sections:
1. Alert variants (info, success, warning, danger) — using `Alert` component
2. Alerts with title + body
3. Dismissible alert (useState to hide)
4. Toast notification demo (useState to show/hide a toast overlay)
5. Inline form validation messages

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/ui/alerts/
git commit -m "feat: UI alerts & toast page"
```

---

## Task 11: Calendar Page

**Files:**
- Create: `src/app/(dashboard)/pages/calendar/page.tsx`

- [ ] **Step 1: Create calendar page (client component)**

Static monthly calendar view with:
- Month navigation (prev/next with useState for month offset)
- 7-column day grid
- 5-6 rows of days
- Some days have colored event dots (hardcoded events array)
- Events list sidebar showing upcoming events
- Dummy events: meetings, deadlines, reminders — 8-10 events

All rendered from static data, no external calendar library.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/calendar/
git commit -m "feat: calendar page with static events"
```

---

## Task 12: Kanban Page

**Files:**
- Create: `src/app/(dashboard)/pages/kanban/page.tsx`

- [ ] **Step 1: Create kanban board page (client component)**

4 columns: Todo, In Progress, Review, Done
Each column has 3-4 task cards with:
- Task title
- Description snippet
- Assignee avatar (initials circle)
- Priority badge (Low/Medium/High)
- Tag badges

Simple drag via button-based move (click card action button to move to next column — no drag library needed).

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/kanban/
git commit -m "feat: kanban board page"
```

---

## Task 13: File Manager Page

**Files:**
- Create: `src/app/(dashboard)/pages/file-manager/page.tsx`

- [ ] **Step 1: Create file manager page (client component)**

- Sidebar with folder tree (Documents, Images, Videos, Downloads)
- Main area with grid/list toggle
- 12 static files with: icon, name, size, date, type
- Breadcrumb path
- Search bar
- Selected file count indicator

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/file-manager/
git commit -m "feat: file manager page"
```

---

## Task 14: Chat Page

**Files:**
- Create: `src/app/(dashboard)/pages/chat/page.tsx`

- [ ] **Step 1: Create chat UI page (client component)**

- Left sidebar: list of 6 contacts with avatar, last message, timestamp, unread count badge
- Right: active chat with message history (10-12 messages alternating sent/received)
- Input box at bottom (non-functional, static)
- Contact name + status in header

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/chat/
git commit -m "feat: chat page"
```

---

## Task 15: Invoice Page

**Files:**
- Create: `src/app/(dashboard)/pages/invoice/page.tsx`

- [ ] **Step 1: Create invoice detail page (static)**

A full invoice layout:
- Header: company logo + invoice number + date
- Bill To / From sections
- Line items table (product, qty, price, subtotal)
- Subtotal, tax, total sections
- Payment status badge
- Print/Download buttons (non-functional)
- Notes section

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/invoice/
git commit -m "feat: invoice page"
```

---

## Task 16: Pricing Page

**Files:**
- Create: `src/app/(dashboard)/pages/pricing/page.tsx`

- [ ] **Step 1: Create pricing page (static)**

3 pricing tiers: Starter, Professional, Enterprise
Each tier card has:
- Price (monthly)
- Feature list with checkmarks
- CTA button
- Middle tier highlighted as "Popular"

Below: FAQ section with 4-5 questions, toggle expand (useState).

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pages/pricing/
git commit -m "feat: pricing page"
```

---

## Task 17: Profile & Settings Pages

**Files:**
- Create: `src/app/(dashboard)/profile/page.tsx`
- Create: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create profile page (static)**

- Profile header: avatar (initials), name, role, join date
- Info sections: Personal Info (name, email, phone, location), Bio, Social Links
- Activity summary stats
- Edit button (opens a static form section below)

- [ ] **Step 2: Create settings page (client component)**

Sections with Switch components:
1. Notifikasi (email notif, push notif, weekly report)
2. Tampilan (dark mode toggle placeholder, language selector)
3. Keamanan (2FA toggle, session list)
4. Privasi (data sharing toggles)

Save button at bottom.

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/profile/ src/app/(dashboard)/settings/
git commit -m "feat: profile and settings pages"
```

---

## Final: Cleanup & Verify

- [ ] **Step 1: Run `npm install` to sync package.json**

```bash
npm install
```

- [ ] **Step 2: Run build check**

```bash
npm run build
```

Expected: No TypeScript or build errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verify build"
```
