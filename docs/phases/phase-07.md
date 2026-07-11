# Phase 7: Dashboard & Reports

**Goal:** Real dashboard dengan data aktual + laporan penjualan, produk, kasir, stok.  
**Estimasi:** 4-5 hari  
**Dependencies:** Phase 5, Phase 6  
**Priority:** P0

---

## 1. Pages & Routes

```
src/app/(dashboard)/
  dashboard/page.tsx      — Real-time dashboard (update from static)
  reports/
    sales/page.tsx        — Laporan penjualan
    products/page.tsx     — Laporan produk terlaris
    cashier/page.tsx      — Laporan per kasir/shift
    inventory/page.tsx    — Laporan stok
    export/page.tsx       — Export PDF/Excel
```

---

## 2. Dashboard Widgets

- Penjualan hari ini (total amount, transaction count)
- Perbandingan vs kemarin / minggu lalu (% change)
- Grafik omzet 7 hari / 30 hari (line chart)
- Top 10 produk terlaris
- Transaksi terbaru (live feed)
- Low stock alerts
- Revenue per outlet (jika multi-outlet)
- Payment method breakdown (pie chart)

---

## 3. Reports Features

| Report | Filters | Output |
|--------|---------|--------|
| **Penjualan** | Date range, outlet, kasir | Tabel + line chart |
| **Produk** | Date range, category | Ranking + bar chart |
| **Kasir** | Date range, employee | Per-kasir stats |
| **Inventori** | Outlet, category | Movement + valuation |

---

## 4. Chart Library

```
Install: npm install recharts
Components: LineChart, BarChart, PieChart, AreaChart
```

---

## 5. Export

- **PDF:** via `@react-pdf/renderer` atau HTML-to-PDF (puppeteer server-side)
- **Excel:** via `xlsx` package (client-side generation)

---

## 6. Deliverables Checklist

```
- [ ] Install recharts + xlsx
- [ ] Build real dashboard with actual data queries
- [ ] Build date range picker component
- [ ] Build sales report page (with filters + chart)
- [ ] Build product report page (ranking + chart)
- [ ] Build cashier report page (per-employee stats)
- [ ] Build inventory report page (movement log)
- [ ] Build chart components (line, bar, pie)
- [ ] Build export to PDF functionality
- [ ] Build export to Excel functionality
- [ ] Test reports with sample data
- [ ] Commit
```
