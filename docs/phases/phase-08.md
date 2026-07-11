# Phase 8: Customer & CRM

**Goal:** Database pelanggan, tracking pembelian, customer assignment di POS.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 5  
**Priority:** P1

---

## 1. Database Schema

```prisma
model Customer {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  phone       String?
  email       String?
  address     String?
  note        String?
  totalVisits Int      @default(0)
  totalSpent  Float    @default(0)
  lastVisit   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business     Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@unique([businessId, phone])
}
```

---

## 2. Pages & Routes

```
src/app/(dashboard)/
  customers/
    page.tsx              — Customer list (search, sort by visits/spent)
    [id]/page.tsx         — Customer detail + transaction history
    new/page.tsx          — Tambah customer
```

---

## 3. Features

- CRUD customer (nama, phone, email, alamat, catatan)
- Customer search di POS (assign ke transaksi)
- Auto-update stats: total visits, total spent, last visit
- Customer transaction history
- Top customers leaderboard
- Export customer list (CSV/Excel)

---

## 4. Server Actions

```typescript
// src/actions/customers.ts
getCustomers(filters)        — List + search + sort + pagination
getCustomer(id)              — Detail + transaction history
createCustomer(data)         — Create
updateCustomer(id, data)     — Update
searchCustomers(query)       — Quick search for POS (by name/phone)
getTopCustomers(limit)       — Top by totalSpent
```

---

## 5. Deliverables Checklist

```
- [ ] Add Customer model to schema
- [ ] Create migration
- [ ] Build customer list page (search + sort)
- [ ] Build customer detail page (with transaction history)
- [ ] Build add/edit customer form
- [ ] Integrate customer search in POS
- [ ] Auto-update customer stats on transaction completion
- [ ] Build top customers view
- [ ] Export customer list
- [ ] Commit
```
