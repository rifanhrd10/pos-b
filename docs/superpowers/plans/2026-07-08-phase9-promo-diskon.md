# Phase 9 — Promo & Diskon

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Estimated:** 4–5 days  
**Dependencies:** Phase 5 (POS Kasir — Order/OrderItem models)

---

## Tujuan

Membangun sistem promo & diskon yang mencakup:
1. **Voucher** — kode diskon (DISC10, PROMO50K) dengan persentase atau nominal
2. **Bundle** — beli X gratis Y (simple, per-produk)
3. **Happy Hour** — diskon di jam tertentu (kasir apply manual, bukan auto)

**Flow di POS:** Owner/admin buat & aktifkan promo di dashboard → kasir pilih dari daftar promo aktif di CartPanel saat checkout.

---

## Schema Baru

Tambahkan ke `prisma/schema.prisma` setelah blok SETTINGS:

```prisma
// ============================================================
// PROMO & DISKON
// ============================================================

enum PromoType {
  VOUCHER       // kode diskon
  BUNDLE        // beli X gratis Y
  HAPPY_HOUR    // diskon jam tertentu
}

enum DiscountType {
  PERCENTAGE    // persentase dari total
  NOMINAL       // potongan harga tetap
}

model Promo {
  id             String      @id @default(cuid())
  businessId     String
  name           String
  description    String?
  type           PromoType
  discountType   DiscountType @default(PERCENTAGE)
  discountValue  Float        // persentase (10) atau nominal (50000)
  
  // Voucher
  code           String?      // null untuk non-voucher
  
  // Limits
  minOrderAmount Float?       // minimal order untuk dapat promo
  maxDiscount    Float?       // cap maksimal diskon (untuk persentase)
  usageLimit     Int?         // max total penggunaan, null = unlimited
  usageLimitPerUser Int?      // per kasir (tidak dipakai di phase ini)
  usageCount     Int          @default(0)
  
  // Validity
  startDate      DateTime?
  endDate        DateTime?
  
  // Happy Hour
  startHour      Int?         // 0-23, null jika bukan happy hour
  endHour        Int?         // 0-23, null jika bukan happy hour
  
  // Status
  isActive       Boolean      @default(true)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  business Business         @relation(fields: [businessId], references: [id], onDelete: Cascade)
  bundleItems PromoBundle[]
  orderPromos OrderPromo[]

  @@unique([businessId, code])  // kode unik per bisnis
}

model PromoBundle {
  id         String  @id @default(cuid())
  promoId    String
  productId  String
  requiredQty Int    // beli berapa
  freeQty    Int     // gratis berapa

  promo   Promo   @relation(fields: [promoId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}

model OrderPromo {
  id             String   @id @default(cuid())
  orderId        String
  promoId        String
  discountAmount Float
  appliedAt      DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  promo Promo @relation(fields: [promoId], references: [id])

  @@unique([orderId, promoId])
}
```

Tambahkan back-relations di model yang ada:
- `Business`: tambah `promos Promo[]`
- `Product`: tambah `promoBundles PromoBundle[]`
- `Order`: tambah `promos OrderPromo[]`

---

## Dashboard Admin — Pages

### Route Structure

```
src/app/(dashboard)/promos/
  page.tsx              — list semua promo
  new/
    page.tsx            — form buat promo baru
  [id]/
    page.tsx            — detail promo (stats: usage, revenue impact)
    edit/
      page.tsx          — edit promo
```

### List Page (`/promos`)

Kolom tabel:
- Nama, Tipe badge (VOUCHER/BUNDLE/HAPPY HOUR), Kode (jika ada), Diskon, Periode, Usage, Status toggle, Actions

Filter: All / Aktif / Tidak Aktif / Expired

### Form Promo (`/promos/new` + `/promos/[id]/edit`)

Dynamic form berdasarkan tipe:

**Section 1 — Info Dasar:**
- Nama (required)
- Tipe: VOUCHER | BUNDLE | HAPPY_HOUR (radio/select)
- Deskripsi (optional)
- Status: Aktif / Non-aktif

**Section 2 — Diskon (muncul untuk VOUCHER + HAPPY_HOUR):**
- Tipe diskon: Persentase / Nominal (toggle)
- Nilai diskon: input angka
- Minimal order: optional
- Maks diskon: optional (hanya jika tipe = persentase)

**Section 3 — Kondisi (muncul sesuai tipe):**
- VOUCHER: Kode promo (auto-generate atau manual input)
- BUNDLE: Pilih produk, qty beli, qty gratis
- HAPPY_HOUR: Jam mulai - Jam selesai (00:00 - 23:00)

**Section 4 — Periode & Limit:**
- Tanggal mulai / selesai (optional)
- Batas penggunaan total (optional)

---

## POS Kasir — Promo Integration

### Update `CartPanel`

Tambahkan section "Promo" di antara item list dan totals:

```
[Promo] ─────────────────────────────
  [Pilih promo yang aktif... ▼]        ← dropdown list promo aktif
  Atau kode: [_________] [Terapkan]    ← input kode voucher
  ✓ DISC10 — Diskon 10% (-Rp 8.500)   ← promo applied (dismissible)
──────────────────────────────────────
```

Logic:
- Dropdown: list promo aktif yang eligible untuk order ini (cek minOrderAmount, periode, usageLimit)
- Input kode: cari promo by kode → validasi → apply
- Satu order bisa ada beberapa promo (tapi satu tipe per jenis — tidak bisa 2 voucher)
- Diskon ditampilkan di baris sendiri sebelum total

### Update `Order` Flow

1. Kasir pilih/input promo → call `applyPromo(orderId, promoId)`
2. Server action validasi: aktif, periode valid, usage limit, min order amount
3. Hitung `discountAmount` berdasarkan tipe diskon
4. Update `Order.discountAmount`
5. Create `OrderPromo` record
6. Recalculate total: `totalAmount = subtotal + taxAmount + serviceAmount - discountAmount`
7. Kasir bisa remove promo → call `removePromo(orderId, promoId)`

---

## Server Actions (`src/actions/promo.ts`)

```typescript
"use server";

// CRUD Promo (untuk dashboard admin)
export async function getPromos(businessId: string, options?: { isActive?: boolean; type?: PromoType }): Promise<Promo[]>
export async function getPromo(id: string): Promise<Promo & { bundleItems: PromoBundle[] } | null>
export async function createPromo(data: CreatePromoData): Promise<{ promo?: Promo; error?: string }>
export async function updatePromo(id: string, data: UpdatePromoData): Promise<{ ok: boolean; error?: string }>
export async function deletePromo(id: string): Promise<{ ok: boolean; error?: string }>
export async function togglePromoStatus(id: string): Promise<{ ok: boolean }>

// POS — Apply Promo
export async function getActivePromos(businessId: string, orderTotal: number): Promise<Promo[]>
// Returns: promos yang aktif + eligible (periode valid, usage < limit, minOrderAmount <= orderTotal)

export async function applyPromoByCode(orderId: string, code: string): Promise<{ ok: boolean; discountAmount?: number; error?: string }>
// Validates: kode ada, aktif, periode valid, usage limit, min order amount
// Creates OrderPromo record
// Updates Order.discountAmount + totalAmount

export async function applyPromoById(orderId: string, promoId: string): Promise<{ ok: boolean; discountAmount?: number; error?: string }>
// Same as above tapi by promoId

export async function removePromo(orderId: string, promoId: string): Promise<{ ok: boolean }>
// Deletes OrderPromo record
// Recalculates Order totals

// Helper: Calculate discount amount
function calculateDiscount(promo: Promo, orderSubtotal: number, orderItems: OrderItem[]): number
// PERCENTAGE: Math.min(subtotal * (value/100), maxDiscount ?? Infinity)
// NOMINAL: Math.min(value, subtotal)  // tidak bisa lebih dari subtotal
// BUNDLE: hitung free items berdasarkan bundleItems + orderItems qty
```

---

## Blocks Eksekusi

### Block A — Schema + Migration

1. Tambah `Promo`, `PromoBundle`, `OrderPromo` models ke `prisma/schema.prisma`
2. Tambah enums: `PromoType`, `DiscountType`
3. Tambah back-relations di `Business`, `Product`, `Order`
4. Run `npx prisma migrate dev --name phase9-promo-diskon`
5. Run `npx prisma generate`
6. Verifikasi: `npx tsc --noEmit`
7. Commit: `feat(schema): add promo system models`

### Block B — Server Actions (promo.ts)

1. Buat `src/actions/promo.ts`
2. Implement semua functions di atas
3. Helper `calculateDiscount()` private
4. Validasi ownership (businessId check)
5. Verifikasi: `npx tsc --noEmit`
6. Commit: `feat(actions): add promo server actions`

### Block C — Dashboard Pages

1. Buat `src/app/(dashboard)/promos/page.tsx` — list dengan filter
2. Buat `src/components/shared/promo-form.tsx` — dynamic form
3. Buat `src/app/(dashboard)/promos/new/page.tsx`
4. Buat `src/app/(dashboard)/promos/[id]/page.tsx` — detail + stats
5. Buat `src/app/(dashboard)/promos/[id]/edit/page.tsx`
6. Update `src/lib/nav.ts` — tambah Promo nav item
7. Verifikasi: `npx tsc --noEmit`
8. Commit: `feat(promos): add promo dashboard pages`

### Block D — POS Integration

1. Update `src/components/kasir/cart-panel.tsx`:
   - Add promo section (dropdown + kode input + applied promos list)
   - Show diskon line item di totals
2. Update `src/app/(kasir)/pos/pos-client.tsx`:
   - Fetch `getActivePromos()` saat load
   - Pass ke CartPanel
   - Handle `applyPromoById`, `applyPromoByCode`, `removePromo`
3. Update `src/app/(kasir)/pos/page.tsx`:
   - Fetch active promos untuk bisnis
4. Verifikasi: `npx tsc --noEmit`
5. Commit: `feat(kasir): integrate promo system into POS cart`

### Block E — Update Receipt + Cleanup

1. Update `src/components/kasir/receipt-modal.tsx`:
   - Tampilkan diskon yang diapply di receipt
   - Format: "Promo: DISC10 (-Rp 8.500)"
2. Run `npx tsc --noEmit` — 0 errors
3. Run final manual test checklist
4. Commit: `feat(receipt): show applied promos in receipt`

---

## Validasi Business Rules

### Voucher
- Kode case-insensitive (`DISC10` = `disc10`)
- Kode unik per bisnis
- Tidak bisa apply kode yang sama 2x ke 1 order
- Cek periode (startDate/endDate)
- Cek usageLimit (usageCount < usageLimit)
- Cek minOrderAmount

### Bundle
- Cek apakah produk yang di-bundle ada di order items
- Jika produk ada tapi qty kurang: tidak apply (tidak partial bundle)
- Free items tidak menambah OrderItem baru — hanya kurangi discountAmount

### Happy Hour
- Cek jam sekarang (`new Date().getHours()`) vs startHour/endHour
- Kasir masih harus manual pilih dari dropdown — tidak auto-apply
- Bisa di-apply di luar jam (sistem tidak block, kasir yang bertanggung jawab)

---

## UI Design Notes

### Promo Form (Dark dashboard style — sama dengan existing pages)

```
Tipe Promo:
  [○ Voucher]  [○ Bundle]  [○ Happy Hour]

─── Diskon ───────────────────────────────
  Tipe: [● Persentase] [○ Nominal]
  Nilai: [    10    ] %
  Minimal Order: Rp [________]
  Maks Diskon: Rp [________]  (hanya persentase)

─── Kondisi ──────────────────────────────
  [VOUCHER] Kode: [DISC10] [Generate otomatis]
  [BUNDLE]  Produk: [Pilih produk...▼]
            Beli: [2] item, Gratis: [1] item
  [HAPPY_HOUR] Jam: [09:00] s/d [12:00]

─── Periode ──────────────────────────────
  Mulai: [  08/07/2026  ]
  Selesai: [  31/07/2026 ]  (kosong = tanpa batas)
  Batas pakai: [________] (kosong = unlimited)
```

### CartPanel Promo Section

```
┌─ PROMO ──────────────────────────────────┐
│ [Pilih Promo ▼] [Kode: _____] [Pakai]   │
│                                           │
│ ✓ Happy Hour 20% (-Rp 17.000)      [×]  │
└───────────────────────────────────────────┘
Subtotal:      Rp  85.000
Diskon:       -Rp  17.000  ← green text
PPN (11%):     Rp   7.480  ← calculated on (subtotal - discount)
Total:         Rp  75.480
```

Note: PPN dihitung SETELAH diskon (lebih umum untuk F&B Indonesia).

---

## Dependencies

- No new npm packages
- `@/actions/promo.ts` — new file
- Updates ke: `schema.prisma`, `nav.ts`, `cart-panel.tsx`, `pos-client.tsx`, `pos/page.tsx`, `receipt-modal.tsx`

---

## Definition of Done

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Migration applied
- [ ] Dashboard: list, create, edit, toggle status, delete promo
- [ ] VOUCHER: kode valid → diskon applied di order
- [ ] BUNDLE: produk + qty sesuai → diskon applied
- [ ] HAPPY_HOUR: kasir bisa pilih dari dropdown → diskon applied
- [ ] CartPanel tampilkan diskon + total yang benar
- [ ] Multiple promo bisa di-apply (voucher + happy hour)
- [ ] Receipt menampilkan diskon yang diapply
- [ ] Promo usage count increment setelah order PAID
- [ ] Nav item "Promo" ada di sidebar
- [ ] Manual test semua tipe promo di POS
- [ ] Git commit per block
