# Kasir Flow Baru + Phase 12 + README — Implementation Plan

**Date:** 2026-07-09  
**Branch:** pos-b-v2  
**Base commit:** cc76d9d  

---

## Context: Situasi Sekarang

Flow kasir saat ini (`/kasir/pin`, `/kasir/outlet`) **sudah require `auth()` session** — artinya kasir harus login via email+password dulu baru bisa masuk POS. Ini yang mau diubah.

`CashierSession` sudah ada dari Phase 5 dengan field: `initialCash`, `closingCash`, `isOpen`, dll. Perlu tambah `expectedCash` + `difference` untuk Phase 12.

---

## Scope

### Part 1: Kasir Flow Baru (tanpa email/password)
### Part 2: Phase 12 Enhancement (shift closing + selisih)
### Part 3: README.md lengkap

---

## Part 1: Kasir Flow Baru

### Flow yang diinginkan

```
Halaman Login
├── Form email + password → Dashboard       [Owner/Admin/Manager]
└── Button "Masuk sebagai Kasir"
    └── /kasir/public/outlets  — pilih outlet (semua outlet aktif, publik)
        └── Input PIN karyawan
            └── Session dibuat → masuk POS
```

### Arsitektur Autentikasi Kasir

**Problem:** Next.js App Router dengan NextAuth v5 — semua route `/kasir/*` saat ini require session. Untuk flow tanpa password, kita butuh endpoint publik yang:
1. Tidak require NextAuth session
2. Validate PIN → buat "kasir session" di cookie
3. Kasir session berbeda dari NextAuth session

**Solusi:** Buat route group baru `(kasir-public)` yang tidak wrap dengan auth guard. Session kasir disimpan sebagai signed cookie terpisah (sudah ada `outlet-context.ts` sebagai fondasi).

### Files yang Perlu Dibuat/Diubah

#### A. Login Page Update
- `src/app/(auth)/login/page.tsx` — tambah button "Masuk sebagai Kasir" yang link ke `/kasir/enter`

#### B. Public Kasir Entry Routes (BARU, tanpa auth)
```
src/app/(kasir-public)/
  layout.tsx              — layout tanpa auth check
  kasir/
    enter/
      page.tsx            — redirect ke /kasir/enter/outlets
    enter/outlets/
      page.tsx            — server: fetch semua outlet aktif (semua bisnis? atau by subdomain?)
      outlet-list.tsx     — client: pilih outlet → redirect ke /kasir/enter/pin?outletId=xxx
    enter/pin/
      page.tsx            — server: terima outletId query param
      pin-entry.tsx       — client: input PIN → call server action verifyKasirPin
```

**Catatan penting:** Flow publik ini perlu tahu bisnis mana. Solusi:
- Saat pilih outlet, fetch semua outlet dari semua bisnis (multi-tenant) → terlalu lebar
- **Better:** URL bawa businessId atau outletId → kasir pilih outlet dari list yang di-load by outletId

**Approach yang dipilih:** Outlet list page load semua outlet aktif dari DB (atau by subdomain), kasir pilih, lalu input PIN employee yang assigned ke outlet itu.

#### C. Server Action: verifyKasirPin (publik)
```typescript
// src/actions/kasir-public.ts
export async function verifyKasirPinPublic(outletId: string, pin: string)
// 1. Find employees assigned to outletId
// 2. Check PIN match (bcrypt compare)
// 3. If match: set cookie kasirEmployeeId + kasirOutletId + kasirBusinessId
// 4. Return { ok: true } atau { error: string }
```

#### D. Middleware Update
- `middleware.ts` — pastikan `/kasir/enter/*` tidak di-protect oleh auth check
- `/kasir/pos` tetap check kasir cookie (bukan NextAuth session)

#### E. POS Route Update
- `src/app/(kasir)/pos/page.tsx` atau layout — ganti auth check dari NextAuth session ke kasir cookie

### Flow Auth Dua Mode

```
Mode A (Dashboard): NextAuth session → session.user.id → employee lookup
Mode B (POS Publik): Kasir cookie → kasirEmployeeId + kasirOutletId (langsung, no NextAuth)
```

---

## Part 2: Phase 12 — Shift Enhancement

### Schema Changes (minimal)
Tambah 2 field ke `CashierSession`:
```prisma
expectedCash Float?   // opening + cashSales selama shift
difference   Float?   // closingCash - expectedCash
```

### Logic Update: closeSession()
Di `src/actions/kasir.ts` fungsi `closeSession()`:
```typescript
// Hitung expectedCash:
// 1. Ambil semua PAID orders di session ini
// 2. cashSales = sum of payments dengan method CASH
// 3. expectedCash = initialCash + cashSales
// 4. difference = closingCash - expectedCash
```

### UI Update: ShiftModal (close mode)
Di `src/components/kasir/shift-modal.tsx` — tambah summary sebelum confirm:
```
┌─────────────────────────────────┐
│ Ringkasan Shift                 │
│                                 │
│ Kas Awal:        Rp 500.000     │
│ Penjualan Cash:  Rp 2.300.000   │
│ Expected di Laci: Rp 2.800.000  │
│                                 │
│ Kamu input:      Rp 2.750.000   │
│ Selisih:         -Rp 50.000 🔴  │
│ (atau +Rp xx.xxx 🟢)            │
└─────────────────────────────────┘
```

### Dashboard Pages (admin view)
- `src/app/(dashboard)/shifts/page.tsx` — history semua shift, filter by employee/outlet/date
- `src/app/(dashboard)/shifts/[id]/page.tsx` — detail report per shift

### Nav Update
Tambah "Shift" di nav section Laporan atau section baru "Operasional"

---

## Part 3: README.md

Full project README mencakup:
1. Project overview (Bayaro POS SaaS)
2. Tech stack
3. Features per phase
4. Setup local (clone, env, migrate, seed)
5. Demo accounts (admin/manager/kasir)
6. Project structure
7. Phase roadmap (done vs pending)
8. Contributing

---

## Execution Blocks

| Block | Scope | Dependencies |
|-------|-------|-------------|
| A | Schema: add expectedCash + difference to CashierSession | none |
| B | closeSession() logic: calculate expectedCash + difference | A |
| C | ShiftModal update: show selisih summary on close | B |
| D | Dashboard shifts pages + nav | B |
| E | Kasir flow baru: login page button + public routes + verifyKasirPin | none (parallel with A-D) |
| F | Middleware update: protect POS via kasir cookie, not NextAuth | E |
| G | README.md | all done |

Blocks A-D dan E-F bisa parallel. G terakhir.

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Multi-tenant: outlet list publik expose semua bisnis | Tampilkan nama outlet + bisnis, kasir pilih yang sesuai |
| Cookie kasir bisa di-forge | Sign cookie dengan secret (sudah ada di outlet-context.ts) |
| NextAuth session vs kasir cookie conflict | POS route cek kasir cookie FIRST, fallback ke NextAuth session |
| Kasir yang punya akun user bisa masuk lewat kedua flow | Acceptable — dua path berbeda tapi tidak konflik |

---

## Commit Plan

```
feat(schema): add expectedCash + difference to CashierSession - Phase 12
feat(actions): update closeSession to calculate expected cash and difference
feat(pos): update ShiftModal to show cash reconciliation summary on close
feat(dashboard): add shifts history and detail pages
feat(kasir): add public kasir entry flow - outlet select + PIN without login
feat(middleware): update auth to support kasir cookie session
feat(auth): add Masuk sebagai Kasir button to login page
docs: add full project README.md
```
