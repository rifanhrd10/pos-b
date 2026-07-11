# Phase 9: Promo & Discount Management

**Goal:** Kelola promo, diskon otomatis, voucher code.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 5  
**Priority:** P1

---

## 1. Database Schema

```prisma
enum PromoType {
  PRODUCT_DISCOUNT      // diskon per produk
  TRANSACTION_DISCOUNT  // diskon per transaksi (min. subtotal)
  BUY_X_GET_Y           // beli X gratis Y
  VOUCHER               // kode voucher
}

model Promo {
  id            String    @id @default(cuid())
  businessId    String
  name          String
  description   String?
  type          PromoType
  
  // Discount config
  discountType  String          // "percentage" or "fixed"
  discountValue Float
  maxDiscount   Float?          // cap for percentage discounts
  minPurchase   Float?          // minimum subtotal
  
  // Scope
  productIds    String[]        // applicable products (empty = all)
  categoryIds   String[]        // applicable categories (empty = all)
  
  // Voucher
  voucherCode   String?  @unique
  maxUsage      Int?
  usedCount     Int      @default(0)
  
  // Schedule
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}
```

---

## 2. Pages & Routes

```
src/app/(dashboard)/
  promos/
    page.tsx              — Promo list (tabs: active/expired/upcoming)
    [id]/page.tsx         — Promo detail + usage stats
    new/page.tsx          — Buat promo baru
    [id]/edit/page.tsx    — Edit promo
```

---

## 3. Features

- CRUD promo (nama, type, diskon, schedule, scope)
- Promo types:
  - **Product discount:** diskon spesifik produk/kategori
  - **Transaction discount:** diskon jika subtotal >= minimum
  - **Voucher:** kode input manual di POS
- Auto-apply promo di POS (jika conditions met)
- Voucher code input di POS
- Promo schedule (start/end date, auto-activate/deactivate)
- Usage tracking (berapa kali dipakai)
- Promo report (efektivitas, total savings)

---

## 4. Server Actions

```typescript
// src/actions/promos.ts
getPromos(filters)           — List (active/expired/upcoming)
getPromo(id)                 — Detail + usage stats
createPromo(data)            — Create
updatePromo(id, data)        — Update
deletePromo(id)              — Delete
validateVoucher(code)        — Check voucher validity
applyVoucher(code, txId)     — Apply voucher to transaction
getApplicablePromos(items)   — Get auto-apply promos for cart items
```

---

## 5. Deliverables Checklist

```
- [ ] Add Promo model to schema
- [ ] Create migration
- [ ] Build promo list page (tabs: active/expired/upcoming)
- [ ] Build create promo form (type-specific fields)
- [ ] Build promo detail + usage stats
- [ ] Integrate auto-apply promo in POS
- [ ] Build voucher code input in POS
- [ ] Build promo report (usage, savings)
- [ ] Test: create promo → apply in POS → verify discount
- [ ] Commit
```
