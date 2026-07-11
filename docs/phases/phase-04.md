# Phase 4: Inventory & Stock Management

**Goal:** Stock tracking per outlet, stock opname, transfer antar outlet.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 3  
**Priority:** P0

---

## 1. Database Schema

```prisma
model Stock {
  id          String   @id @default(cuid())
  outletId    String
  productId   String
  variantId   String?
  quantity    Int      @default(0)
  minStock    Int      @default(5)
  updatedAt   DateTime @updatedAt

  outlet      Outlet         @relation(fields: [outletId], references: [id])
  product     Product        @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  movements   StockMovement[]

  @@unique([outletId, productId, variantId])
}

enum StockMovementType {
  IN
  OUT
  ADJUSTMENT
  TRANSFER
  OPNAME
}

model StockMovement {
  id          String            @id @default(cuid())
  stockId     String
  type        StockMovementType
  quantity    Int               // positive = in, negative = out
  note        String?
  reference   String?
  createdBy   String?
  createdAt   DateTime          @default(now())

  stock       Stock @relation(fields: [stockId], references: [id])
}

model StockTransfer {
  id              String   @id @default(cuid())
  businessId      String
  fromOutletId    String
  toOutletId      String
  status          String   @default("pending") // pending, in_transit, received, cancelled
  note            String?
  createdBy       String
  createdAt       DateTime @default(now())
  completedAt     DateTime?

  items           StockTransferItem[]
}

model StockTransferItem {
  id          String @id @default(cuid())
  transferId  String
  productId   String
  variantId   String?
  quantity    Int

  transfer    StockTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
}
```

---

## 2. Pages & Routes

```
src/app/(dashboard)/
  inventory/
    page.tsx              — Stock overview (semua produk + qty per outlet)
    adjustments/page.tsx  — Stock adjustment log
    transfers/page.tsx    — Transfer history
    transfers/new/page.tsx — Buat transfer baru
    opname/page.tsx       — Stock opname (count)
    low-stock/page.tsx    — Low stock alerts
```

---

## 3. Features

- Stock overview per outlet (product, variant, qty, min stock)
- Low stock alerts (produk di bawah threshold)
- Stock adjustment (tambah/kurang manual + alasan)
- Stock transfer antar outlet (create → approve → receive)
- Stock opname (input qty actual, auto-adjustment)
- Movement history log (siapa, kapan, berapa, alasan)
- Auto-decrement saat transaksi (integrated di Phase 5)

---

## 4. Server Actions

```typescript
// src/actions/inventory.ts
getStockOverview(outletId, filters)   — Stock list per outlet
getStockMovements(stockId)            — Movement history
adjustStock(stockId, qty, note)       — Manual adjustment
getLowStockAlerts(outletId)           — Products below minStock

// src/actions/transfers.ts
getTransfers(filters)                  — Transfer list
createTransfer(data)                   — Create transfer request
approveTransfer(id)                    — Approve/ship
receiveTransfer(id)                    — Mark received + update stock
cancelTransfer(id)                     — Cancel

// src/actions/opname.ts
startOpname(outletId)                  — Get current stock for counting
submitOpname(data)                     — Submit actual counts + auto-adjust
```

---

## 5. Deliverables Checklist

```
- [ ] Add Stock, StockMovement, StockTransfer, StockTransferItem to schema
- [ ] Create migration
- [ ] Build stock overview page (table with outlet filter)
- [ ] Build stock adjustment form
- [ ] Build stock transfer flow (create → approve → receive)
- [ ] Build stock opname page
- [ ] Build low stock alert page
- [ ] Build movement history log
- [ ] Update nav sidebar
- [ ] Test: add stock, adjust, transfer, opname
- [ ] Commit
```
