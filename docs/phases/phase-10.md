# Phase 10: Outlet Management + Multi-Outlet

**Goal:** Kelola multiple outlet, switch outlet context, per-outlet data isolation.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 1  
**Priority:** P1

---

## 1. Pages & Routes

```
src/app/(dashboard)/
  outlets/
    page.tsx              — Outlet list (all outlets)
    [id]/page.tsx         — Outlet detail + stats
    new/page.tsx          — Tambah outlet baru
    [id]/edit/page.tsx    — Edit outlet
```

---

## 2. Features

- CRUD outlet (nama, alamat, jam operasional, phone)
- Outlet switcher di topbar (dropdown untuk switch active outlet)
- Per-outlet stats (revenue, transactions, employees count)
- Outlet comparison view (side-by-side performance)
- Activate/deactivate outlet
- Data isolation: transaksi, stok, shift per outlet
- "All outlets" view untuk owner (aggregate data)

---

## 3. Outlet Switcher Component

```
┌─────────────────────────────┐
│ 🏪 Cabang Pusat        ▼   │  ← Topbar dropdown
├─────────────────────────────┤
│ ● Cabang Pusat (active)     │
│ ○ Cabang Kemang             │
│ ○ Cabang BSD                │
│ ─────────────────────────── │
│ 🌐 Semua Outlet             │
│ ─────────────────────────── │
│ + Tambah Outlet Baru        │
└─────────────────────────────┘
```

---

## 4. Server Actions

```typescript
// src/actions/outlets.ts
getOutlets()                 — List all outlets for business
getOutlet(id)                — Detail + stats
createOutlet(data)           — Create new outlet
updateOutlet(id, data)       — Update
toggleOutletStatus(id)       — Activate/deactivate
switchActiveOutlet(id)       — Update user session
getOutletStats(id)           — Revenue, transactions, employees
compareOutlets(ids)          — Side-by-side comparison
```

---

## 5. Deliverables Checklist

```
- [ ] Build outlet list page
- [ ] Build outlet create/edit form
- [ ] Build outlet detail page with stats
- [ ] Build outlet switcher component (topbar dropdown)
- [ ] Store active outlet in session/cookie
- [ ] Update all queries to filter by active outlet
- [ ] Build "All outlets" aggregate view for owner
- [ ] Build outlet comparison page
- [ ] Test multi-outlet data isolation
- [ ] Commit
```
