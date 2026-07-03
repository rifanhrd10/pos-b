# Phase 1: Auth + Onboarding + Business Setup

**Goal:** User bisa register, login, setup profil bisnis, dan buat outlet pertama.  
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
  - Logo upload (opsional, bisa skip)

Step 3: Buat Outlet Pertama (/onboarding/outlet)
  - Nama outlet (e.g. "Cabang Pusat")
  - Alamat outlet
  - Jam operasional (open/close time)

Step 4: Selesai → redirect ke /dashboard
```

---

## 4. Pages & Routes

```
src/app/
  (auth)/
    login/page.tsx             — Login form (email + password)
    register/page.tsx          — Register + auto-redirect ke onboarding
    forgot-password/page.tsx   — Request reset link
  (onboarding)/
    layout.tsx                 — Minimal layout (progress stepper, no sidebar)
    business/page.tsx          — Step 2: Setup bisnis
    outlet/page.tsx            — Step 3: Buat outlet pertama
    complete/page.tsx          — Step 4: Success + redirect
  (dashboard)/
    layout.tsx                 — Full layout dengan sidebar (requires auth)
    dashboard/page.tsx         — Dashboard (update dengan real data later)
```

---

## 5. Server Actions & API

```typescript
// src/actions/auth.ts
registerUser(data)       — Create user, hash password, auto-login
loginUser(data)          — Validate credentials

// src/actions/onboarding.ts
setupBusiness(data)      — Create business record
createFirstOutlet(data)  — Create outlet, mark onboarding complete

// src/actions/business.ts
getActiveBusiness()      — Get current user's active business
switchBusiness(id)       — Switch active business context
```

---

## 6. Middleware

```typescript
// middleware.ts
- Protected routes: /dashboard/*, /onboarding/*
- If not authenticated → redirect /login
- If authenticated but no business → redirect /onboarding/business
- If authenticated + business but no outlet → redirect /onboarding/outlet
```

---

## 7. UI Components

- **Reuse existing:** Input, Button, Select, Badge, Logo
- **New:** `StepIndicator` — progress dots for onboarding wizard
- **New:** `BusinessTypeSelector` — visual card picker for jenis usaha

---

## 8. Deliverables Checklist

```
- [ ] Install: next-auth@5, @auth/prisma-adapter, prisma, @prisma/client, bcryptjs, zod
- [ ] Setup Prisma schema (User, Account, Session, Business, Outlet)
- [ ] Run initial migration
- [ ] Configure NextAuth.js v5 with Credentials provider
- [ ] Create middleware for route protection
- [ ] Build register page (with Zod validation)
- [ ] Build login page (connect to NextAuth)
- [ ] Build onboarding wizard (3 steps)
- [ ] Update dashboard layout to use real session data
- [ ] Test full flow: register → onboarding → dashboard
- [ ] Commit
```
