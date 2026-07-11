# ITADMIN Panel — Super Admin / Platform Monitoring

**Date:** 2025-07-11
**Status:** Draft
**Author:** AI + Zakian

---

## Overview

Panel super admin untuk developer/freelancer yang mengelola POS system untuk multiple klien. ITADMIN bisa monitoring semua toko, kelola subscription, atur paket & harga, dan kontrol fitur yang bisa diakses per plan.

## Goals

1. Satu pintu login (`/login`) — detect role ITADMIN → redirect ke `/itadmin/dashboard`
2. Monitoring seluruh bisnis/toko yang menggunakan sistem
3. Kelola subscription (perpanjang, upgrade, downgrade manual)
4. Atur paket (harga, fitur, limit) — langsung terintegrasi ke admin panel bisnis
5. Feature gating: menu admin panel bisnis di-hide berdasarkan plan features yang diset ITADMIN
6. Support multiple akun ITADMIN

---

## Schema Changes

### User Model — tambah `role` field

```prisma
model User {
  // ... existing fields
  role String @default("user") // "user" | "itadmin"
}
```

### Plan Model — enhance `features` field

`features` field di Plan model sudah ada (`String[]`). Ini akan di-mapping ke permission/menu keys yang digunakan sidebar admin panel untuk show/hide menu. 

**Feature keys yang tersedia:**

```
dashboard.view        → Menu Dashboard
pos.access            → Menu POS Kasir
products.view         → Menu Produk
products.manage       → Tambah/edit produk
inventory.view        → Menu Inventori
inventory.manage      → Manage stok
employees.view        → Menu Karyawan
employees.manage      → Kelola karyawan
reports.view          → Menu Laporan
settings.manage       → Menu Pengaturan
promos.view           → Menu Promo
promos.manage         → Kelola promo
customers.view        → Menu Pelanggan
customers.manage      → Kelola pelanggan
shift.access          → Shift Management
multi_outlet          → Multi Outlet support
export                → Export data (CSV/Excel)
advanced_reports      → Laporan advanced
api                   → API access
```

ITADMIN bisa toggle feature keys ini per plan. Sidebar bisnis membaca `plan.features` → intersect dengan menu navItems → hanya tampilkan yang ada di plan.

---

## Routes & Layout

### Route Group: `(itadmin)`

```
src/app/(itadmin)/
├── layout.tsx              → Auth guard (role === "itadmin"), sidebar + topbar layout
├── itadmin/
│   ├── dashboard/page.tsx  → Overview stats
│   ├── businesses/page.tsx → List semua bisnis
│   ├── businesses/[id]/page.tsx → Detail bisnis
│   ├── subscriptions/page.tsx   → Kelola subscription
│   ├── plans/page.tsx      → CRUD paket & harga
│   ├── monitoring/page.tsx → Grafik transaksi per toko
│   └── system/page.tsx     → System-wide stats
```

### Layout

Sama dengan admin panel bisnis (sidebar + topbar), tapi:
- Sidebar menu khusus ITADMIN
- Topbar tanpa OutletSwitcher dan PlanDropdown
- Warna accent beda (misal: slate/dark theme) biar gampang dibedakan

### ITADMIN Sidebar Menu

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Dashboard | /itadmin/dashboard |
| Store | Bisnis/Toko | /itadmin/businesses |
| CreditCard | Subscription | /itadmin/subscriptions |
| Package | Paket & Harga | /itadmin/plans |
| BarChart2 | Monitoring | /itadmin/monitoring |
| Server | System | /itadmin/system |

---

## Pages Detail

### 1. Dashboard (`/itadmin/dashboard`)

Stats cards:
- Total bisnis aktif
- Total transaksi hari ini (all businesses)
- Revenue aggregat hari ini
- Bisnis baru bulan ini
- Subscription akan expired (7 hari ke depan)

Charts:
- Transaksi 30 hari terakhir (line chart)
- Revenue per minggu (bar chart)
- Distribusi plan (pie: starter/pro/enterprise)

### 2. Bisnis/Toko (`/itadmin/businesses`)

Table dengan kolom:
- Nama bisnis
- Owner
- Plan (badge)
- Status subscription
- Jumlah outlet
- Transaksi bulan ini
- Last activity
- Actions (detail, manage subs)

Filter: by plan, by status, search by name

Detail page (`/itadmin/businesses/[id]`):
- Info bisnis lengkap
- Subscription history
- Grafik transaksi toko ini
- List outlet & karyawan
- Quick actions: perpanjang subs, upgrade plan

### 3. Subscription (`/itadmin/subscriptions`)

Table semua subscription:
- Bisnis
- Plan
- Status (trial/active/expired/cancelled)
- Start date
- Expiry date
- Actions

Actions:
- Perpanjang (set new `currentPeriodEnd`)
- Upgrade/Downgrade (change `planId`)
- Activate (trial → active)
- Cancel

### 4. Paket & Harga (`/itadmin/plans`)

CRUD untuk plans:
- Nama plan
- Display name
- Harga (per bulan, Rupiah)
- Max outlets
- Max employees
- **Features checklist** — toggle feature keys on/off

Ini yang langsung terintegrasi ke admin panel bisnis. Kalau ITADMIN uncheck "shift.access" dari plan Starter, semua bisnis Starter langsung gak bisa lihat menu Shift.

### 5. Monitoring (`/itadmin/monitoring`)

- Dropdown pilih bisnis (atau all)
- Grafik transaksi harian (7/30/90 hari)
- Top 5 toko by transaction count
- Top 5 toko by revenue
- Toko yang inactive (no transaction > 7 hari)

### 6. System (`/itadmin/system`)

- Total registered users
- Total businesses
- Total orders all-time
- Total revenue all-time
- Avg orders per day
- Database size (opsional)

---

## Feature Gating Integration

### How it works:

1. **ITADMIN** sets `Plan.features = ["dashboard.view", "pos.access", "products.view", ...]` di `/itadmin/plans`
2. **Dashboard layout** (`src/app/(dashboard)/layout.tsx`) fetches business subscription → plan → features
3. **Sidebar** filters `navItems` berdasarkan:
   - `employee.role.permissions` (role-based, existing)
   - **AND** `plan.features` (plan-based, NEW)
   - Menu hanya tampil kalau ADA di kedua-duanya
4. **Modal Paket** — di navbar, klik plan badge → modal perbandingan 3 paket (nama, harga, fitur, CTA "Hubungi Admin untuk upgrade")

### Onboarding Integration

- Onboarding step "Multi Outlet" di-skip kalau plan gak punya `multi_outlet`
- Onboarding step "Shift" di-skip kalau plan gak punya `shift.access`
- Max outlet validation: gak bisa bikin outlet lebih dari `plan.maxOutlets`

---

## Auth Flow

```
User login di /login
  → Check user.role
    → "itadmin" → redirect /itadmin/dashboard
    → "user"   → redirect /dashboard (existing flow)
```

Middleware di route group `(itadmin)`:
- Check `session.user.role === "itadmin"`
- Kalau bukan → redirect `/dashboard`

---

## Seed Data

Tambah 1 ITADMIN user di seed:

```
IT Admin : itadmin@bayaro.id / admin123
```

---

## Security

- ITADMIN routes dilindungi middleware role check
- ITADMIN server actions validate `user.role === "itadmin"` 
- Business users gak bisa akses `/itadmin/*`
- ITADMIN gak punya akses ke data sensitif bisnis (password, PIN) — hanya monitoring

---

## Out of Scope (for now)

- Billing/payment gateway integration (pembayaran subscription)
- Email notifications (subscription expiring)
- Audit log per action ITADMIN
- White-label / custom branding per bisnis
