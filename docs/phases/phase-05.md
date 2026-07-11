# Phase 5: POS Kasir (Transaction Interface)

**Goal:** Interface kasir full-screen untuk membuat transaksi, termasuk open bill.  
**Estimasi:** 5-7 hari  
**Dependencies:** Phase 3, Phase 4  
**Priority:** P0

---

## 1. Database Schema

```prisma
enum TransactionStatus {
  OPEN
  COMPLETED
  VOIDED
  REFUNDED
}

enum OrderType {
  DINE_IN
  TAKEAWAY
  DELIVERY
  ONLINE
}

enum PaymentMethod {
  CASH
  QRIS
  DEBIT
  CREDIT
  EWALLET
  TRANSFER
}

model Transaction {
  id            String            @id @default(cuid())
  businessId    String
  outletId      String
  employeeId    String
  customerId    String?
  
  orderNumber   String            // "TRX-YYYYMMDD-001"
  orderType     OrderType         @default(DINE_IN)
  tableNumber   String?
  customerName  String?
  note          String?
  
  subtotal      Float
  discountAmount Float     @default(0)
  discountType  String?
  discountValue Float?
  taxAmount     Float      @default(0)
  serviceAmount Float      @default(0)
  totalAmount   Float
  paidAmount    Float      @default(0)
  changeAmount  Float      @default(0)
  
  paymentMethod PaymentMethod?
  paymentRef    String?
  
  status        TransactionStatus @default(OPEN)
  paidAt        DateTime?
  voidedAt      DateTime?
  voidReason    String?
  voidedBy      String?
  
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  outlet        Outlet            @relation(fields: [outletId], references: [id])
  employee      Employee          @relation(fields: [employeeId], references: [id])
  customer      Customer?         @relation(fields: [customerId], references: [id])
  items         TransactionItem[]
  refund        Refund?
}

model TransactionItem {
  id              String   @id @default(cuid())
  transactionId   String
  productId       String
  variantId       String?
  name            String          // snapshot nama produk
  variantName     String?
  quantity        Int
  unitPrice       Float
  discount        Float    @default(0)
  subtotal        Float
  note            String?

  transaction     Transaction      @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  product         Product          @relation(fields: [productId], references: [id])
  variant         ProductVariant?  @relation(fields: [variantId], references: [id])
  toppings        TransactionItemTopping[]
}

model TransactionItemTopping {
  id                  String   @id @default(cuid())
  transactionItemId   String
  toppingId           String
  name                String
  price               Float

  transactionItem     TransactionItem @relation(fields: [transactionItemId], references: [id], onDelete: Cascade)
  topping             ProductTopping  @relation(fields: [toppingId], references: [id])
}

model Refund {
  id              String   @id @default(cuid())
  transactionId   String   @unique
  amount          Float
  reason          String
  method          PaymentMethod
  processedBy     String
  createdAt       DateTime @default(now())

  transaction     Transaction @relation(fields: [transactionId], references: [id])
}
```

---

## 2. POS Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: Outlet name | Kasir name | Date | Menu/Logout   │
├─────────────────────────┬───────────────────────────────┤
│                         │                               │
│   PRODUCT GRID          │   CART / ORDER SUMMARY        │
│                         │                               │
│   [Category tabs]       │   Customer: [search/input]    │
│                         │   Order type: [Dine/Take/etc] │
│   ┌─────┐ ┌─────┐      │   Table: [number]             │
│   │ Prod│ │ Prod│      │                               │
│   │  1  │ │  2  │      │   ┌─────────────────────────┐ │
│   └─────┘ └─────┘      │   │ Item 1    qty  subtotal │ │
│   ┌─────┐ ┌─────┐      │   │ Item 2    qty  subtotal │ │
│   │ Prod│ │ Prod│      │   │ Item 3    qty  subtotal │ │
│   │  3  │ │  4  │      │   └─────────────────────────┘ │
│   └─────┘ └─────┘      │                               │
│                         │   Subtotal:    Rp xxx.xxx     │
│   [Search bar]          │   Diskon:     -Rp xx.xxx     │
│                         │   Pajak:      +Rp xx.xxx     │
│                         │   Service:    +Rp xx.xxx     │
│                         │   ─────────────────────────── │
│                         │   TOTAL:      Rp xxx.xxx     │
│                         │                               │
│                         │   [Simpan Bill] [BAYAR]       │
└─────────────────────────┴───────────────────────────────┘
```

---

## 3. Pages & Routes

```
src/app/(pos)/
  layout.tsx              — Full-screen POS layout (no sidebar)
  page.tsx                — POS Kasir interface
  
src/app/(dashboard)/
  transactions/
    page.tsx              — Transaction history list
    [id]/page.tsx         — Transaction detail + receipt view
  open-bills/
    page.tsx              — Open bills list
```

---

## 4. Features

- Full-screen POS interface (separate layout, no sidebar)
- Product grid with category filter tabs
- Product search (real-time)
- Add to cart (click product → select variant → select toppings → add)
- Cart management (qty +/-, remove, note per item)
- Discount per item atau per transaksi (% or fixed)
- Auto-calculate: subtotal, tax, service charge, total
- Order type selection (Dine-in, Takeaway, Delivery)
- Table number (for dine-in)
- Customer search/assign
- Open bill (save as OPEN, revisit later)
- Void transaction (require PIN authorization)
- Receipt view
- Auto-decrement stock on completed transaction
- Generate order number (TRX-YYYYMMDD-NNN)

---

## 5. Server Actions

```typescript
// src/actions/transactions.ts
createTransaction(data)          — Create new transaction
updateTransaction(id, data)      — Update open bill
completeTransaction(id, payment) — Mark completed + process payment
voidTransaction(id, pin, reason) — Void (PIN required)
refundTransaction(id, data)      — Process refund

getTransactions(filters)         — List with filters
getTransaction(id)               — Detail
getOpenBills(outletId)           — Open bills for outlet

generateOrderNumber(outletId)    — Next order number
```

---

## 6. Deliverables Checklist

```
- [ ] Add Transaction, TransactionItem, TransactionItemTopping, Refund to schema
- [ ] Create migration
- [ ] Build POS layout (full-screen, no sidebar)
- [ ] Build product grid component with category tabs
- [ ] Build product search
- [ ] Build cart/order panel component
- [ ] Build variant + topping selector modal
- [ ] Build discount input (per-item & per-transaction)
- [ ] Build order type + table selector
- [ ] Build customer search/assign
- [ ] Build save as open bill (status = OPEN)
- [ ] Build open bills list page
- [ ] Build void transaction (PIN authorization)
- [ ] Build transaction history page (admin side)
- [ ] Build transaction detail + receipt view
- [ ] Auto-decrement stock on completed transaction
- [ ] Generate order number (TRX-YYYYMMDD-NNN)
- [ ] Test full POS flow
- [ ] Commit
```
