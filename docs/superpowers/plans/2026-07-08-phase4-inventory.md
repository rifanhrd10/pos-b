# Phase 4: Inventory & Stock Management — Implementation Plan

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Dependencies:** Phase 3 ✅

---

## Overview

4 blok kerja berurutan:
- **Block A:** Schema + Migration
- **Block B:** Server Actions (stock, adjustment, transfer, opname)
- **Block C:** Pages & UI
- **Block D:** Nav update + TSC + Commit

---

## Block A: Schema + Migration

### Files
- `prisma/schema.prisma` — tambah 4 model + 1 enum + relasi ke Outlet/Product/ProductVariant

### Schema additions

```prisma
enum StockMovementType {
  IN
  OUT
  ADJUSTMENT
  TRANSFER
  OPNAME
}

model Stock {
  id        String   @id @default(cuid())
  outletId  String
  productId String
  variantId String?
  quantity  Int      @default(0)
  minStock  Int      @default(5)
  updatedAt DateTime @updatedAt

  outlet    Outlet          @relation(fields: [outletId], references: [id])
  product   Product         @relation(fields: [productId], references: [id])
  variant   ProductVariant? @relation(fields: [variantId], references: [id])
  movements StockMovement[]

  @@unique([outletId, productId, variantId])
}

model StockMovement {
  id        String            @id @default(cuid())
  stockId   String
  type      StockMovementType
  quantity  Int               // positive = in, negative = out
  note      String?
  reference String?
  createdBy String?
  createdAt DateTime          @default(now())

  stock Stock @relation(fields: [stockId], references: [id])
}

model StockTransfer {
  id           String    @id @default(cuid())
  businessId   String
  fromOutletId String
  toOutletId   String
  status       String    @default("pending") // pending | in_transit | received | cancelled
  note         String?
  createdBy    String
  createdAt    DateTime  @default(now())
  completedAt  DateTime?

  items StockTransferItem[]
}

model StockTransferItem {
  id         String  @id @default(cuid())
  transferId String
  productId  String
  variantId  String?
  quantity   Int

  transfer StockTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
}
```

### Relasi yang perlu ditambahkan ke model existing

```prisma
// Outlet — tambah:
stocks    Stock[]

// Product — tambah:
stocks    Stock[]

// ProductVariant — tambah:
stocks    Stock[]
```

### Commands
```bash
npx prisma migrate dev --name add_inventory_stock
npx prisma generate
```

---

## Block B: Server Actions

### `src/actions/stock.ts`

```typescript
// Queries
getStockOverview(businessId, outletId?)     → Product list + qty per outlet
getStockByProduct(productId, outletId)      → Detail stok 1 produk
getLowStockItems(businessId, outletId?)     → Items below minStock
getMovementHistory(stockId, limit?)         → Riwayat movement

// Mutations
adjustStock(data: {
  outletId, productId, variantId?,
  quantity, type: StockMovementType,
  note?, reference?, createdBy
})                                          → upsert Stock + create StockMovement
setMinStock(stockId, minStock)              → update minStock
```

### `src/actions/transfers.ts`

```typescript
getTransfers(businessId, filters?)          → Transfer list
getTransfer(id)                             → Detail transfer + items
createTransfer(data: {
  businessId, fromOutletId, toOutletId,
  note, createdBy,
  items: { productId, variantId?, quantity }[]
})                                          → Create StockTransfer + items
approveTransfer(id)                         → status → in_transit
receiveTransfer(id)                         → status → received + adjustStock OUT fromOutlet + IN toOutlet
cancelTransfer(id)                          → status → cancelled
```

### `src/actions/opname.ts`

```typescript
startOpname(outletId, businessId)           → Return current stock list for counting form
submitOpname(data: {
  outletId, createdBy,
  items: { stockId, actualQty }[]
})                                          → Hitung delta, adjustStock OPNAME per item
```

### Validation schemas (`src/lib/validations/inventory.ts`)

```typescript
adjustStockSchema     — outletId, productId, quantity (int), type, note?
createTransferSchema  — fromOutletId, toOutletId, items (min 1), note?
submitOpnameSchema    — outletId, items[]: { stockId, actualQty (int ≥ 0) }
```

---

## Block C: Pages & UI

### Route structure
```
src/app/(dashboard)/inventory/
  page.tsx                    — Stock overview (table: produk, stok per outlet, min, status)
  adjustments/
    page.tsx                  — Movement history log (filter by type, produk, outlet)
  transfers/
    page.tsx                  — Transfer list (status badge, from/to outlet)
    new/
      page.tsx                — Form buat transfer baru
    [id]/
      page.tsx                — Detail transfer + approve/receive/cancel actions
  opname/
    page.tsx                  — Stock opname form (input actual count per produk)
  low-stock/
    page.tsx                  — Low stock alerts (highlight merah jika qty < minStock)
```

### Page patterns (ikuti pola products/page.tsx)
- Server component, `auth()` + `getBusinessContext()` guard
- Outlet filter menggunakan `getActiveOutletId()` dari cookie
- Table dengan `overflow-x-auto`, `rounded-[24px]`, `shadow-soft`
- Status badge pakai `<Badge tone="...">` existing
- Actions sebagai `<form>` dengan Server Actions (bukan API route)
- Empty state dengan pesan deskriptif

### Key UI decisions
- **Stock overview:** kolom Produk | Kategori | Outlet | Qty | Min Stock | Status (OK/Low/Out)
- **Low stock:** badge merah jika qty ≤ minStock, kuning jika qty ≤ minStock * 1.5
- **Transfer detail:** timeline status (pending → in_transit → received)
- **Opname:** input number per baris, diff ditampilkan real-time (± delta)
- **Adjustment form:** modal/sheet (tidak halaman terpisah) dengan type selector

### Shared component: `src/components/shared/stock-adjust-form.tsx`
- Props: `stockId`, `currentQty`, `outletId`, `productId`, `variantId?`
- Types: IN | OUT | ADJUSTMENT (TRANSFER dan OPNAME hanya dari flow khusus)
- Submit via `adjustStock` server action

---

## Block D: Nav + Verification + Commit

### Sidebar nav update
Cek file nav di `src/components/layout/` atau `src/components/shared/sidebar.tsx` — tambah item:

```typescript
{
  label: "Inventori",
  href: "/inventory",
  icon: PackageIcon,
  permission: "inventory.view",  // ikuti pola permission yang sudah ada
  children: [
    { label: "Stok Overview", href: "/inventory" },
    { label: "Low Stock", href: "/inventory/low-stock" },
    { label: "Penyesuaian", href: "/inventory/adjustments" },
    { label: "Transfer", href: "/inventory/transfers" },
    { label: "Stok Opname", href: "/inventory/opname" },
  ]
}
```

### Verification
```bash
npx tsc --noEmit          # must pass 0 errors
npx prisma validate       # schema valid
```

### Commit sequence
```
feat(db): add Stock, StockMovement, StockTransfer, StockTransferItem schema
feat(inventory): add stock and transfer server actions
feat(inventory): add opname server action
feat(inventory): add inventory pages (overview, adjustments, transfers, opname, low-stock)
feat(nav): add inventory section to sidebar
```

Or single commit:
```
feat: complete phase 4 — inventory and stock management
```

---

## Checklist

```
Block A
- [ ] Add Stock model to schema.prisma
- [ ] Add StockMovement model to schema.prisma
- [ ] Add StockTransfer + StockTransferItem to schema.prisma
- [ ] Add StockMovementType enum
- [ ] Add back-relations to Outlet, Product, ProductVariant
- [ ] Run prisma migrate dev
- [ ] Run prisma generate

Block B
- [ ] src/lib/validations/inventory.ts
- [ ] src/actions/stock.ts (getStockOverview, adjustStock, getLowStockItems, getMovementHistory, setMinStock)
- [ ] src/actions/transfers.ts (getTransfers, getTransfer, createTransfer, approveTransfer, receiveTransfer, cancelTransfer)
- [ ] src/actions/opname.ts (startOpname, submitOpname)

Block C
- [ ] inventory/page.tsx — stock overview
- [ ] inventory/low-stock/page.tsx
- [ ] inventory/adjustments/page.tsx
- [ ] inventory/transfers/page.tsx
- [ ] inventory/transfers/new/page.tsx
- [ ] inventory/transfers/[id]/page.tsx
- [ ] inventory/opname/page.tsx
- [ ] src/components/shared/stock-adjust-form.tsx

Block D
- [ ] Update sidebar nav with Inventori section
- [ ] npx tsc --noEmit passes
- [ ] Commit
```

---

## Notes

- `adjustStock` adalah atomic unit — semua mutations (transfer, opname, manual adjust) memanggil function ini
- Transfer `receiveTransfer` harus wrap dalam Prisma `$transaction` agar OUT + IN atomic
- Opname `submitOpname` juga `$transaction` — semua adjustment atau tidak sama sekali
- Products dengan `trackStock: false` tetap muncul di overview tapi dengan note "Tidak dilacak"
- Outlet filter: kalau tidak ada active outlet, show semua outlet (aggregate view)
