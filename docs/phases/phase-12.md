# Phase 12: Shift & Kasir Closing

**Goal:** Shift management, opening/closing kasir, cash reconciliation.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 5, Phase 6  
**Priority:** P1

---

## 1. Database Schema

```prisma
model CashierShift {
  id            String   @id @default(cuid())
  outletId      String
  employeeId    String
  
  startTime     DateTime @default(now())
  endTime       DateTime?
  
  openingCash   Float           // cash di laci saat buka shift
  closingCash   Float?          // cash di laci saat tutup
  expectedCash  Float?          // calculated: opening + cash sales - cash refunds
  difference    Float?          // closing - expected (selisih)
  
  totalSales    Float    @default(0)
  totalTransactions Int  @default(0)
  totalRefunds  Float    @default(0)
  
  // Payment breakdown
  cashSales     Float    @default(0)
  qrisSales     Float    @default(0)
  otherSales    Float    @default(0)
  
  note          String?
  status        String   @default("open") // open, closed
  
  createdAt     DateTime @default(now())
}
```

---

## 2. Shift Flow

```
Kasir buka POS:
  → Check: ada shift open? 
    → Yes: lanjut POS
    → No: Open Shift modal
      → Input opening cash (uang di laci)
      → Start shift

Selama shift:
  → Semua transaksi di-track ke shift ini
  → Running total di header POS

Kasir tutup shift:
  → Close Shift modal
    → Input closing cash (hitung fisik uang di laci)
    → System calculate expected cash
    → Show selisih (surplus/deficit)
    → Input catatan (opsional)
    → Confirm close
    → Print shift report
```

---

## 3. Pages & Routes

```
src/app/(dashboard)/
  shifts/
    page.tsx              — Shift history (all employees)
    [id]/page.tsx         — Shift detail report

src/components/pos/
  open-shift-modal.tsx    — Open shift form
  close-shift-modal.tsx   — Close shift form + summary
  shift-indicator.tsx     — Shift status in POS header
```

---

## 4. Features

- Open shift: kasir input opening cash amount
- Require open shift before POS access
- Real-time shift stats in POS header (total sales, tx count)
- Close shift: input closing cash, auto-calculate expected vs actual
- Shift report: sales breakdown, payment methods, refunds, selisih
- Shift history per kasir (admin view)
- Manager approval for shift closing (optional)
- Print shift report

---

## 5. Server Actions

```typescript
// src/actions/shifts.ts
getActiveShift(employeeId, outletId)  — Check open shift
openShift(data)                        — Create new shift
closeShift(id, closingCash, note)      — Close + calculate
getShifts(filters)                     — History list
getShift(id)                           — Detail report
getShiftSummary(id)                    — Sales breakdown
```

---

## 6. Deliverables Checklist

```
- [ ] Add CashierShift model to schema
- [ ] Create migration
- [ ] Build open shift modal (input opening cash)
- [ ] Require open shift before POS access
- [ ] Track transactions to active shift
- [ ] Build shift indicator in POS header
- [ ] Build close shift flow (input closing + summary + selisih)
- [ ] Build shift report view (detail)
- [ ] Build shift history page (admin)
- [ ] Build print shift report
- [ ] Test: open shift → transactions → close → verify totals
- [ ] Commit
```
