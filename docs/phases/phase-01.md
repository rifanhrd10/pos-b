# Phase 1: Auth + Onboarding + Business Setup

**Goal:** User bisa register, login, setup profil bisnis lengkap (5-step adaptive wizard), dan masuk ke dashboard dengan tour guide.  
**Estimasi:** 3-5 hari  
**Dependencies:** None (phase pertama)  
**Priority:** P0

---

## 1. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === AUTH ===

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // bcrypt hashed
  phone         String?
  avatar        String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  businesses    Business[]
  employees     Employee[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// === BUSINESS & OUTLET ===

enum BusinessType {
  COFFEE_SHOP
  RESTAURANT
  VAPE_STORE
  BARBERSHOP
  RETAIL
  FNB
  LAUNDRY
  OTHER
}

model Business {
  id          String       @id @default(cuid())
  ownerId     String
  name        String
  type        BusinessType
  logo        String?
  phone       String?
  email       String?
  address     String?
  city        String?
  province    String?
  taxRate     Float        @default(0)
  serviceRate Float        @default(0)
  currency    String       @default("IDR")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  owner       User         @relation(fields: [ownerId], references: [id])
  outlets     Outlet[]
  employees   Employee[]
  roles       Role[]
  categories  Category[]
  products    Product[]
  customers   Customer[]
  promos      Promo[]
}

model Outlet {
  id           String   @id @default(cuid())
  businessId   String
  name         String
  address      String?
  city         String?
  phone        String?
  isActive     Boolean  @default(true)
  openTime     String?  // "08:00"
  closeTime    String?  // "22:00"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  business     Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  employees    Employee[]
  transactions Transaction[]
  stockEntries Stock[]
}
```

---

## 2. Auth Configuration (NextAuth.js v5)

```
src/
  lib/
    auth.ts           — NextAuth config (Credentials + Google provider)
    auth-options.ts   — Provider config, callbacks, session strategy
    prisma.ts         — Prisma client singleton
  app/
    api/auth/[...nextauth]/route.ts  — NextAuth handler
```

**Auth features:**
- Email + Password (Credentials provider, bcrypt)
- Google OAuth (optional, bisa skip dulu)
- Session strategy: JWT
- Session includes: userId, email, name, activeBusinessId, activeOutletId, role

---

## 3. Onboarding Wizard Flow

> **⚠️ Updated — v2 (2026-07-07):** Onboarding telah diubah menjadi 5-step adaptive wizard. Lihat spec lengkap di `docs/superpowers/specs/2026-07-07-onboarding-redesign-design.md` dan implementation plan di `docs/superpowers/plans/2026-07-07-onboarding-redesign.md`.

```
Step 1: Register (/register)
  - Nama lengkap, email, password, konfirmasi password
  - Auto-login setelah register

Step 2: Setup Bisnis (/onboarding/business)
  - Nama bisnis
  - Jenis usaha (dropdown: Coffee Shop, Restaurant, Vape Store, 
    Barbershop, Retail, F&B, Laundry, Other)
  - Nomor telepon bisnis
  - Alamat (opsional)
  - NPWP (opsional, untuk invoicing)
  - Logo upload (opsional, bisa skip)

Step 3: Pilih Plan (/onboarding/plan)  [NEW]
  - Pilih tier: Starter (gratis) / Pro / Enterprise
  - Semua akun baru: 14 hari trial Pro otomatis
  - Plan yang dipilih = plan setelah trial habis
  - Data tidak dihapus saat downgrade — akses dibatasi (frozen)

Step 4: Setup Outlet (/onboarding/outlet)  [REDESIGNED]
  - Tanya dulu: "Punya cabang / lebih dari 1 lokasi?"
  - Tidak → outlet auto-create dari data bisnis (nama + alamat bisnis)
  - Ya → form tambah outlet (repeatable, nama + alamat + kota + phone)

Step 5: Pengaturan Operasional (/onboarding/operations)  [NEW]
  - Jam buka & jam tutup (berlaku semua outlet)
  - Tanya: "Pakai sistem shift karyawan?"
  - Tidak → tutup kas 1x/hari
  - Ya → define shifts (nama + jam mulai/selesai), default: Pagi & Sore

Step 6: Selesai (/onboarding/complete)  [REDESIGNED]
  - Summary card: bisnis, plan, outlet, operasional
  - Tombol "Mulai Gunakan Bayaro" → set onboardingDone = true → /dashboard
  - Tombol opsional: "Isi data contoh" (seed demo data)

Post-Onboarding: Tour Guide  [NEW]
  - Auto-start sekali saat pertama masuk dashboard
  - Tooltip highlight: Dashboard → Produk → Kasir → Laporan → Pengaturan
  - Bisa di-skip kapan saja
  - Diimplementasi dengan driver.js
```

### Onboarding Progress Tracking

- `Business.onboardingStep` (Int, default 1) — step terakhir yang dicapai
- `Business.onboardingDone` (Boolean, default false) — sudah selesai onboarding
- Middleware redirect ke step yang tepat berdasarkan session claims
- User bisa tutup browser dan lanjut dari step terakhir

---

## 4. Pages & Routes

```
src/app/
  (auth)/
    login/page.tsx             — Login form (email + password)
    register/page.tsx          — Register + auto-redirect ke onboarding
    forgot-password/page.tsx   — Request reset link
  onboarding/
    layout.tsx                 — Sidebar stepper 5 steps (dark theme)
    business/page.tsx          — Step 1: Setup bisnis + NPWP field
    plan/page.tsx              — Step 2: Pricing cards (Starter/Pro/Enterprise) [NEW]
    outlet/page.tsx            — Step 3: Conditional single/multi-outlet [REDESIGNED]
    operations/page.tsx        — Step 4: Jam operasional + shift setup [NEW]
    complete/page.tsx          — Step 5: Summary card + redirect [REDESIGNED]
  (dashboard)/
    layout.tsx                 — Full layout dengan sidebar + TourGuide [MODIFIED]
    dashboard/page.tsx         — Dashboard (update dengan real data later)
  api/
    plans/route.ts             — GET /api/plans — fetch plan list [NEW]
    onboarding/summary/route.ts — GET /api/onboarding/summary [NEW]
```

---

## 5. Server Actions & API

```typescript
// src/actions/auth.ts
registerUser(data)          — Create user, hash password, auto-login
loginUser(data)             — Validate credentials

// src/actions/onboarding.ts  [UPDATED v2]
setupBusiness(data)         — Create/update business, 5 default roles, owner employee
selectPlan(data)            — Create Subscription (trial, 14 hari), advance step 3  [NEW]
createOutlets(data)         — Conditional: auto-create atau batch create outlets     [NEW]
setupOperations(data)       — Save jam operasional + shifts                          [NEW]
completeOnboarding()        — Set onboardingDone=true                                [NEW]
seedDemoData()              — Seed demo karyawan + outlet kedua (opsional)

// src/actions/tour.ts  [NEW]
markTourComplete()          — Set User.hasCompletedTour = true

// src/actions/business.ts
getActiveBusiness()         — Get current user's active business
switchBusiness(id)          — Switch active business context
```

---

## 6. Middleware

```typescript
// middleware.ts  [UPDATED v2]
- Protected routes: /dashboard/*, /onboarding/*
- If not authenticated → redirect /login
- If authenticated && onboardingDone=false && accessing /dashboard → redirect ke step saat ini
- If authenticated && onboardingDone=true && accessing /onboarding → redirect /dashboard
- Step routing via session claims: onboardingStep 1-5 → /onboarding/{route}
```

---

## 7. UI Components

- **Reuse existing:** Input, Button, Select, Badge, Logo
- **New:** `StepIndicator` — progress dots for onboarding wizard (extended to 5 steps)
- **New:** `BusinessTypeSelector` — visual card picker for jenis usaha
- **New:** `PricingCards` — plan comparison cards di step 2 [NEW]
- **New:** `OutletFormRepeatable` — form outlet yang bisa ditambah [NEW]
- **New:** `ShiftFormRepeatable` — form shift definition [NEW]
- **New:** `OnboardingSummary` — summary card di step 5 [NEW]
- **New:** `TourGuide` — driver.js wrapper, auto-start post-onboarding [NEW]

---

## 8. Deliverables Checklist

```
Core Auth (unchanged):
- [ ] Install: next-auth@5, @auth/prisma-adapter, prisma, @prisma/client, bcryptjs, zod
- [ ] Setup Prisma schema (User, Account, Session, Business, Outlet)
- [ ] Run initial migration
- [ ] Configure NextAuth.js v5 with Credentials provider
- [ ] Create middleware for route protection
- [ ] Build register page (with Zod validation)
- [ ] Build login page (connect to NextAuth)
- [ ] Update dashboard layout to use real session data

Onboarding v2 (updated):
- [ ] Install: driver.js, tsx
- [ ] Prisma migration: Plan, Subscription, Shift; update Business + User
- [ ] Seed 3 default plans (Starter/Pro/Enterprise)
- [ ] Extend session JWT with onboardingStep, onboardingDone, hasCompletedTour
- [ ] Update middleware: 5-step routing via session claims
- [ ] Extend onboarding stepper to 5 steps
- [ ] Step 1 (business): tambah NPWP field, redirect ke /plan
- [ ] Step 2 (plan): pricing cards, selectPlan action
- [ ] Step 3 (outlet): conditional single/multi-outlet flow
- [ ] Step 4 (operations): jam operasional + conditional shift setup
- [ ] Step 5 (complete): summary card + completeOnboarding action
- [ ] Tour guide: driver.js wrapper, auto-start, skippable
- [ ] API routes: /api/plans, /api/onboarding/summary
- [ ] Test full flow: register → 5-step onboarding → dashboard → tour guide
- [ ] Commit
```
