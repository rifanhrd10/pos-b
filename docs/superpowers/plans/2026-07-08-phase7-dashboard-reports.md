# Phase 7: Dashboard & Reports — Implementation Plan

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Base commit:** d6694d8  
**Persona:** Owner/manager — strategic view, not kasir operations

## Design Decisions (approved)

- **Style:** Clean light (white/abu background, colorful charts)
- **Default period:** Hari ini — filter untuk switch ke 7 hari / bulan ini
- **Export:** Excel only (xlsx package, skip PDF)
- **Charts:** Recharts (AreaChart, BarChart, PieChart, LineChart)
- **Laporan:** Halaman terpisah per laporan (`/reports/sales`, `/reports/products`, dst)

---

## Architecture

### Data Flow
- Server components untuk initial load (no extra API routes needed)
- `src/actions/reports.ts` — semua query analytics
- Client components hanya untuk: chart rendering, date range filter, export button
- Auto-refresh transaksi terbaru: polling 30s via useEffect di client component

### New Files
```
src/actions/reports.ts                         — semua query analytics
src/app/(dashboard)/dashboard/page.tsx         — replace existing static dashboard
src/app/(dashboard)/reports/
  sales/page.tsx
  products/page.tsx
  cashier/page.tsx
  inventory/page.tsx
src/components/charts/
  area-chart.tsx                               — wrapper Recharts AreaChart
  bar-chart.tsx                                — wrapper Recharts BarChart
  donut-chart.tsx                              — wrapper Recharts PieChart (donut variant)
  line-chart.tsx                               — wrapper Recharts LineChart
src/components/shared/
  date-range-picker.tsx                        — preset buttons + custom date input
  export-excel-button.tsx                      — xlsx client-side export
  kpi-card.tsx                                 — metric card dengan % change indicator
```

---

## Blocks

### Block A — Install deps + `src/actions/reports.ts`

**Install:**
```bash
npm install recharts xlsx
npm install --save-dev @types/xlsx
```

**Functions di `reports.ts`:**

```typescript
// Dashboard
getDashboardStats(businessId, period: "today" | "7days" | "30days")
// Returns: { revenue, transactions, avgOrderValue, itemsSold, revenueChange, transactionsChange }

getRevenueChartData(businessId, period: "today" | "7days" | "30days")
// today → per jam (0-23), 7days/30days → per hari
// Returns: Array<{ label: string; value: number }>

getTopProducts(businessId, period, limit = 10)
// Returns: Array<{ name: string; qty: number; revenue: number }>

getPaymentBreakdown(businessId, period)
// Returns: Array<{ method: string; count: number; amount: number }>

getRecentTransactions(businessId, limit = 5)
// Returns: Array<{ id, orderNumber, totalAmount, createdAt, employee, outlet }>

getLowStockAlerts(businessId, threshold = 10)
// Returns: Array<{ name: string; stock: number; unit: string; outlet: string }>

// Reports
getSalesReport(businessId, startDate, endDate, outletId?)
// Returns: { dailyData: [...], summary: { total, count, avg }, byOutlet: [...] }

getProductsReport(businessId, startDate, endDate, categoryId?)
// Returns: Array<{ name, category, qty, revenue, rank }>

getCashierReport(businessId, startDate, endDate)
// Returns: Array<{ employeeName, sessions, transactions, totalRevenue, avgPerTransaction }>

getInventoryReport(businessId, outletId?, categoryId?)
// Returns: Array<{ name, category, outlet, currentStock, unit, lastMovement }>
```

**Query patterns:**
- Period filter: `createdAt >= startOfDay` / `>= 7 days ago` / `>= 30 days ago`
- Hanya orders dengan `status: "PAID"` (exclude DRAFT, VOID)
- Group by menggunakan Prisma `groupBy` + raw date truncation via `$queryRaw` untuk hourly/daily chart

### Block B — Dashboard page (`/dashboard`)

**Layout (server component + client sub-components):**

```
DashboardPage (server)
├── DashboardHeader (period filter — "Hari ini | 7 Hari | Bulan ini" via searchParams)
├── Row 1: KpiCard × 4 (Pendapatan, Transaksi, Avg Order, Item Terjual)
├── Row 2: RevenueAreaChart (client) + period switcher
├── Row 3:
│   ├── TopProductsChart (horizontal BarChart + mini table)
│   └── PaymentDonutChart (PieChart donut)
└── Row 4:
    ├── RecentTransactions (client, polling 30s)
    └── LowStockAlerts
```

**Period switching:** via URL searchParams `?period=today|7days|30days` — server component re-renders, no client state needed except for charts.

**KpiCard component:**
```tsx
// Shows: label, value (formatted), change% vs previous period
// Green arrow if positive, red if negative, gray if zero
// Skeleton loading state
```

### Block C — `/reports/sales` + `/reports/products`

**Sales Report (`/reports/sales`):**
- Filter bar: date range picker + outlet selector
- Summary cards: Total Revenue, Total Transaksi, Avg Order Value
- Line chart: omzet per hari
- Table: transaksi list (sortable, paginated 20/page)
- Export Excel button (download `laporan-penjualan-{date}.xlsx`)

**Products Report (`/reports/products`):**
- Filter bar: date range + category selector
- Horizontal bar chart: top 20 produk by revenue
- Table: ranking dengan kolom Produk, Kategori, Qty Terjual, Revenue
- Export Excel button

### Block D — `/reports/cashier` + `/reports/inventory`

**Cashier Report (`/reports/cashier`):**
- Filter bar: date range
- Bar chart: revenue per kasir
- Table: Kasir, Jumlah Sesi, Jumlah Transaksi, Total Revenue, Avg/Transaksi

**Inventory Report (`/reports/inventory`):**
- Filter bar: outlet + category
- Table: Produk, Kategori, Outlet, Stok Saat Ini, Satuan, Gerakan Terakhir
- Color coding: merah jika stok < 10, kuning jika < 20
- Export Excel button

### Block E — Shared components + nav update

**`date-range-picker.tsx`:**
```tsx
// Preset buttons: Hari ini | 7 Hari | 30 Hari | Bulan ini | Custom
// Custom mode: 2 date inputs (start + end)
// Syncs to URL searchParams via router.push
// No external dependency — native HTML date input
```

**`export-excel-button.tsx`:**
```tsx
// Props: data (unknown[]), filename (string), columns (mapping)
// Client component — generates xlsx in browser
// Uses xlsx package: XLSX.utils.json_to_sheet + XLSX.writeFile
```

**`kpi-card.tsx`:**
```tsx
// Props: label, value, change?, changeLabel?, icon?, color?
// Formats value as Rp currency or plain number
// Shows trend arrow + % change
```

**Nav update (`src/lib/nav.ts`):**
```typescript
// Add "Laporan" section dengan sub-items:
// - /reports/sales    → Penjualan
// - /reports/products → Produk Terlaris
// - /reports/cashier  → Per Kasir
// - /reports/inventory → Inventori
```

---

## Execution Order

| Block | Dependencies | Parallel? |
|-------|-------------|-----------|
| A (install + actions) | none | first |
| B (dashboard) | A | after A |
| C (sales + products) | A | parallel with B |
| D (cashier + inventory) | A | parallel with B, C |
| E (shared components + nav) | B, C, D | last |

Blocks B, C, D bisa dijalankan parallel setelah A selesai.

---

## Constraints

- tsc: 0 errors setiap block
- No `any` type kecuali untuk xlsx data rows
- Recharts harus wrapped dalam `"use client"` — jangan import langsung di server component
- `$queryRaw` hanya jika Prisma `groupBy` tidak cukup untuk date truncation
- Mobile responsive: grid collapse ke single column di < 768px
- Empty state untuk semua chart/table jika data kosong

---

## Commit Plan

```
feat(reports): install recharts + xlsx, add report server actions
feat(dashboard): replace static dashboard with real-time data and charts
feat(reports): add sales and products report pages
feat(reports): add cashier and inventory report pages
feat(reports): add shared components - date-range-picker, kpi-card, export-excel
```
