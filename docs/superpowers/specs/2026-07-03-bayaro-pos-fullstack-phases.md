# Bayaro POS Full-Stack — Phased Implementation Spec

**Date:** 2026-07-03  
**Branch:** pos-b-v2  
**Status:** Draft

---

## Overview

Dokumen ini mendefinisikan **seluruh phase** pengembangan Bayaro POS system — dari registrasi user/toko sampai full MVP. Setiap phase dirancang agar bisa dieksekusi secara independen dengan perintah "jalankan phase-X".

### Keputusan Arsitektur

| Aspek | Keputusan |
|-------|-----------|
| **Architecture** | Next.js 15 Full-Stack (App Router + Server Actions + Route Handlers) |
| **Database** | PostgreSQL 15 via Prisma ORM |
| **Auth** | NextAuth.js v5 (Auth.js) + Prisma Adapter |
| **Multi-tenancy** | Shared DB + `tenant_id` (business_id) di setiap tabel |
| **Onboarding** | Wizard step-by-step (register → profil bisnis → outlet pertama) |
| **UI/Design** | Bayaro admin template yang sudah ada (navy sidebar, glassmorphism, Manrope/Sora) |
| **Cache** | Redis (session + cache) — ditambahkan di phase lanjut |
| **File Storage** | Local/S3 — ditambahkan saat butuh upload |
| **Deployment** | Vercel / VPS + Docker |

### Tech Stack

```
Frontend:  Next.js 15, TypeScript, Tailwind CSS, lucide-react
Backend:   Next.js API Routes + Server Actions
Database:  PostgreSQL 15, Prisma 6
Auth:      NextAuth.js v5 (Auth.js)
Validation: Zod
State:     React hooks (useState/useReducer) + Server Components
```

### Database Multi-Tenant Model

```
User (1) ──owns──> Business (many)
Business (1) ──has──> Outlet (many)
Business (1) ──has──> Employee (many)
Business (1) ──has──> Product (many)
Business (1) ──has──> Transaction (many)

Setiap tabel utama punya kolom: business_id (tenant isolation)
```

---

## Phase 1: Auth + Onboarding + Business Setup

**Goal:** User bisa register, login, setup profil bisnis, dan buat outlet pertama.  
**Estimasi:** 3-5 hari  
**Dependencies:** None (phase pertama)

### 1.1 Database Schema

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
  businesses    Business[]  // owned businesses
  employees     Employee[]  // employments
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
  taxRate     Float        @default(0)     // PPN percentage (e.g. 11)
  serviceRate Float        @default(0)     // Service charge percentage
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

### 1.2 Auth Configuration (NextAuth.js v5)

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
- Google OAuth (optional, phase awal boleh skip)
- Session strategy: JWT (lebih scalable untuk multi-tenant)
- Session includes: userId, email, name, activeBusinessId, activeOutletId, role

### 1.3 Onboarding Wizard Flow

```
Step 1: Register (/register)
  - Nama lengkap, email, password, konfirmasi password
  - Auto-login setelah register

Step 2: Setup Bisnis (/onboarding/business)
  - Nama bisnis
  - Jenis usaha (dropdown: Coffee Shop, Restaurant, Vape Store, Barbershop, Retail, F&B, Laundry, Other)
  - Nomor telepon bisnis
  - Alamat (opsional)
  - Logo upload (opsional, bisa skip)

Step 3: Buat Outlet Pertama (/onboarding/outlet)
  - Nama outlet (e.g. "Cabang Pusat")
  - Alamat outlet
  - Jam operasional (open/close time)

Step 4: Selesai → redirect ke /dashboard
```

### 1.4 Pages & Routes

```
src/app/
  (auth)/
    login/page.tsx         — Login form (email + password)
    register/page.tsx      — Register form + auto-redirect ke onboarding
    forgot-password/page.tsx — Request reset link
  (onboarding)/
    layout.tsx             — Minimal layout tanpa sidebar (progress stepper)
    business/page.tsx      — Step 2: Setup bisnis
    outlet/page.tsx        — Step 3: Buat outlet pertama
    complete/page.tsx      — Step 4: Success + redirect
  (dashboard)/
    layout.tsx             — Full layout dengan sidebar (requires auth)
    dashboard/page.tsx     — Existing dashboard (update dengan real data later)
```

### 1.5 Server Actions & API

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

### 1.6 Middleware

```typescript
// middleware.ts
- Protected routes: /dashboard/*, /onboarding/*
- If not authenticated → redirect /login
- If authenticated but no business → redirect /onboarding/business
- If authenticated + business but no outlet → redirect /onboarding/outlet
```

### 1.7 UI Components Needed (reuse existing)

- Existing: Input, Button, Select, Badge, Logo
- New: `StepIndicator` (progress dots for onboarding wizard)
- New: `BusinessTypeSelector` (visual card picker for jenis usaha)

### 1.8 Deliverables Checklist

```
- [ ] Install dependencies: next-auth@5, @auth/prisma-adapter, prisma, @prisma/client, bcryptjs, zod
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

---

## Phase 2: RBAC + Employee Management

**Goal:** Role-based access control dan manajemen karyawan per-outlet.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 1

### 2.1 Database Schema (tambahan)

```prisma
enum DefaultRole {
  OWNER
  ADMIN
  MANAGER
  CASHIER
  WAREHOUSE
}

model Role {
  id          String   @id @default(cuid())
  businessId  String
  name        String          // "Owner", "Admin", "Kasir", custom...
  permissions String[]        // ["pos.access", "products.manage", "reports.view", ...]
  isSystem    Boolean  @default(false)  // system roles can't be deleted
  createdAt   DateTime @default(now())

  business    Business   @relation(fields: [businessId], references: [id], onDelete: Cascade)
  employees   Employee[]

  @@unique([businessId, name])
}

model Employee {
  id          String   @id @default(cuid())
  businessId  String
  userId      String?         // linked user account (nullable for invited-but-not-registered)
  outletId    String?         // assigned outlet (null = all outlets)
  roleId      String
  name        String
  email       String?
  phone       String?
  pin         String?         // 4-6 digit PIN for kasir operations
  isActive    Boolean  @default(true)
  startDate   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user        User?         @relation(fields: [userId], references: [id])
  outlet      Outlet?       @relation(fields: [outletId], references: [id])
  role        Role          @relation(fields: [roleId], references: [id])
  transactions Transaction[]
}
```

### 2.2 Permission System

```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  // Dashboard
  "dashboard.view": "Lihat dashboard",
  
  // POS
  "pos.access": "Akses kasir",
  "pos.void": "Void transaksi",
  "pos.refund": "Refund transaksi",
  "pos.discount": "Beri diskon manual",
  
  // Products
  "products.view": "Lihat produk",
  "products.manage": "Kelola produk (CRUD)",
  "products.pricing": "Ubah harga",
  
  // Inventory
  "inventory.view": "Lihat stok",
  "inventory.manage": "Kelola stok (adjustment, transfer)",
  
  // Reports
  "reports.view": "Lihat laporan",
  "reports.export": "Export laporan",
  
  // Employees
  "employees.view": "Lihat karyawan",
  "employees.manage": "Kelola karyawan",
  
  // Outlets
  "outlets.view": "Lihat outlet",
  "outlets.manage": "Kelola outlet",
  
  // Settings
  "settings.manage": "Kelola pengaturan",
  "settings.roles": "Kelola role & permission",
  
  // Customers
  "customers.view": "Lihat pelanggan",
  "customers.manage": "Kelola pelanggan",
  
  // Promos
  "promos.view": "Lihat promo",
  "promos.manage": "Kelola promo",
} as const;

// Default role templates
export const DEFAULT_ROLES = {
  OWNER: Object.keys(PERMISSIONS),  // all permissions
  ADMIN: [...all except settings.roles],
  MANAGER: ["dashboard.view", "pos.access", "pos.discount", "products.view", "inventory.view", "reports.view", "employees.view", "customers.view"],
  CASHIER: ["pos.access", "products.view", "customers.view"],
  WAREHOUSE: ["inventory.view", "inventory.manage", "products.view"],
};
```

### 2.3 Pages & Routes

```
src/app/(dashboard)/
  employees/
    page.tsx              — Daftar karyawan (table + search + filter by outlet/role)
    [id]/page.tsx         — Detail karyawan
    new/page.tsx          — Tambah karyawan baru
  roles/
    page.tsx              — Daftar role + permission matrix
    [id]/page.tsx         — Edit role permissions
    new/page.tsx          — Buat role baru
```

### 2.4 Features

- CRUD karyawan (nama, email, phone, PIN, role, outlet assignment)
- Invite karyawan via email (optional — bisa manual dulu)
- PIN kasir (4-6 digit) untuk operasi POS
- Role management: buat role custom, assign permissions
- Permission check middleware per-route dan per-action
- Employee list: filter by outlet, role, status

### 2.5 Server Actions

```typescript
// src/actions/employees.ts
getEmployees(filters)        — List with pagination + filters
getEmployee(id)              — Detail
createEmployee(data)         — Create + assign role/outlet
updateEmployee(id, data)     — Update
toggleEmployeeStatus(id)     — Activate/deactivate
setEmployeePin(id, pin)      — Set/reset kasir PIN

// src/actions/roles.ts
getRoles()                   — List roles for business
createRole(data)             — Create custom role
updateRolePermissions(id, permissions) — Update
deleteRole(id)               — Delete (if not system role)
```

### 2.6 Deliverables Checklist

```
- [ ] Add Role + Employee models to Prisma schema
- [ ] Create migration
- [ ] Seed default roles on business creation (Owner, Admin, Kasir)
- [ ] Build permission checking utility (hasPermission, requirePermission)
- [ ] Build employee list page with filters
- [ ] Build add/edit employee form
- [ ] Build role management page with permission matrix
- [ ] Add PIN setup for kasir
- [ ] Protect routes based on permissions
- [ ] Update sidebar nav to show/hide items based on role
- [ ] Test: create employee, assign role, verify access
- [ ] Commit
```

---

## Phase 3: Product & Category Management

**Goal:** CRUD produk dan kategori, varian, gambar produk.  
**Estimasi:** 4-5 hari  
**Dependencies:** Phase 2

### 3.1 Database Schema (tambahan)

```prisma
model Category {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  description String?
  icon        String?       // emoji or icon name
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  products    Product[]

  @@unique([businessId, name])
}

model Product {
  id          String   @id @default(cuid())
  businessId  String
  categoryId  String?
  sku         String?
  barcode     String?
  name        String
  description String?
  image       String?
  basePrice   Float           // harga dasar
  costPrice   Float?          // harga modal (HPP)
  isActive    Boolean  @default(true)
  trackStock  Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business       @relation(fields: [businessId], references: [id], onDelete: Cascade)
  category    Category?      @relation(fields: [categoryId], references: [id])
  variants    ProductVariant[]
  stocks      Stock[]
  toppings    ProductTopping[]
  transactionItems TransactionItem[]
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  name        String          // "Size S", "Size M", "Reguler", "Spesial"
  sku         String?
  priceAdjustment Float @default(0)  // tambahan harga dari basePrice
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  stocks      Stock[]
  transactionItems TransactionItem[]
}

model ProductTopping {
  id          String   @id @default(cuid())
  productId   String
  name        String          // "Extra Shot", "Boba", "Cheese"
  price       Float
  isActive    Boolean  @default(true)

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  transactionItems TransactionItemTopping[]
}
```

### 3.2 Pages & Routes

```
src/app/(dashboard)/
  products/
    page.tsx              — Product list (grid/table view toggle)
    [id]/page.tsx         — Product detail + variants + stock info
    new/page.tsx          — Tambah produk baru
    [id]/edit/page.tsx    — Edit produk
  categories/
    page.tsx              — Category list (drag-sortable)
    new/page.tsx          — Tambah kategori
```

### 3.3 Features

- CRUD produk (nama, harga, kategori, gambar, SKU, barcode)
- Product variants (size, rasa, dll) — tiap varian bisa punya harga berbeda
- Topping/add-on per produk (opsional, cocok untuk F&B)
- Category management (reorder, icon)
- Product grid view (card layout) + table view
- Search + filter by category, status, price range
- Bulk actions: activate/deactivate, delete
- Image upload (local storage dulu, S3 later)
- Import/export produk via CSV (opsional)

### 3.4 Server Actions

```typescript
// src/actions/products.ts
getProducts(filters)         — List with pagination, search, category filter
getProduct(id)               — Detail + variants + toppings
createProduct(data)          — Create product
updateProduct(id, data)      — Update
deleteProduct(id)            — Soft delete (isActive = false)
bulkUpdateProducts(ids, data) — Bulk status update

// src/actions/categories.ts
getCategories()              — List with product count
createCategory(data)         — Create
updateCategory(id, data)     — Update
reorderCategories(ids)       — Update sort order
deleteCategory(id)           — Delete (move products to uncategorized)

// src/actions/variants.ts
addVariant(productId, data)    — Add variant
updateVariant(id, data)        — Update
deleteVariant(id)              — Delete

// src/actions/toppings.ts
addTopping(productId, data)    — Add topping
updateTopping(id, data)        — Update
deleteTopping(id)              — Delete
```

### 3.5 Deliverables Checklist

```
- [ ] Add Category, Product, ProductVariant, ProductTopping to schema
- [ ] Create migration
- [ ] Build category list page (with sort)
- [ ] Build category create/edit form
- [ ] Build product list page (grid + table view)
- [ ] Build product create form (with variant + topping sections)
- [ ] Build product edit page
- [ ] Build product detail view
- [ ] Image upload functionality (local storage)
- [ ] Search + filter + pagination
- [ ] Bulk actions (activate/deactivate)
- [ ] Update nav sidebar for products/categories
- [ ] Test full CRUD flow
- [ ] Commit
```

---

## Phase 4: Inventory & Stock Management

**Goal:** Stock tracking per outlet, stock opname, transfer antar outlet.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 3

### 4.1 Database Schema (tambahan)

```prisma
model Stock {
  id          String   @id @default(cuid())
  outletId    String
  productId   String
  variantId   String?
  quantity    Int      @default(0)
  minStock    Int      @default(5)    // alert threshold
  updatedAt   DateTime @updatedAt

  outlet      Outlet         @relation(fields: [outletId], references: [id])
  product     Product        @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  movements   StockMovement[]

  @@unique([outletId, productId, variantId])
}

enum StockMovementType {
  IN          // restock / purchase
  OUT         // sold / damaged / expired
  ADJUSTMENT  // manual correction
  TRANSFER    // moved between outlets
  OPNAME      // stock count correction
}

model StockMovement {
  id          String            @id @default(cuid())
  stockId     String
  type        StockMovementType
  quantity    Int               // positive = in, negative = out
  note        String?
  reference   String?           // transaction_id, transfer_id, etc
  createdBy   String?           // employee/user who did it
  createdAt   DateTime          @default(now())

  stock       Stock @relation(fields: [stockId], references: [id])
}

model StockTransfer {
  id              String   @id @default(cuid())
  businessId      String
  fromOutletId    String
  toOutletId      String
  status          String   @default("pending") // pending, in_transit, received, cancelled
  note            String?
  createdBy       String
  createdAt       DateTime @default(now())
  completedAt     DateTime?

  items           StockTransferItem[]
}

model StockTransferItem {
  id          String @id @default(cuid())
  transferId  String
  productId   String
  variantId   String?
  quantity    Int

  transfer    StockTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
}
```

### 4.2 Pages & Routes

```
src/app/(dashboard)/
  inventory/
    page.tsx              — Stock overview (semua produk + qty per outlet)
    adjustments/page.tsx  — Stock adjustment log
    transfers/page.tsx    — Transfer history
    transfers/new/page.tsx — Buat transfer baru
    opname/page.tsx       — Stock opname (count)
    low-stock/page.tsx    — Low stock alerts
```

### 4.3 Features

- Stock overview per outlet (product, variant, qty, min stock)
- Low stock alerts (produk di bawah threshold)
- Stock adjustment (tambah/kurang manual + alasan)
- Stock transfer antar outlet (create, approve, receive)
- Stock opname (input qty actual, auto-adjustment)
- Movement history log (siapa, kapan, berapa, alasan)
- Auto-decrement saat transaksi (integrated di Phase 5)

### 4.4 Deliverables Checklist

```
- [ ] Add Stock, StockMovement, StockTransfer, StockTransferItem to schema
- [ ] Create migration
- [ ] Build stock overview page (table with outlet filter)
- [ ] Build stock adjustment form
- [ ] Build stock transfer flow (create → approve → receive)
- [ ] Build stock opname page
- [ ] Build low stock alert page
- [ ] Build movement history log
- [ ] Update nav sidebar
- [ ] Test: add stock, adjust, transfer, opname
- [ ] Commit
```

---

## Phase 5: POS Kasir (Transaction Interface)

**Goal:** Interface kasir untuk membuat transaksi, termasuk open bill.  
**Estimasi:** 5-7 hari  
**Dependencies:** Phase 3, Phase 4

### 5.1 Database Schema (tambahan)

```prisma
enum TransactionStatus {
  OPEN        // open bill / belum bayar
  COMPLETED   // sudah bayar
  VOIDED      // dibatalkan
  REFUNDED    // refund
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
  employeeId    String            // kasir yang handle
  customerId    String?
  
  // Order info
  orderNumber   String            // auto-generated: "TRX-YYYYMMDD-001"
  orderType     OrderType         @default(DINE_IN)
  tableNumber   String?
  customerName  String?           // walk-in customer name
  note          String?
  
  // Amounts
  subtotal      Float             // sum of items
  discountAmount Float     @default(0)
  discountType  String?           // "percentage" or "fixed"
  discountValue Float?            // original discount value
  taxAmount     Float      @default(0)
  serviceAmount Float      @default(0)
  totalAmount   Float             // final amount to pay
  paidAmount    Float      @default(0)
  changeAmount  Float      @default(0)
  
  // Payment
  paymentMethod PaymentMethod?
  paymentRef    String?           // reference number (QRIS, transfer)
  
  // Status
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
  variantName     String?         // snapshot nama varian
  quantity        Int
  unitPrice       Float           // harga satuan (base + variant adjustment)
  discount        Float    @default(0)
  subtotal        Float           // (unitPrice - discount) * quantity + toppings
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
  name                String   // snapshot
  price               Float    // snapshot

  transactionItem     TransactionItem @relation(fields: [transactionItemId], references: [id], onDelete: Cascade)
  topping             ProductTopping  @relation(fields: [toppingId], references: [id])
}

model Refund {
  id              String   @id @default(cuid())
  transactionId   String   @unique
  amount          Float
  reason          String
  method          PaymentMethod
  processedBy     String   // employee who processed
  createdAt       DateTime @default(now())

  transaction     Transaction @relation(fields: [transactionId], references: [id])
}
```

### 5.2 Pages & Routes

```
src/app/(pos)/
  layout.tsx              — Full-screen POS layout (no sidebar, minimal chrome)
  page.tsx                — POS Kasir interface
  
src/app/(dashboard)/
  transactions/
    page.tsx              — Transaction history list
    [id]/page.tsx         — Transaction detail + receipt view
  open-bills/
    page.tsx              — Open bills list
```

### 5.3 POS Interface Layout

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
│                         │                               │
└─────────────────────────┴───────────────────────────────┘
```

### 5.4 Features

- Full-screen POS interface (separate from admin dashboard)
- Product grid with category filter tabs
- Product search (real-time)
- Add to cart (click product → select variant → select toppings → add)
- Cart management (qty +/-, remove, note per item)
- Discount per item atau per transaksi (% or fixed)
- Auto-calculate: subtotal, tax, service charge, total
- Order type selection (Dine-in, Takeaway, Delivery)
- Table number (for dine-in)
- Customer search/assign
- Open bill (save transaction as OPEN, revisit later)
- Payment flow → Phase 6
- Void transaction (require PIN authorization)
- Receipt view + print button

### 5.5 Deliverables Checklist

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
- [ ] Test full POS flow: add items → variants → toppings → save/pay
- [ ] Commit
```

---

## Phase 6: Payment (Cash + QRIS)

**Goal:** Proses pembayaran cash dan QRIS.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 5

### 6.1 Payment Flow

```
User clicks [BAYAR] on POS
  → Payment modal opens
  → Select payment method (Cash / QRIS)
  
Cash flow:
  → Input nominal dibayar
  → Show kembalian
  → Confirm → mark COMPLETED → print receipt

QRIS flow:
  → Generate/show QR code (static QRIS dari settings)
  → Kasir input reference number
  → Confirm → mark COMPLETED → print receipt
```

### 6.2 Pages & Components

```
src/components/pos/
  payment-modal.tsx       — Payment method selection + flow
  cash-payment.tsx        — Cash input + change calculator
  qris-payment.tsx        — QR display + reference input
  receipt-preview.tsx     — Receipt layout for print
  
src/app/(dashboard)/
  payments/
    page.tsx              — Payment summary report
```

### 6.3 Features

- Cash payment: input paid amount, auto-calculate change
- QRIS: display static QR (from business settings), manual confirm
- Split payment (partial cash + partial QRIS) — optional
- Receipt generation (HTML-based, print via browser print)
- Thermal printer support (ESC/POS) — basic via USB/BT browser API
- Payment history tied to transactions
- Daily payment summary

### 6.4 Deliverables Checklist

```
- [ ] Build payment modal component
- [ ] Build cash payment flow (input + change)
- [ ] Build QRIS payment flow (QR display + confirm)
- [ ] Build receipt preview component
- [ ] Build print receipt functionality (browser print / ESC-POS)
- [ ] Connect payment to transaction (mark completed)
- [ ] Build reprint receipt from transaction history
- [ ] Add QRIS settings to business config
- [ ] Build payment summary page
- [ ] Test: full transaction → cash pay → receipt
- [ ] Test: full transaction → QRIS pay → receipt
- [ ] Commit
```

---

## Phase 7: Dashboard & Reports

**Goal:** Real dashboard dengan data aktual + laporan-laporan.  
**Estimasi:** 4-5 hari  
**Dependencies:** Phase 5, Phase 6

### 7.1 Pages & Routes

```
src/app/(dashboard)/
  dashboard/page.tsx      — Real-time dashboard (update from static)
  reports/
    sales/page.tsx        — Laporan penjualan (daily/weekly/monthly)
    products/page.tsx     — Laporan produk terlaris
    cashier/page.tsx      — Laporan per kasir/shift
    inventory/page.tsx    — Laporan stok (movement, valuation)
    export/page.tsx       — Export PDF/Excel
```

### 7.2 Dashboard Widgets

- Penjualan hari ini (total amount, transaction count)
- Perbandingan vs kemarin/minggu lalu
- Grafik omzet 7 hari / 30 hari (line chart)
- Top 10 produk terlaris
- Transaksi terbaru (live feed)
- Low stock alerts
- Revenue per outlet (jika multi-outlet)
- Payment method breakdown (pie chart)

### 7.3 Reports Features

- **Laporan Penjualan:** Filter by date range, outlet, kasir. Tabel + grafik.
- **Laporan Produk:** Produk terlaris, least sold, revenue per produk.
- **Laporan Kasir:** Transaksi per kasir, average, total. Shift closing.
- **Laporan Inventori:** Stock movement, stock valuation, shrinkage.
- **Export:** PDF (via react-pdf or html-to-pdf) + Excel (xlsx)

### 7.4 Chart Library

```
Pilihan: recharts (React-native charts, lightweight)
Install: npm install recharts
```

### 7.5 Deliverables Checklist

```
- [ ] Install recharts
- [ ] Build real dashboard with actual data queries
- [ ] Build sales report page (with date filter)
- [ ] Build product report page
- [ ] Build cashier report page
- [ ] Build inventory report page
- [ ] Build chart components (line, bar, pie)
- [ ] Build export to PDF functionality
- [ ] Build export to Excel functionality
- [ ] Add date range picker component
- [ ] Test reports with sample data
- [ ] Commit
```

---

## Phase 8: Customer & CRM

**Goal:** Database pelanggan, membership/loyalty dasar.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 5

### 8.1 Database Schema (tambahan)

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

### 8.2 Pages & Routes

```
src/app/(dashboard)/
  customers/
    page.tsx              — Customer list (search, sort by visits/spent)
    [id]/page.tsx         — Customer detail + transaction history
    new/page.tsx          — Tambah customer
```

### 8.3 Features

- CRUD customer (nama, phone, email, alamat, catatan)
- Customer search di POS (assign ke transaksi)
- Auto-update: total visits, total spent, last visit
- Customer transaction history
- Top customers leaderboard
- Export customer list

### 8.4 Deliverables Checklist

```
- [ ] Add Customer model to schema
- [ ] Create migration
- [ ] Build customer list page (with search + sort)
- [ ] Build customer detail page (with transaction history)
- [ ] Build add/edit customer form
- [ ] Integrate customer search in POS
- [ ] Auto-update customer stats on transaction
- [ ] Build top customers view
- [ ] Commit
```

---

## Phase 9: Promo & Discount Management

**Goal:** Kelola promo, diskon otomatis, voucher.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 5

### 9.1 Database Schema (tambahan)

```prisma
enum PromoType {
  PRODUCT_DISCOUNT    // diskon per produk
  TRANSACTION_DISCOUNT // diskon per transaksi (min. subtotal)
  BUY_X_GET_Y        // beli X gratis Y
  VOUCHER             // kode voucher
}

model Promo {
  id            String    @id @default(cuid())
  businessId    String
  name          String
  description   String?
  type          PromoType
  
  // Discount config
  discountType  String          // "percentage" or "fixed"
  discountValue Float           // value (e.g. 10 for 10%, or 5000 for Rp 5.000)
  maxDiscount   Float?          // cap for percentage discounts
  minPurchase   Float?          // minimum subtotal for transaction discounts
  
  // Scope
  productIds    String[]        // applicable products (empty = all)
  categoryIds   String[]        // applicable categories (empty = all)
  
  // Voucher
  voucherCode   String?  @unique
  maxUsage      Int?            // max redemptions
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

### 9.2 Pages & Routes

```
src/app/(dashboard)/
  promos/
    page.tsx              — Promo list (active/expired/upcoming)
    [id]/page.tsx         — Promo detail + usage stats
    new/page.tsx          — Buat promo baru
```

### 9.3 Features

- CRUD promo (nama, type, diskon, schedule, scope)
- Promo types: product discount, transaction discount, voucher
- Auto-apply promo di POS (jika conditions met)
- Voucher code input di POS
- Promo schedule (start/end date)
- Usage tracking (berapa kali dipakai)
- Promo report (efektivitas, ROI)

### 9.4 Deliverables Checklist

```
- [ ] Add Promo model to schema
- [ ] Create migration
- [ ] Build promo list page (tabs: active/expired/upcoming)
- [ ] Build create promo form (type-specific fields)
- [ ] Build promo detail + usage stats
- [ ] Integrate auto-apply promo in POS
- [ ] Build voucher code input in POS
- [ ] Build promo report (usage, savings)
- [ ] Commit
```

---

## Phase 10: Outlet Management + Multi-Outlet

**Goal:** Kelola multiple outlet, switch outlet context.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 1

### 10.1 Pages & Routes

```
src/app/(dashboard)/
  outlets/
    page.tsx              — Outlet list (all outlets)
    [id]/page.tsx         — Outlet detail + stats
    new/page.tsx          — Tambah outlet baru
    [id]/edit/page.tsx    — Edit outlet
```

### 10.2 Features

- CRUD outlet (nama, alamat, jam operasional, phone)
- Outlet switcher di topbar/sidebar (switch active outlet)
- Per-outlet stats (revenue, transactions, employees)
- Outlet comparison view
- Activate/deactivate outlet
- Data isolation: transaksi, stok, karyawan per outlet

### 10.3 Deliverables Checklist

```
- [ ] Build outlet list page
- [ ] Build outlet create/edit form
- [ ] Build outlet detail page with stats
- [ ] Build outlet switcher component (topbar dropdown)
- [ ] Update all queries to filter by active outlet
- [ ] Build outlet comparison dashboard
- [ ] Test multi-outlet data isolation
- [ ] Commit
```

---

## Phase 11: System Settings

**Goal:** Konfigurasi bisnis, pajak, struk, dll.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 1

### 11.1 Pages & Routes

```
src/app/(dashboard)/
  settings/
    page.tsx              — Settings overview (redirect to sub-pages)
    business/page.tsx     — Profil bisnis (nama, logo, alamat)
    tax/page.tsx          — Pengaturan pajak + service charge
    receipt/page.tsx      — Template struk (header, footer, format)
    payment/page.tsx      — Payment method config (QRIS setup, etc)
    general/page.tsx      — General settings (currency, language, timezone)
```

### 11.2 Features

- Business profile edit (nama, logo, alamat, contact)
- Tax configuration (PPN rate, inclusive/exclusive)
- Service charge configuration (rate, auto-apply toggle)
- Receipt template (custom header text, footer text, show/hide fields)
- Payment method settings (enable/disable, QRIS image upload)
- General settings (currency symbol, date format, language)
- Account settings (change password, profile)

### 11.3 Deliverables Checklist

```
- [ ] Build settings layout with sub-navigation
- [ ] Build business profile page
- [ ] Build tax & service charge settings
- [ ] Build receipt template settings
- [ ] Build payment method settings
- [ ] Build general settings page
- [ ] Build account/password change
- [ ] Connect settings to POS (tax auto-apply, receipt template)
- [ ] Commit
```

---

## Phase 12: Shift & Kasir Closing

**Goal:** Shift management dan closing kasir.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 5, Phase 6

### 12.1 Database Schema (tambahan)

```prisma
model CashierShift {
  id            String   @id @default(cuid())
  outletId      String
  employeeId    String
  
  startTime     DateTime @default(now())
  endTime       DateTime?
  
  openingCash   Float           // cash di laci saat buka shift
  closingCash   Float?          // cash di laci saat tutup shift
  expectedCash  Float?          // calculated: opening + cash sales
  difference    Float?          // closing - expected (selisih)
  
  totalSales    Float    @default(0)
  totalTransactions Int  @default(0)
  totalRefunds  Float    @default(0)
  
  note          String?
  status        String   @default("open") // open, closed
  
  createdAt     DateTime @default(now())
}
```

### 12.2 Features

- Open shift: kasir input cash awal di laci
- During shift: track semua transaksi
- Close shift: input cash akhir, system calculate selisih
- Shift report: summary per shift (sales, refunds, payment breakdown)
- Shift history per kasir
- Manager approval for shift closing (optional)

### 12.3 Deliverables Checklist

```
- [ ] Add CashierShift model to schema
- [ ] Create migration
- [ ] Build open shift modal (input opening cash)
- [ ] Require open shift before POS access
- [ ] Build close shift flow (input closing cash + summary)
- [ ] Build shift report view
- [ ] Build shift history page
- [ ] Enforce shift in POS operations
- [ ] Commit
```

---

## Phase 13: Printer & Receipt Integration

**Goal:** Print struk ke thermal printer.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 6

### 13.1 Features

- Browser print (window.print with receipt CSS)
- ESC/POS protocol via Web Serial API (Chrome)
- Bluetooth thermal printer via Web Bluetooth API
- Receipt templates (configurable dari settings)
- Kitchen order ticket (KOT) printing — add-on
- Cash drawer trigger

### 13.2 Receipt Format

```
================================
       [NAMA BISNIS]
    [ALAMAT OUTLET]
    [PHONE OUTLET]
================================
No: TRX-20260703-001
Tanggal: 03/07/2026 14:30
Kasir: Budi
Tipe: Dine-In | Meja: 5
--------------------------------
Kopi Susu L    2 x  25.000
  + Extra Shot        5.000
Croissant      1 x  18.000
--------------------------------
Subtotal:           73.000
Diskon (10%):       -7.300
PPN (11%):          +7.227
Service (5%):       +3.285
================================
TOTAL:              76.212
Bayar (Cash):       80.000
Kembali:             3.788
================================
    Terima kasih!
  Selamat menikmati ☕
================================
```

### 13.3 Deliverables Checklist

```
- [ ] Build receipt HTML template component
- [ ] Build browser print (CSS @media print)
- [ ] Build ESC/POS encoder utility
- [ ] Build Web Serial API connection (USB printer)
- [ ] Build Web Bluetooth connection (BT printer)
- [ ] Build printer settings page (select printer, test print)
- [ ] Build kitchen order ticket (KOT) template
- [ ] Connect receipt to transaction detail (reprint)
- [ ] Commit
```

---

## Phase 14: Add-ons (Optional Modules)

**Goal:** Fitur tambahan yang bisa di-enable/disable.  
**Estimasi:** 1-2 hari per add-on  
**Dependencies:** All previous phases

### 14.1 Available Add-ons

| Add-on | Description | Depends on |
|--------|-------------|------------|
| Barcode/SKU | Generate SKU, scan barcode, label printing | Phase 3 |
| Kitchen Order Ticket | Print order ke kitchen/bar station | Phase 5, 13 |
| Table Management | Area meja, denah, status meja | Phase 5 |
| E-Wallet Payment | GoPay, OVO, Dana, LinkAja | Phase 6 |
| Debit/Credit/EDC | Payment gateway integration | Phase 6 |
| Loyalty Program | Point system, member tiers | Phase 8 |
| Multi-language | Support English + Bahasa | Phase 11 |
| Dark Mode | Dark theme toggle | All |
| Mobile App (PWA) | Installable PWA | All |
| API Public | Public API for integrations | All |

### 14.2 Table Management Schema (example)

```prisma
model TableArea {
  id          String @id @default(cuid())
  outletId    String
  name        String        // "Indoor", "Outdoor", "VIP"
  tables      Table[]
}

model Table {
  id          String @id @default(cuid())
  areaId      String
  number      String        // "1", "2", "VIP-1"
  capacity    Int    @default(4)
  status      String @default("available") // available, occupied, reserved, cleaning
  posX        Float?        // for floor plan
  posY        Float?
  
  area        TableArea @relation(fields: [areaId], references: [id])
}
```

---

## Summary: Phase Execution Order

| Phase | Nama | Estimasi | Priority |
|-------|------|----------|----------|
| **1** | Auth + Onboarding + Business Setup | 3-5 hari | **P0** |
| **2** | RBAC + Employee Management | 3-4 hari | **P0** |
| **3** | Product & Category Management | 4-5 hari | **P0** |
| **4** | Inventory & Stock Management | 3-4 hari | **P0** |
| **5** | POS Kasir (Transaction Interface) | 5-7 hari | **P0** |
| **6** | Payment (Cash + QRIS) | 3-4 hari | **P0** |
| **7** | Dashboard & Reports | 4-5 hari | **P0** |
| **8** | Customer & CRM | 2-3 hari | **P1** |
| **9** | Promo & Discount | 3-4 hari | **P1** |
| **10** | Outlet Management + Multi-Outlet | 2-3 hari | **P1** |
| **11** | System Settings | 2-3 hari | **P1** |
| **12** | Shift & Kasir Closing | 2-3 hari | **P1** |
| **13** | Printer & Receipt | 2-3 hari | **P1** |
| **14** | Add-ons (per module) | 1-2 hari each | **P2** |

**Total estimasi: ~40-55 hari kerja untuk full MVP (Phase 1-13)**

---

## How to Execute

Bilang saja:
- `"jalankan phase-1"` → Saya akan implement Auth + Onboarding + Business Setup
- `"jalankan phase-2"` → Saya akan implement RBAC + Employee Management
- dst.

Setiap phase akan:
1. Update Prisma schema (jika ada model baru)
2. Run migration
3. Build semua pages + components
4. Test the flow
5. Commit dengan pesan yang jelas

---

**Document Version:** 1.0  
**Last Updated:** 3 Juli 2026  
**Status:** Draft for Review
