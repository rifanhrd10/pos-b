# Onboarding Redesign — Enterprise Adaptive Wizard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah onboarding 3-step yang kaku menjadi 5-step adaptive wizard enterprise-grade, dengan subscription plan selection, conditional outlet & shift setup, dan post-onboarding tour guide.

**Architecture:** Linear wizard dengan session-based progress tracking (`onboardingStep` di Business model + JWT session claims). Setiap step menyimpan progress ke DB sebelum redirect. Middleware membaca session claims untuk routing. Tour guide menggunakan driver.js, dipicu sekali saat pertama masuk dashboard.

**Tech Stack:** Next.js 15 App Router, NextAuth v5, Prisma/PostgreSQL, Zod, Tailwind CSS, shadcn/ui, driver.js (baru)

## Global Constraints

- Semua server actions gunakan `"use server"` directive
- Validasi selalu lewat Zod sebelum menyentuh DB
- Error response selalu `{ error: string }`, success selalu `{ success: true }`
- String waktu format `"HH:mm"` (contoh: `"08:00"`)
- Semua harga dalam Rupiah (integer, no decimal)
- `maxOutlets: -1` dan `maxEmployees: -1` berarti unlimited
- Jangan hapus data saat downgrade — akses dibatasi bukan data dihapus
- Ikuti pola existing: `prisma.ts` singleton, `auth()` dari `@/lib/auth`
- Commit setiap task selesai

---

## File Map

```
prisma/
  schema.prisma              — MODIFY: tambah Plan, Subscription, Shift; update Business, User
  seed.ts                    — CREATE: seed 3 default plans
src/
  lib/
    auth.ts                  — MODIFY: extend session type + JWT callback untuk onboardingStep/Done
    validations.ts           — MODIFY: tambah planSelectionSchema, multiOutletSchema, operationsSchema, shiftSchema
  actions/
    onboarding.ts            — MODIFY: update setupBusiness; tambah selectPlan, createOutlets, setupOperations, completeOnboarding
  middleware.ts              — MODIFY: tambah onboarding routing berdasarkan session claims
  app/
    onboarding/
      layout.tsx             — MODIFY: stepper 3 step → 5 step
      business/page.tsx      — MODIFY: tambah field NPWP
      plan/page.tsx          — CREATE: pricing cards + plan selection
      outlet/page.tsx        — MODIFY: redesign dengan conditional "punya cabang?" flow
      operations/page.tsx    — CREATE: jam operasional + conditional shift setup
      complete/page.tsx      — MODIFY: redesign dengan summary card
    (dashboard)/
      layout.tsx             — MODIFY: tambah TourGuide component
  components/
    shared/
      tour-guide.tsx         — CREATE: driver.js wrapper component
```

---

## Task 1: Database Schema — New Models & Field Extensions

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

**Interfaces:**
- Produces: `Plan`, `Subscription`, `Shift` Prisma models; `Business.onboardingStep`, `Business.onboardingDone`, `Business.hasMultiOutlet`, `Business.hasShift`, `Business.openTime`, `Business.closeTime`, `Business.npwp`; `User.hasCompletedTour`

- [ ] **Step 1: Backup schema dan buka file**

```bash
cp prisma/schema.prisma prisma/schema.prisma.bak
```

- [ ] **Step 2: Tambah models baru dan update models existing di `prisma/schema.prisma`**

Tambahkan di bagian bawah file, setelah model `EmployeeOutlet`:

```prisma
// === SUBSCRIPTION & PLAN ===

model Plan {
  id            String         @id @default(cuid())
  name          String         @unique // "starter" | "pro" | "enterprise"
  displayName   String         // "Starter" | "Pro" | "Enterprise"
  maxOutlets    Int            // 1 | 10 | -1 (unlimited)
  maxEmployees  Int            // 5 | 50 | -1 (unlimited)
  features      String[]       // ["shift", "advanced_reports", "export", "api"]
  price         Int            // Rupiah per bulan, 0 for starter
  subscriptions Subscription[]
  createdAt     DateTime       @default(now())
}

model Subscription {
  id               String    @id @default(cuid())
  businessId       String    @unique
  business         Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  planId           String
  plan             Plan      @relation(fields: [planId], references: [id])
  status           String    // "trial" | "active" | "expired" | "cancelled"
  trialEndsAt      DateTime?
  currentPeriodEnd DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

// === SHIFT ===

model Shift {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name       String   // "Shift Pagi"
  startTime  String   // "08:00"
  endTime    String   // "15:00"
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

Update model `Business` — tambahkan fields baru dan relasi baru:

```prisma
model Business {
  id             String       @id @default(cuid())
  ownerId        String
  name           String
  type           BusinessType
  logo           String?
  phone          String?
  email          String?
  address        String?
  city           String?
  province       String?
  npwp           String?
  taxRate        Float        @default(0)
  serviceRate    Float        @default(0)
  currency       String       @default("IDR")
  // Operational
  openTime       String?      @default("08:00")
  closeTime      String?      @default("22:00")
  hasMultiOutlet Boolean      @default(false)
  hasShift       Boolean      @default(false)
  // Onboarding tracking
  onboardingStep Int          @default(1)
  onboardingDone Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  owner        User          @relation(fields: [ownerId], references: [id])
  outlets      Outlet[]
  employees    Employee[]
  roles        Role[]
  categories   Category[]
  products     Product[]
  customers    Customer[]
  promos       Promo[]
  subscription Subscription?
  shifts       Shift[]
}
```

Update model `User` — tambahkan field `hasCompletedTour`:

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String
  password         String
  phone            String?
  avatar           String?
  emailVerified    DateTime?
  hasCompletedTour Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  accounts   Account[]
  sessions   Session[]
  businesses Business[]
  employees  Employee[]
}
```

- [ ] **Step 3: Buat migration**

```bash
npx prisma migrate dev --name add_plan_subscription_shift_onboarding_fields
```

Expected output: Migration created dan applied. Kalau ada prompt, ketik `y`.

- [ ] **Step 4: Buat `prisma/seed.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert plans (idempotent)
  const plans = [
    {
      name: "starter",
      displayName: "Starter",
      maxOutlets: 1,
      maxEmployees: 5,
      features: ["basic_reports"],
      price: 0,
    },
    {
      name: "pro",
      displayName: "Pro",
      maxOutlets: 10,
      maxEmployees: 50,
      features: ["shift", "advanced_reports", "export"],
      price: 199000,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      maxOutlets: -1,
      maxEmployees: -1,
      features: ["shift", "advanced_reports", "export", "api", "priority_support"],
      price: 599000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`✓ Plan "${plan.displayName}" seeded`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 5: Tambahkan seed script ke `package.json`**

Cari bagian `"scripts"` di `package.json`, tambahkan:

```json
"db:seed": "tsx prisma/seed.ts"
```

- [ ] **Step 6: Install tsx jika belum ada dan jalankan seed**

```bash
npm install -D tsx
npx prisma db seed
```

Expected output:
```
✓ Plan "Starter" seeded
✓ Plan "Pro" seeded
✓ Plan "Enterprise" seeded
```

- [ ] **Step 7: Regenerate Prisma Client**

```bash
npx prisma generate
```

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts package.json package-lock.json
git commit -m "feat(db): add Plan, Subscription, Shift models; extend Business + User for onboarding v2"
```

---

## Task 2: Validation Schemas

**Files:**
- Modify: `src/lib/validations.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `planSelectionSchema`, `multiOutletSchema`, `operationsSchema`, `shiftItemSchema`

- [ ] **Step 1: Tambahkan schemas baru di `src/lib/validations.ts`**

Tambahkan di bagian bawah file (setelah `roleSchema`):

```typescript
export const planSelectionSchema = z.object({
  planId: z.string().min(1, "Plan wajib dipilih"),
});

export const shiftItemSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:mm)"),
});

export const multiOutletSchema = z.object({
  hasMultiOutlet: z.boolean(),
  outlets: z.array(
    z.object({
      name: z.string().min(2, "Nama outlet minimal 2 karakter"),
      address: z.string().optional(),
      city: z.string().optional(),
      phone: z.string().optional(),
    })
  ).optional(),
});

export const operationsSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
  hasShift: z.boolean(),
  shifts: z.array(shiftItemSchema).optional(),
});

// Update businessSetupSchema untuk tambah npwp
export const businessSetupSchemaV2 = z.object({
  name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  type: z.enum(["COFFEE_SHOP", "RESTAURANT", "VAPE_STORE", "BARBERSHOP", "RETAIL", "FNB", "LAUNDRY", "OTHER"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  npwp: z.string().optional(),
});
```

- [ ] **Step 2: Verify TypeScript tidak ada error**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat(validation): add schemas for plan, multi-outlet, operations, shift"
```

---

## Task 3: Session Extension (auth.ts)

**Files:**
- Modify: `src/lib/auth.ts`

**Interfaces:**
- Produces: `session.user.onboardingStep: number`, `session.user.onboardingDone: boolean`, `session.user.hasCompletedTour: boolean`

- [ ] **Step 1: Baca `src/lib/auth.ts` terlebih dahulu**

Buka dan baca file ini sebelum edit untuk memahami struktur callbacks yang sudah ada.

- [ ] **Step 2: Extend JWT callback dan session callback**

Di `callbacks.jwt`, tambahkan logic untuk memasukkan onboarding state ke token:

```typescript
// Di dalam callbacks.jwt, setelah user data dimasukkan:
if (trigger === "update" && session) {
  // Allow updating onboarding fields via auth.update()
  if (session.onboardingStep !== undefined) token.onboardingStep = session.onboardingStep;
  if (session.onboardingDone !== undefined) token.onboardingDone = session.onboardingDone;
  if (session.hasCompletedTour !== undefined) token.hasCompletedTour = session.hasCompletedTour;
}

if (trigger === "signIn" && user) {
  // Load onboarding state from DB on sign in
  const business = await prisma.business.findFirst({
    where: { ownerId: user.id as string },
    select: { onboardingStep: true, onboardingDone: true },
    orderBy: { createdAt: "desc" },
  });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id as string },
    select: { hasCompletedTour: true },
  });
  token.onboardingStep = business?.onboardingStep ?? 1;
  token.onboardingDone = business?.onboardingDone ?? false;
  token.hasCompletedTour = dbUser?.hasCompletedTour ?? false;
}
```

Di `callbacks.session`, expose ke session:

```typescript
// Di dalam callbacks.session:
if (token.onboardingStep !== undefined) session.user.onboardingStep = token.onboardingStep as number;
if (token.onboardingDone !== undefined) session.user.onboardingDone = token.onboardingDone as boolean;
if (token.hasCompletedTour !== undefined) session.user.hasCompletedTour = token.hasCompletedTour as boolean;
```

- [ ] **Step 3: Extend TypeScript type declarations**

Buat atau update file `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingStep?: number;
      onboardingDone?: boolean;
      hasCompletedTour?: boolean;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/types/next-auth.d.ts
git commit -m "feat(auth): extend session with onboardingStep, onboardingDone, hasCompletedTour"
```

---

## Task 4: Server Actions — Onboarding v2

**Files:**
- Modify: `src/actions/onboarding.ts`

**Interfaces:**
- Consumes: `planSelectionSchema`, `multiOutletSchema`, `operationsSchema`, `businessSetupSchemaV2` dari `@/lib/validations`
- Produces:
  - `setupBusiness(formData)` → `{ success: true }` | `{ error: string }`
  - `selectPlan(formData)` → `{ success: true }` | `{ error: string }`
  - `createOutlets(formData)` → `{ success: true }` | `{ error: string }`
  - `setupOperations(formData)` → `{ success: true }` | `{ error: string }`
  - `completeOnboarding()` → `{ success: true }` | `{ error: string }`

- [ ] **Step 1: Update `src/actions/onboarding.ts` — ganti seluruh isinya**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  businessSetupSchemaV2,
  planSelectionSchema,
  multiOutletSchema,
  operationsSchema,
} from "@/lib/validations";
import { DEFAULT_ROLES } from "@/lib/permissions";
import type { BusinessType } from "@prisma/client";

// Helper: get current user's business
async function getUserBusiness(userId: string) {
  return prisma.business.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
}

// Helper: advance onboarding step in DB + session
async function advanceStep(businessId: string, nextStep: number) {
  await prisma.business.update({
    where: { id: businessId },
    data: { onboardingStep: nextStep },
  });
}

// ─── STEP 1: Profil Bisnis ────────────────────────────────────────────────────

export async function setupBusiness(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    province: (formData.get("province") as string) || undefined,
    npwp: (formData.get("npwp") as string) || undefined,
  };

  const result = businessSetupSchemaV2.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = (formData.get("logo") as string) || undefined;

  // Check if business already exists (edit mode during onboarding)
  const existing = await getUserBusiness(session.user.id);
  if (existing) {
    await prisma.business.update({
      where: { id: existing.id },
      data: { ...result.data, logo, onboardingStep: 2 },
    });
    return { success: true };
  }

  // Create business
  const business = await prisma.business.create({
    data: {
      ownerId: session.user.id,
      name: result.data.name,
      type: result.data.type as BusinessType,
      phone: result.data.phone,
      address: result.data.address,
      city: result.data.city,
      province: result.data.province,
      npwp: result.data.npwp,
      logo,
      onboardingStep: 2,
    },
  });

  // Create default roles
  for (const [, roleData] of Object.entries(DEFAULT_ROLES)) {
    await prisma.role.create({
      data: {
        businessId: business.id,
        name: roleData.name,
        desc: roleData.desc,
        permissions: roleData.permissions,
        isSystem: true,
      },
    });
  }

  // Create owner employee record
  const ownerRole = await prisma.role.findFirst({
    where: { businessId: business.id, name: "Owner" },
  });
  if (ownerRole) {
    await prisma.employee.create({
      data: {
        businessId: business.id,
        userId: session.user.id,
        roleId: ownerRole.id,
        name: session.user.name || "Owner",
        email: session.user.email || undefined,
      },
    });
  }

  return { success: true };
}

// ─── STEP 2: Pilih Plan ───────────────────────────────────────────────────────

export async function selectPlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = { planId: formData.get("planId") as string };
  const result = planSelectionSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  const plan = await prisma.plan.findUnique({ where: { id: result.data.planId } });
  if (!plan) return { error: "Plan tidak ditemukan" };

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { businessId: business.id },
    update: {
      planId: result.data.planId,
      status: "trial",
      trialEndsAt,
    },
    create: {
      businessId: business.id,
      planId: result.data.planId,
      status: "trial",
      trialEndsAt,
    },
  });

  await advanceStep(business.id, 3);

  return { success: true };
}

// ─── STEP 3: Setup Outlet ─────────────────────────────────────────────────────

export async function createOutlets(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const hasMultiOutlet = formData.get("hasMultiOutlet") === "true";

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  const ownerEmployee = await prisma.employee.findFirst({
    where: { businessId: business.id, userId: session.user.id },
  });

  // Hapus outlet lama jika ada (re-submission saat edit onboarding)
  const existingOutlets = await prisma.outlet.findMany({ where: { businessId: business.id } });
  if (existingOutlets.length > 0) {
    await prisma.outlet.deleteMany({ where: { businessId: business.id } });
  }

  if (!hasMultiOutlet) {
    // Auto-create dari data bisnis
    const outlet = await prisma.outlet.create({
      data: {
        businessId: business.id,
        name: business.name,
        address: business.address || undefined,
        city: business.city || undefined,
        phone: business.phone || undefined,
        openTime: business.openTime || "08:00",
        closeTime: business.closeTime || "22:00",
      },
    });
    if (ownerEmployee) {
      await prisma.employeeOutlet.create({
        data: { employeeId: ownerEmployee.id, outletId: outlet.id },
      });
    }
    await prisma.business.update({
      where: { id: business.id },
      data: { hasMultiOutlet: false, onboardingStep: 4 },
    });
    return { success: true };
  }

  // Multi-outlet: parse dari FormData (format: outlets[0][name], outlets[0][city], etc.)
  const outletNames: string[] = [];
  let i = 0;
  while (formData.get(`outlets[${i}][name]`)) {
    outletNames.push(formData.get(`outlets[${i}][name]`) as string);
    i++;
  }

  if (outletNames.length === 0) return { error: "Minimal 1 outlet harus diisi" };

  const outletsToCreate = outletNames.map((_, idx) => ({
    businessId: business.id,
    name: formData.get(`outlets[${idx}][name]`) as string,
    address: (formData.get(`outlets[${idx}][address]`) as string) || undefined,
    city: (formData.get(`outlets[${idx}][city]`) as string) || undefined,
    phone: (formData.get(`outlets[${idx}][phone]`) as string) || undefined,
  }));

  const result = multiOutletSchema.safeParse({ hasMultiOutlet: true, outlets: outletsToCreate });
  if (!result.success) return { error: result.error.issues[0].message };

  for (const outletData of outletsToCreate) {
    const outlet = await prisma.outlet.create({ data: outletData });
    if (ownerEmployee) {
      await prisma.employeeOutlet.create({
        data: { employeeId: ownerEmployee.id, outletId: outlet.id },
      });
    }
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { hasMultiOutlet: true, onboardingStep: 4 },
  });

  return { success: true };
}

// ─── STEP 4: Pengaturan Operasional ──────────────────────────────────────────

export async function setupOperations(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const hasShift = formData.get("hasShift") === "true";

  const shifts: Array<{ name: string; startTime: string; endTime: string }> = [];
  if (hasShift) {
    let i = 0;
    while (formData.get(`shifts[${i}][name]`)) {
      shifts.push({
        name: formData.get(`shifts[${i}][name]`) as string,
        startTime: formData.get(`shifts[${i}][startTime]`) as string,
        endTime: formData.get(`shifts[${i}][endTime]`) as string,
      });
      i++;
    }
  }

  const raw = {
    openTime: formData.get("openTime") as string,
    closeTime: formData.get("closeTime") as string,
    hasShift,
    shifts: hasShift ? shifts : undefined,
  };

  const result = operationsSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  await prisma.business.update({
    where: { id: business.id },
    data: {
      openTime: result.data.openTime,
      closeTime: result.data.closeTime,
      hasShift,
      onboardingStep: 5,
    },
  });

  // Update outlet jam operasional (semua outlet inherit dari bisnis)
  await prisma.outlet.updateMany({
    where: { businessId: business.id },
    data: { openTime: result.data.openTime, closeTime: result.data.closeTime },
  });

  if (hasShift && result.data.shifts && result.data.shifts.length > 0) {
    // Hapus shifts lama
    await prisma.shift.deleteMany({ where: { businessId: business.id } });
    // Buat shifts baru
    await prisma.shift.createMany({
      data: result.data.shifts.map((s) => ({
        businessId: business.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });
  }

  return { success: true };
}

// ─── STEP 5: Complete Onboarding ─────────────────────────────────────────────

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  await prisma.business.update({
    where: { id: business.id },
    data: { onboardingDone: true, onboardingStep: 5 },
  });

  return { success: true };
}

// ─── SEED DEMO DATA (existing, unchanged) ────────────────────────────────────

export async function seedDemoData() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: { outlets: true, roles: true },
    orderBy: { createdAt: "desc" },
  });

  if (!business) return { error: "Business not found" };
  if (business.outlets.length === 0) return { error: "No outlet found" };

  const outlet = business.outlets[0];
  const cashierRole = business.roles.find((r) => r.name === "Kasir");
  const managerRole = business.roles.find((r) => r.name === "Manager");
  if (!cashierRole || !managerRole) return { error: "Roles not found" };

  const demoEmployees = [
    { name: "Budi Santoso", email: "budi@demo.id", phone: "081234567890", roleId: managerRole.id },
    { name: "Siti Rahma", email: "siti@demo.id", phone: "081234567891", roleId: cashierRole.id },
    { name: "Andi Wijaya", email: "andi@demo.id", phone: "081234567892", roleId: cashierRole.id },
  ];

  for (const emp of demoEmployees) {
    const employee = await prisma.employee.create({
      data: { businessId: business.id, name: emp.name, email: emp.email, phone: emp.phone, roleId: emp.roleId, pin: "1234" },
    });
    await prisma.employeeOutlet.create({
      data: { employeeId: employee.id, outletId: outlet.id },
    });
  }

  if (!business.hasMultiOutlet) {
    const outlet2 = await prisma.outlet.create({
      data: {
        businessId: business.id,
        name: "Cabang Kedua (Demo)",
        address: "Jl. Contoh No. 2",
        city: business.city || "Jakarta",
        openTime: "09:00",
        closeTime: "21:00",
      },
    });
    const managerEmp = await prisma.employee.findFirst({
      where: { businessId: business.id, roleId: managerRole.id },
    });
    if (managerEmp) {
      await prisma.employeeOutlet.create({ data: { employeeId: managerEmp.id, outletId: outlet2.id } });
    }
  }

  return { success: true };
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/onboarding.ts
git commit -m "feat(actions): onboarding v2 — selectPlan, createOutlets, setupOperations, completeOnboarding"
```

---

## Task 5: Middleware Update

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `session.user.onboardingDone`, `session.user.onboardingStep` (dari Task 3)
- Produces: routing logic 5-step onboarding

- [ ] **Step 1: Ganti isi `middleware.ts`**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const STEP_ROUTES: Record<number, string> = {
  1: "/onboarding/business",
  2: "/onboarding/plan",
  3: "/onboarding/outlet",
  4: "/onboarding/operations",
  5: "/onboarding/complete",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  // Auth routes — redirect to dashboard if already logged in
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated → login
  if (!isPublicRoute && !isLoggedIn && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isLoggedIn) return NextResponse.next();

  const onboardingDone = req.auth?.user?.onboardingDone ?? false;
  const onboardingStep = req.auth?.user?.onboardingStep ?? 1;
  const isOnboarding = pathname.startsWith("/onboarding");
  const isDashboard = pathname.startsWith("/dashboard");

  // Onboarding not done → force to correct step
  if (!onboardingDone && isDashboard) {
    const targetRoute = STEP_ROUTES[onboardingStep] ?? "/onboarding/business";
    return NextResponse.redirect(new URL(targetRoute, req.url));
  }

  // Onboarding done → no need to stay on onboarding
  if (onboardingDone && isOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|uploads|favicon.ico).*)"],
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(middleware): 5-step onboarding routing based on session claims"
```

---

## Task 6: Onboarding Layout — 5-Step Stepper

**Files:**
- Modify: `src/app/onboarding/layout.tsx`

**Interfaces:**
- Consumes: current pathname untuk active/completed state
- Produces: 5-step stepper: Profil Bisnis, Pilih Plan, Setup Outlet, Operasional, Selesai

- [ ] **Step 1: Ganti array `steps` dan copy text di `layout.tsx`**

Ganti bagian `const steps = [...]` dengan:

```typescript
const steps = [
  {
    id: "business",
    title: "Profil Bisnis",
    desc: "Nama, tipe, dan info bisnis",
    icon: Building2,
    active: pathname.includes("/business"),
    completed:
      pathname.includes("/plan") ||
      pathname.includes("/outlet") ||
      pathname.includes("/operations") ||
      pathname.includes("/complete"),
  },
  {
    id: "plan",
    title: "Pilih Plan",
    desc: "Starter, Pro, atau Enterprise",
    icon: Sparkles,
    active: pathname.includes("/plan"),
    completed:
      pathname.includes("/outlet") ||
      pathname.includes("/operations") ||
      pathname.includes("/complete"),
  },
  {
    id: "outlet",
    title: "Setup Outlet",
    desc: "Lokasi toko atau cabang",
    icon: Store,
    active: pathname.includes("/outlet"),
    completed:
      pathname.includes("/operations") || pathname.includes("/complete"),
  },
  {
    id: "operations",
    title: "Operasional",
    desc: "Jam buka, tutup, dan shift",
    icon: Clock,
    active: pathname.includes("/operations"),
    completed: pathname.includes("/complete"),
  },
  {
    id: "complete",
    title: "Selesai",
    desc: "Dashboard siap digunakan",
    icon: CheckCircle2,
    active: pathname.includes("/complete"),
    completed: false,
  },
];
```

Tambahkan `Clock` ke import dari lucide-react:

```typescript
import { Sparkles, Building2, Store, CheckCircle2, Clock } from "lucide-react";
```

Update heading copy:

```typescript
// Ganti teks heading dari:
// "Setup bisnis kamu dalam 3 langkah."
// Menjadi:
"Setup bisnis kamu dalam 5 langkah."
```

- [ ] **Step 2: Verify halaman onboarding masih bisa dirender**

```bash
npm run dev
```

Buka `http://localhost:3000/onboarding/business` — stepper harus menampilkan 5 steps.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/layout.tsx
git commit -m "feat(onboarding): extend stepper to 5 steps"
```

---

## Task 7: Step 1 — Profil Bisnis (Tambah NPWP)

**Files:**
- Modify: `src/app/onboarding/business/page.tsx`

**Interfaces:**
- Consumes: `setupBusiness` server action (updated, Task 4)
- Produces: form dengan field NPWP baru; redirect ke `/onboarding/plan` on success

- [ ] **Step 1: Baca `src/app/onboarding/business/page.tsx`**

- [ ] **Step 2: Tambahkan NPWP field di form**

Cari bagian field `province` di JSX, tambahkan setelah field tersebut:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-700">
    NPWP <span className="text-slate-400 font-normal">(Opsional)</span>
  </label>
  <Input
    name="npwp"
    placeholder="00.000.000.0-000.000"
    defaultValue=""
  />
  <p className="text-xs text-slate-400">
    Untuk kebutuhan invoicing dan laporan pajak.
  </p>
</div>
```

- [ ] **Step 3: Update redirect setelah success**

Cari `router.push` atau redirect setelah form submit sukses. Ubah target dari `/onboarding/outlet` ke `/onboarding/plan`:

```typescript
// Setelah action success:
router.push("/onboarding/plan");
```

- [ ] **Step 4: Verify di browser**

Isi form bisnis → klik lanjut → harus redirect ke `/onboarding/plan`.

- [ ] **Step 5: Commit**

```bash
git add src/app/onboarding/business/page.tsx
git commit -m "feat(onboarding/business): add NPWP field, redirect to plan step"
```

---

## Task 8: Step 2 — Pilih Plan (Halaman Baru)

**Files:**
- Create: `src/app/onboarding/plan/page.tsx`

**Interfaces:**
- Consumes: `selectPlan` server action (Task 4); `Plan` dari Prisma
- Produces: pricing cards UI; redirect ke `/onboarding/outlet` on success

- [ ] **Step 1: Install driver.js (dibutuhkan nanti, install sekarang)**

```bash
npm install driver.js
```

- [ ] **Step 2: Buat `src/app/onboarding/plan/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectPlan } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  displayName: string;
  maxOutlets: number;
  maxEmployees: number;
  features: string[];
  price: number;
};

const PLAN_ICONS = {
  starter: Zap,
  pro: Rocket,
  enterprise: Building2,
};

const PLAN_DESCRIPTIONS = {
  starter: "Untuk bisnis baru atau 1 toko.",
  pro: "Untuk bisnis yang berkembang dengan beberapa outlet.",
  enterprise: "Untuk jaringan bisnis skala besar.",
};

const FEATURE_LABELS: Record<string, string> = {
  basic_reports: "Laporan dasar",
  shift: "Manajemen shift karyawan",
  advanced_reports: "Laporan lengkap & analitik",
  export: "Export data (Excel/PDF)",
  api: "Akses API",
  priority_support: "Support prioritas",
};

function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price) + "/bln";
}

function formatLimit(val: number, unit: string) {
  return val === -1 ? `Unlimited ${unit}` : `${val} ${unit}`;
}

export default function PlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        // Pre-select "starter" plan by default
        const starter = data.find((p: Plan) => p.name === "starter");
        if (starter) setSelectedPlanId(starter.id);
      });
  }, []);

  async function handleSubmit() {
    if (!selectedPlanId) {
      setError("Pilih salah satu plan terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("planId", selectedPlanId);
    const result = await selectPlan(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/outlet");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1.5 text-sm font-medium text-cyan-700">
          <Zap className="h-3.5 w-3.5" />
          14 Hari Trial Pro Gratis untuk semua akun baru
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Pilih Plan</h1>
        <p className="text-slate-500">
          Pilih plan yang sesuai. Semua akun baru mendapat 14 hari akses Pro secara gratis.
        </p>
      </div>

      {plans.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] ?? Zap;
          const isSelected = selectedPlanId === plan.id;
          const isPro = plan.name === "pro";

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-md focus:outline-none",
                isSelected
                  ? "border-cyan-500 bg-cyan-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300",
                isPro && !isSelected && "border-cyan-200"
              )}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-3">
                  Paling Populer
                </Badge>
              )}
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4", isSelected ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600")}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{plan.displayName}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-3">{PLAN_DESCRIPTIONS[plan.name as keyof typeof PLAN_DESCRIPTIONS]}</p>
              <div className="text-2xl font-bold text-slate-900 mb-4">{formatPrice(plan.price)}</div>
              <ul className="space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {formatLimit(plan.maxOutlets, "outlet")}
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {formatLimit(plan.maxEmployees, "karyawan")}
                </li>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {FEATURE_LABELS[f] ?? f}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                  <Check className="h-4 w-4" />
                  Dipilih
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/onboarding/business")} disabled={loading}>
          Kembali
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !selectedPlanId} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
          {loading ? "Menyimpan..." : "Lanjut"}
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Plan dapat diubah kapan saja melalui halaman Pengaturan. Trial Pro 14 hari tidak memerlukan kartu kredit.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Buat API route untuk fetch plans: `src/app/api/plans/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
    select: {
      id: true,
      name: true,
      displayName: true,
      maxOutlets: true,
      maxEmployees: true,
      features: true,
      price: true,
    },
  });
  return NextResponse.json(plans);
}
```

- [ ] **Step 4: Verify di browser**

Navigasi ke `/onboarding/plan` → harus tampil 3 pricing cards (Starter, Pro, Enterprise).

- [ ] **Step 5: Commit**

```bash
git add src/app/onboarding/plan/page.tsx src/app/api/plans/route.ts
git commit -m "feat(onboarding/plan): pricing cards with plan selection"
```

---

## Task 9: Step 3 — Setup Outlet (Redesign Conditional)

**Files:**
- Modify: `src/app/onboarding/outlet/page.tsx`

**Interfaces:**
- Consumes: `createOutlets` server action (Task 4)
- Produces: halaman dengan conditional "punya cabang?" → redirect ke `/onboarding/operations`

- [ ] **Step 1: Baca `src/app/onboarding/outlet/page.tsx`**

- [ ] **Step 2: Ganti seluruh isi `page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOutlets } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OutletForm = {
  name: string;
  address: string;
  city: string;
  phone: string;
};

const emptyOutlet = (): OutletForm => ({ name: "", address: "", city: "", phone: "" });

export default function OutletPage() {
  const router = useRouter();
  const [hasMultiOutlet, setHasMultiOutlet] = useState<boolean | null>(null);
  const [outlets, setOutlets] = useState<OutletForm[]>([emptyOutlet()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateOutlet(index: number, field: keyof OutletForm, value: string) {
    setOutlets((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  }

  function addOutlet() {
    setOutlets((prev) => [...prev, emptyOutlet()]);
  }

  function removeOutlet(index: number) {
    if (outlets.length <= 1) return;
    setOutlets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("hasMultiOutlet", hasMultiOutlet ? "true" : "false");

    if (hasMultiOutlet) {
      outlets.forEach((outlet, i) => {
        formData.append(`outlets[${i}][name]`, outlet.name);
        if (outlet.address) formData.append(`outlets[${i}][address]`, outlet.address);
        if (outlet.city) formData.append(`outlets[${i}][city]`, outlet.city);
        if (outlet.phone) formData.append(`outlets[${i}][phone]`, outlet.phone);
      });
    }

    const result = await createOutlets(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/operations");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Setup Outlet</h1>
        <p className="text-slate-500">Tentukan lokasi operasional bisnis Anda.</p>
      </div>

      {/* Question: punya cabang? */}
      {hasMultiOutlet === null && (
        <div className="space-y-4">
          <p className="font-medium text-slate-800">Apakah bisnis Anda memiliki lebih dari 1 lokasi / cabang?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasMultiOutlet(false)}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-all"
            >
              <Store className="h-8 w-8 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-900">Tidak</p>
                <p className="text-xs text-slate-500 mt-0.5">Hanya 1 toko saja</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setHasMultiOutlet(true)}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-all"
            >
              <div className="flex gap-1">
                <Store className="h-7 w-7 text-slate-400" />
                <Store className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ya</p>
                <p className="text-xs text-slate-500 mt-0.5">Punya 2 atau lebih lokasi</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tidak punya cabang → konfirmasi auto-create */}
      {hasMultiOutlet === false && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Store className="h-5 w-5 text-cyan-500" />
              <span className="font-semibold">Outlet Utama</span>
            </div>
            <p className="text-sm text-slate-500">
              Outlet akan dibuat otomatis menggunakan nama dan alamat bisnis Anda.
              Anda dapat mengubah detail outlet kapan saja melalui halaman Pengaturan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasMultiOutlet(null)}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Ubah pilihan
          </button>
        </div>
      )}

      {/* Punya cabang → form multi-outlet */}
      {hasMultiOutlet === true && (
        <div className="space-y-5">
          {outlets.map((outlet, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Outlet {index + 1}</h3>
                {outlets.length > 1 && (
                  <button type="button" onClick={() => removeOutlet(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nama Outlet *</label>
                  <Input
                    placeholder="Contoh: Cabang Pusat"
                    value={outlet.name}
                    onChange={(e) => updateOutlet(index, "name", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Kota</label>
                    <Input
                      placeholder="Jakarta"
                      value={outlet.city}
                      onChange={(e) => updateOutlet(index, "city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telepon</label>
                    <Input
                      placeholder="021-xxxxxxxx"
                      value={outlet.phone}
                      onChange={(e) => updateOutlet(index, "phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Alamat</label>
                  <Input
                    placeholder="Jl. Contoh No. 1"
                    value={outlet.address}
                    onChange={(e) => updateOutlet(index, "address", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addOutlet}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Outlet Lagi
          </button>

          <button
            type="button"
            onClick={() => setHasMultiOutlet(null)}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Ubah pilihan
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {hasMultiOutlet !== null && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/plan")} disabled={loading}>
            Kembali
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (hasMultiOutlet && outlets.every((o) => !o.name.trim()))}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
          >
            {loading ? "Menyimpan..." : "Lanjut"}
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify di browser**

Navigasi ke `/onboarding/outlet`:
- Klik "Tidak" → muncul konfirmasi auto-create
- Klik "Ya" → muncul form outlet yang bisa ditambah
- Klik Lanjut → redirect ke `/onboarding/operations`

- [ ] **Step 4: Commit**

```bash
git add src/app/onboarding/outlet/page.tsx
git commit -m "feat(onboarding/outlet): redesign with conditional single/multi-outlet flow"
```

---

## Task 10: Step 4 — Pengaturan Operasional (Halaman Baru)

**Files:**
- Create: `src/app/onboarding/operations/page.tsx`

**Interfaces:**
- Consumes: `setupOperations` server action (Task 4)
- Produces: form jam operasional + conditional shift setup; redirect ke `/onboarding/complete`

- [ ] **Step 1: Buat `src/app/onboarding/operations/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupOperations } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";

type ShiftForm = {
  name: string;
  startTime: string;
  endTime: string;
};

const DEFAULT_SHIFTS: ShiftForm[] = [
  { name: "Shift Pagi", startTime: "08:00", endTime: "15:00" },
  { name: "Shift Sore", startTime: "15:00", endTime: "22:00" },
];

const emptyShift = (): ShiftForm => ({ name: "", startTime: "08:00", endTime: "17:00" });

export default function OperationsPage() {
  const router = useRouter();
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [hasShift, setHasShift] = useState<boolean | null>(null);
  const [shifts, setShifts] = useState<ShiftForm[]>(DEFAULT_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateShift(index: number, field: keyof ShiftForm, value: string) {
    setShifts((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addShift() {
    setShifts((prev) => [...prev, emptyShift()]);
  }

  function removeShift(index: number) {
    if (shifts.length <= 1) return;
    setShifts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (hasShift === null) {
      setError("Pilih apakah bisnis Anda menggunakan shift karyawan");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("openTime", openTime);
    formData.append("closeTime", closeTime);
    formData.append("hasShift", hasShift ? "true" : "false");

    if (hasShift) {
      shifts.forEach((shift, i) => {
        formData.append(`shifts[${i}][name]`, shift.name);
        formData.append(`shifts[${i}][startTime]`, shift.startTime);
        formData.append(`shifts[${i}][endTime]`, shift.endTime);
      });
    }

    const result = await setupOperations(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/complete");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Pengaturan Operasional</h1>
        <p className="text-slate-500">Atur jam buka dan sistem shift karyawan bisnis Anda.</p>
      </div>

      {/* Jam Operasional */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-500" />
          Jam Operasional
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam Buka</label>
            <Input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam Tutup</label>
            <Input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Jam operasional berlaku untuk semua outlet. Dapat diubah per-outlet melalui Pengaturan.
        </p>
      </div>

      {/* Shift Question */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-800">Sistem Shift Karyawan</h2>
        <p className="text-sm text-slate-500">
          Apakah bisnis Anda menggunakan sistem shift? Ini akan memengaruhi tutup kas dan laporan karyawan.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHasShift(false)}
            className={`rounded-2xl border-2 p-4 text-center transition-all ${
              hasShift === false
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">Tidak</p>
            <p className="text-xs text-slate-500 mt-0.5">Tutup kas 1x/hari</p>
          </button>
          <button
            type="button"
            onClick={() => setHasShift(true)}
            className={`rounded-2xl border-2 p-4 text-center transition-all ${
              hasShift === true
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">Ya</p>
            <p className="text-xs text-slate-500 mt-0.5">Tutup kas per shift</p>
          </button>
        </div>
      </div>

      {/* Shift Setup */}
      {hasShift === true && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Definisikan shift-shift Anda. Dapat ditambah atau diubah kapan saja.
          </p>
          {shifts.map((shift, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Shift {index + 1}</span>
                {shifts.length > 1 && (
                  <button type="button" onClick={() => removeShift(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Shift</label>
                <Input
                  placeholder="Contoh: Shift Pagi"
                  value={shift.name}
                  onChange={(e) => updateShift(index, "name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Jam Mulai</label>
                  <Input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => updateShift(index, "startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Jam Selesai</label>
                  <Input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => updateShift(index, "endTime", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addShift}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-3 text-sm font-medium text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Shift
          </button>
        </div>
      )}

      {hasShift === false && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-cyan-500 inline mr-2" />
          Tutup kas akan dilakukan 1x per hari saat toko tutup pukul <strong>{closeTime}</strong>.
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/onboarding/outlet")} disabled={loading}>
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || hasShift === null}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600"
        >
          {loading ? "Menyimpan..." : "Lanjut"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify di browser**

Navigasi ke `/onboarding/operations`:
- Isi jam buka/tutup
- Klik "Tidak" atau "Ya" untuk shift
- Klik Lanjut → redirect ke `/onboarding/complete`

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/operations/page.tsx
git commit -m "feat(onboarding/operations): operational hours + conditional shift setup"
```

---

## Task 11: Step 5 — Complete (Redesign dengan Summary)

**Files:**
- Modify: `src/app/onboarding/complete/page.tsx`

**Interfaces:**
- Consumes: `completeOnboarding`, `seedDemoData` server actions (Task 4)
- Produces: summary card + tombol "Mulai Gunakan" yang set `onboardingDone = true`

- [ ] **Step 1: Baca `src/app/onboarding/complete/page.tsx`**

- [ ] **Step 2: Ganti seluruh isi `page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, seedDemoData } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Store, Clock, CreditCard, PartyPopper } from "lucide-react";

type Summary = {
  businessName: string;
  businessType: string;
  planName: string;
  trialEndsAt: string;
  outletCount: number;
  outletNames: string[];
  openTime: string;
  closeTime: string;
  hasShift: boolean;
  shiftCount: number;
};

export default function CompletePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/summary")
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  async function handleComplete() {
    setLoading(true);
    await completeOnboarding();
    router.push("/dashboard");
  }

  async function handleSeedAndComplete() {
    setSeedLoading(true);
    await seedDemoData();
    await completeOnboarding();
    router.push("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <PartyPopper className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Hampir selesai!</h1>
        <p className="text-slate-500">Cek ringkasan setup bisnis Anda sebelum masuk ke dashboard.</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Bisnis</p>
                <p className="font-semibold text-slate-900">{summary.businessName}</p>
                <p className="text-sm text-slate-500">{summary.businessType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Plan</p>
                <p className="font-semibold text-slate-900">
                  {summary.planName}{" "}
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Trial Pro s.d. {summary.trialEndsAt}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Outlet</p>
                <p className="font-semibold text-slate-900">{summary.outletCount} outlet</p>
                <p className="text-sm text-slate-500">{summary.outletNames.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Operasional</p>
                <p className="font-semibold text-slate-900">
                  {summary.openTime} – {summary.closeTime}
                </p>
                <p className="text-sm text-slate-500">
                  {summary.hasShift
                    ? `${summary.shiftCount} shift karyawan`
                    : "Tanpa shift, tutup kas 1x/hari"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!summary && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleComplete}
          disabled={loading || seedLoading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 h-12 text-base font-semibold"
        >
          {loading ? "Memuat dashboard..." : "Mulai Gunakan Bayaro →"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSeedAndComplete}
          disabled={loading || seedLoading}
          className="w-full h-11 text-sm text-slate-500"
        >
          {seedLoading ? "Menambahkan data..." : "Isi dengan data contoh (untuk mencoba fitur)"}
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Semua pengaturan dapat diubah kapan saja melalui halaman Pengaturan.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Buat API summary route: `src/app/api/onboarding/summary/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      outlets: { select: { name: true } },
      subscription: { include: { plan: { select: { displayName: true } } } },
      shifts: { where: { isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const trialEndsAt = business.subscription?.trialEndsAt
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
        business.subscription.trialEndsAt
      )
    : "-";

  const TYPE_LABELS: Record<string, string> = {
    COFFEE_SHOP: "Coffee Shop",
    RESTAURANT: "Restaurant",
    VAPE_STORE: "Vape Store",
    BARBERSHOP: "Barbershop",
    RETAIL: "Retail",
    FNB: "F&B",
    LAUNDRY: "Laundry",
    OTHER: "Lainnya",
  };

  return NextResponse.json({
    businessName: business.name,
    businessType: TYPE_LABELS[business.type] ?? business.type,
    planName: business.subscription?.plan?.displayName ?? "Starter",
    trialEndsAt,
    outletCount: business.outlets.length,
    outletNames: business.outlets.map((o) => o.name),
    openTime: business.openTime ?? "08:00",
    closeTime: business.closeTime ?? "22:00",
    hasShift: business.hasShift,
    shiftCount: business.shifts.length,
  });
}
```

- [ ] **Step 4: Verify di browser**

Navigasi ke `/onboarding/complete` → harus tampil summary card dengan data yang benar.

- [ ] **Step 5: Commit**

```bash
git add src/app/onboarding/complete/page.tsx src/app/api/onboarding/summary/route.ts
git commit -m "feat(onboarding/complete): redesign with summary card + completeOnboarding action"
```

---

## Task 12: Tour Guide (driver.js)

**Files:**
- Create: `src/components/shared/tour-guide.tsx`
- Create: `src/actions/tour.ts`
- Modify: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `driver.js`, `User.hasCompletedTour` dari session
- Produces: tooltip tour yang auto-start sekali, bisa di-skip

- [ ] **Step 1: Verify driver.js sudah terinstall (dari Task 8)**

```bash
ls node_modules/driver.js 2>/dev/null && echo "installed" || echo "not found"
```

Jika belum: `npm install driver.js`

- [ ] **Step 2: Buat server action `src/actions/tour.ts`**

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markTourComplete() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hasCompletedTour: true },
  });

  return { success: true };
}
```

- [ ] **Step 3: Buat `src/components/shared/tour-guide.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { markTourComplete } from "@/actions/tour";

type TourGuideProps = {
  hasCompletedTour: boolean;
};

export function TourGuide({ hasCompletedTour }: TourGuideProps) {
  useEffect(() => {
    if (hasCompletedTour) return;

    // Delay sedikit biar sidebar/layout sempat render
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: "{{current}} dari {{total}}",
        nextBtnText: "Selanjutnya →",
        prevBtnText: "← Kembali",
        doneBtnText: "Selesai",
        allowClose: true,
        overlayOpacity: 0.4,
        stagePadding: 8,
        popoverClass: "bayaro-tour",
        steps: [
          {
            element: "[data-tour='dashboard']",
            popover: {
              title: "Dashboard",
              description: "Lihat ringkasan penjualan, transaksi terbaru, dan performa bisnis Anda di sini.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='products']",
            popover: {
              title: "Produk & Menu",
              description: "Tambah dan kelola produk atau menu yang Anda jual. Atur kategori dan harga.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='cashier']",
            popover: {
              title: "Kasir",
              description: "Mulai transaksi penjualan dari sini. Pilih produk, proses pembayaran, cetak struk.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='reports']",
            popover: {
              title: "Laporan",
              description: "Pantau performa bisnis, omzet harian, dan laporan karyawan.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='settings']",
            popover: {
              title: "Pengaturan",
              description: "Atur karyawan, outlet, role, dan preferensi bisnis Anda kapan saja.",
              side: "right",
              align: "start",
            },
          },
        ],
        onDestroyStarted: async () => {
          driverObj.destroy();
          await markTourComplete();
        },
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasCompletedTour]);

  return null;
}
```

- [ ] **Step 4: Tambahkan `data-tour` attributes ke sidebar menu items**

Buka `src/app/(dashboard)/layout.tsx` (atau file sidebar), cari menu items dan tambahkan attribute:

```tsx
// Contoh: pada link/button Dashboard
<Link href="/dashboard" data-tour="dashboard">Dashboard</Link>

// Pada link Produk
<Link href="/dashboard/products" data-tour="products">Produk</Link>

// Pada link Kasir
<Link href="/dashboard/cashier" data-tour="cashier">Kasir</Link>

// Pada link Laporan
<Link href="/dashboard/reports" data-tour="reports">Laporan</Link>

// Pada link Pengaturan
<Link href="/dashboard/settings" data-tour="settings">Pengaturan</Link>
```

- [ ] **Step 5: Mount TourGuide di dashboard layout**

Di `src/app/(dashboard)/layout.tsx`, import dan gunakan TourGuide:

```tsx
import { TourGuide } from "@/components/shared/tour-guide";
import { auth } from "@/lib/auth";

// Di dalam layout function (server component):
const session = await auth();
const hasCompletedTour = session?.user?.hasCompletedTour ?? true;

// Di dalam return JSX:
<TourGuide hasCompletedTour={hasCompletedTour} />
```

- [ ] **Step 6: Verify tour berjalan**

1. Login dengan akun baru yang baru selesai onboarding
2. Buka `/dashboard` → tour harus auto-start
3. Klik "Selanjutnya" beberapa kali → tooltip highlight menu items berurutan
4. Klik "Lewati" atau selesaikan → tour tidak muncul lagi saat refresh

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/tour-guide.tsx src/actions/tour.ts src/app/(dashboard)/layout.tsx
git commit -m "feat(tour): driver.js tour guide, auto-start post-onboarding, skippable"
```

---

## Task 13: End-to-End Verification

- [ ] **Step 1: Fresh registration flow test**

```
1. Buka http://localhost:3000/register
2. Register akun baru
3. Harus redirect ke /onboarding/business
4. Isi form bisnis (termasuk NPWP opsional) → klik Lanjut
5. Harus redirect ke /onboarding/plan
6. Pilih plan → klik Lanjut
7. Harus redirect ke /onboarding/outlet
8. Coba flow "Tidak" (single store) → klik Lanjut
9. Harus redirect ke /onboarding/operations
10. Isi jam operasional, pilih shift / tidak → klik Lanjut
11. Harus redirect ke /onboarding/complete
12. Cek summary card tampil dengan data yang benar
13. Klik "Mulai Gunakan Bayaro" → harus redirect ke /dashboard
14. Tour guide harus auto-start
15. Skip tour → reload dashboard → tour TIDAK muncul lagi
```

- [ ] **Step 2: Multi-outlet flow test**

```
1. Register akun baru
2. Di step outlet, pilih "Ya" (punya cabang)
3. Isi 2 outlet dengan nama berbeda
4. Lanjutkan sampai complete
5. Cek summary: outletCount = 2
6. Cek database: prisma studio → Business → outlets → harus ada 2 outlet
```

- [ ] **Step 3: Browser close & resume test**

```
1. Register akun baru, isi step 1 (bisnis)
2. Close browser tab
3. Buka kembali → harus di-redirect ke /onboarding/plan (step 2)
```

- [ ] **Step 4: Onboarding done guard test**

```
1. Login dengan akun yang sudah onboarding selesai
2. Coba akses /onboarding/plan langsung
3. Harus di-redirect ke /dashboard
```

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, build successful

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: onboarding v2 — adaptive 5-step enterprise wizard complete"
```
