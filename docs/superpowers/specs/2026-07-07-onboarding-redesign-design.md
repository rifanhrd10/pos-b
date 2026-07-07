# Onboarding Redesign — Enterprise-Grade Adaptive Wizard

**Date:** 2026-07-07  
**Status:** Draft  
**Approach:** Linear Wizard with Conditional Steps

---

## Problem Statement

Current onboarding (3 steps: Profil Bisnis → Outlet → Selesai) memiliki masalah:

1. **Forced outlet creation** — User dengan 1 toko saja dipaksa mengisi data outlet yang redundan dengan data bisnis
2. **Terlalu singkat** — Tidak ada setup plan, shift, atau pengaturan operasional
3. **Tidak enterprise-ready** — Tidak ada subscription management atau guided tour

---

## Solution: Adaptive Linear Wizard

5-step onboarding wizard yang **adaptive** — step tertentu di-skip atau disimplifikasi berdasarkan jawaban user.

### Flow Overview

```
Step 1: Profil Bisnis        /onboarding/business
Step 2: Pilih Plan           /onboarding/plan
Step 3: Setup Outlet         /onboarding/outlet      (conditional)
Step 4: Pengaturan Operasional /onboarding/operations
Step 5: Review & Selesai     /onboarding/complete
→ Dashboard + Tour Guide (tooltip, skippable)
```

### State Persistence

- Onboarding progress disimpan di database (`Business.onboardingStep`)
- User bisa close browser dan lanjut dari step terakhir
- Stepper sidebar (existing component) di-extend untuk 5 steps
- Step yang sudah selesai bisa di-klik untuk edit ulang

---

## Step Details

### Step 1 — Profil Bisnis (`/onboarding/business`)

| Field | Required | Notes |
|-------|----------|-------|
| Nama Bisnis | Ya | Min 2 chars |
| Tipe Bisnis | Ya | Enum: COFFEE_SHOP, RESTAURANT, VAPE_STORE, BARBERSHOP, RETAIL, FNB, LAUNDRY, OTHER |
| Phone | Tidak | |
| Alamat | Tidak | |
| Kota | Tidak | |
| Provinsi | Tidak | |
| NPWP | Tidak | Untuk kebutuhan enterprise/invoicing |
| Logo | Tidak | Image upload |

**Server Action:** `setupBusiness` (existing, extended with NPWP)  
**Side Effects:** Create 5 default roles + Employee record (existing behavior)

---

### Step 2 — Pilih Plan (`/onboarding/plan`)

**UI:** 3 pricing cards side-by-side (stack on mobile)

| | Starter | Pro | Enterprise |
|---|---|---|---|
| Harga | Gratis | Rp X/bulan | Rp Y/bulan |
| Outlet | 1 | Up to 10 | Unlimited |
| Karyawan | 5 | 50 | Unlimited |
| Shift | ❌ | ✅ | ✅ |
| Laporan | Basic | Lengkap | Custom + Export |
| Support | Community | Email | Priority + Dedicated |

**Behavior:**
- Badge "14 Hari Trial Pro Gratis" di atas halaman
- Semua user baru otomatis mendapat 14 hari Pro trial
- Plan yang dipilih = plan setelah trial habis
- Belum ada payment gateway di step ini (bayar sebelum trial habis, dihandle terpisah)
- Selecting a plan → create `Subscription` record dengan status "trial"

**Downgrade Policy (post-trial):**
- Data TIDAK pernah dihapus
- Akses dibatasi berdasarkan plan limits
- Outlet/karyawan di luar limit → "frozen" (tidak bisa diakses, tapi data tetap ada)
- Banner upgrade di dashboard: "Anda punya X outlet yang dinonaktifkan"

**Server Action:** `selectPlan`

---

### Step 3 — Setup Outlet (`/onboarding/outlet`)

**Conditional Flow:**

1. Pertanyaan: "Apakah bisnis Anda memiliki cabang/outlet terpisah?"

**Jawab "Tidak":**
- Auto-create 1 outlet dari data bisnis:
  - `outlet.name` = `business.name`
  - `outlet.address` = `business.address`
  - `outlet.city` = `business.city`
  - `outlet.phone` = `business.phone`
- Tampilkan konfirmasi singkat: "Outlet utama dibuat otomatis dari data bisnis Anda"
- Set `business.hasMultiOutlet = false`
- Auto-proceed ke step berikutnya (atau user klik Next)

**Jawab "Ya":**
- Form tambah outlet (repeatable):
  - Nama outlet (required)
  - Alamat (optional)
  - Kota (optional)
  - Phone (optional)
- Tombol "Tambah Outlet Lagi" untuk menambah form
- Minimal 1 outlet harus diisi
- Set `business.hasMultiOutlet = true`
- Validasi: jumlah outlet tidak boleh melebihi plan limit

**Server Action:** `createOutlets` (batch create)  
**Side Effects:** Create `EmployeeOutlet` record (assign owner ke semua outlet)

---

### Step 4 — Pengaturan Operasional (`/onboarding/operations`)

**Sub-section A: Jam Operasional**
- Jam Buka (time picker, default 08:00)
- Jam Tutup (time picker, default 22:00)
- Berlaku untuk semua outlet (bisa diubah per-outlet nanti di Settings)

**Sub-section B: Shift (Conditional)**

1. Pertanyaan: "Apakah bisnis Anda menggunakan sistem shift karyawan?"

**Jawab "Tidak":**
- Set `business.hasShift = false`
- Info: "Tutup kas dilakukan 1x per hari saat toko tutup"
- Skip shift form

**Jawab "Ya":**
- Set `business.hasShift = true`
- Default template pre-filled:
  - Shift Pagi: 08:00 - 15:00
  - Shift Sore: 15:00 - 22:00
- User bisa:
  - Edit nama shift
  - Edit jam mulai/selesai
  - Tambah shift baru
  - Hapus shift
- Info: "Tutup kas akan dilakukan di akhir setiap shift"
- Validasi: shift tidak boleh overlap, shift harus cover jam operasional

**Server Action:** `setupOperations`

---

### Step 5 — Review & Selesai (`/onboarding/complete`)

**UI:**
- Summary card — ringkasan semua data yang diisi:
  - Bisnis: nama, tipe
  - Plan: nama plan + "Trial Pro 14 hari"
  - Outlet: jumlah & nama
  - Operasional: jam buka/tutup + shift (jika ada)
- Tombol utama: "Mulai Gunakan Bayaro"
- Tombol sekunder: "Isi Data Demo" (existing seed demo feature)
- Set `business.onboardingDone = true`

**Server Action:** `completeOnboarding`

---

## Tour Guide (Post-Onboarding)

### Library
[driver.js](https://driverjs.com/) — lightweight (~5KB), zero dependency, highly customizable.

### Trigger
- Auto-start saat user pertama kali masuk dashboard (setelah onboarding selesai)
- Flag: `User.hasCompletedTour`

### Tour Steps
1. "Ini dashboard utama Anda — lihat ringkasan penjualan di sini" (highlight: dashboard cards)
2. "Menu Produk — tambah menu/produk yang Anda jual" (highlight: sidebar menu "Produk")
3. "Kasir — mulai transaksi penjualan di sini" (highlight: sidebar menu "Kasir")
4. "Laporan — pantau performa bisnis Anda" (highlight: sidebar menu "Laporan")
5. "Pengaturan — atur karyawan, outlet, dan preferensi lainnya" (highlight: sidebar menu "Pengaturan")

### Controls
- Tombol "Selanjutnya" untuk next step
- Tombol "Lewati Tour" untuk skip seluruh tour
- Tour bisa diakses ulang dari menu Help atau Settings

### State
- `hasCompletedTour = true` setelah tour selesai atau di-skip
- Stored di database (User model), bukan localStorage (agar konsisten cross-device)

---

## Data Model Changes

### New Models

```prisma
model Plan {
  id            String         @id @default(cuid())
  name          String         @unique // "starter" | "pro" | "enterprise"
  displayName   String         // "Starter" | "Pro" | "Enterprise"
  maxOutlets    Int            // 1 | 10 | -1 (unlimited)
  maxEmployees  Int            // 5 | 50 | -1 (unlimited)
  features      String[]       // ["shift", "advanced_reports", "export", "api"]
  price         Int            // Rupiah, 0 for starter
  subscriptions Subscription[]
  createdAt     DateTime       @default(now())
}

model Subscription {
  id               String   @id @default(cuid())
  businessId       String   @unique
  business         Business @relation(fields: [businessId], references: [id])
  planId           String
  plan             Plan     @relation(fields: [planId], references: [id])
  status           String   // "trial" | "active" | "expired" | "cancelled"
  trialEndsAt      DateTime?
  currentPeriodEnd DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Shift {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  name       String   // "Shift Pagi"
  startTime  String   // "08:00" (HH:mm format)
  endTime    String   // "15:00" (HH:mm format)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Modified Models

```prisma
model Business {
  // ... existing fields ...
  npwp            String?
  openTime        String?        @default("08:00")
  closeTime       String?        @default("22:00")
  hasMultiOutlet  Boolean        @default(false)
  hasShift        Boolean        @default(false)
  onboardingStep  Int            @default(1)
  onboardingDone  Boolean        @default(false)
  // New relations
  subscription    Subscription?
  shifts          Shift[]
}

model User {
  // ... existing fields ...
  hasCompletedTour Boolean @default(false)
}
```

---

## Middleware Logic (Updated)

```typescript
// Pseudocode
if (!authenticated) redirect("/login")

if (authenticated && !business) redirect("/onboarding/business")

if (authenticated && business && !business.onboardingDone) {
  // Map step number to route
  const stepRoutes = {
    1: "/onboarding/business",
    2: "/onboarding/plan",
    3: "/onboarding/outlet",
    4: "/onboarding/operations",
    5: "/onboarding/complete",
  }
  redirect(stepRoutes[business.onboardingStep])
}

if (authenticated && business && business.onboardingDone) {
  // Allow dashboard access
}
```

---

## Server Actions Summary

| Action | Step | Input | Side Effects |
|--------|------|-------|--------------|
| `setupBusiness` | 1 | FormData (bisnis) | Create business + 5 roles + owner employee |
| `selectPlan` | 2 | planId | Create Subscription (status: trial, trialEndsAt: +14d) |
| `createOutlets` | 3 | outlets[] atau auto | Create outlet(s) + EmployeeOutlet |
| `setupOperations` | 4 | openTime, closeTime, shifts[] | Update Business + create Shifts |
| `completeOnboarding` | 5 | — | Set onboardingDone = true |

---

## Validation Schemas (Zod)

```typescript
// Step 2
const planSelectionSchema = z.object({
  planId: z.string().min(1),
})

// Step 3
const outletSetupSchema = z.object({
  hasMultiOutlet: z.boolean(),
  outlets: z.array(z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
  })).min(1).optional(), // only required if hasMultiOutlet = true
})

// Step 4
const operationsSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  hasShift: z.boolean(),
  shifts: z.array(z.object({
    name: z.string().min(1),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(), // only required if hasShift = true
})
```

---

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `OnboardingStepper` | `src/components/shared/` | Extended to 5 steps, dynamic show/hide |
| `PricingCards` | `src/components/onboarding/` | Plan comparison cards |
| `OutletForm` | `src/components/onboarding/` | Repeatable outlet form |
| `ShiftForm` | `src/components/onboarding/` | Shift definition form |
| `OnboardingSummary` | `src/components/onboarding/` | Review summary di step 5 |
| `TourGuide` | `src/components/shared/` | driver.js wrapper |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `driver.js` | ^1.3 | Tour guide tooltip |
| (existing) `zod` | — | Validation |
| (existing) `prisma` | — | Database |

---

## Out of Scope (for now)

- Payment gateway integration (Midtrans/Xendit) — handled separately
- Email notification for trial expiry
- Plan upgrade/downgrade flow in settings
- Per-outlet jam operasional customization
- Shift assignment to specific employees

These will be implemented in subsequent phases.
