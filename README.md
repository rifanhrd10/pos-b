# Bayaro POS

Multi-tenant SaaS Point of Sale system for Food & Beverage businesses. Built with Next.js 15 App Router, supporting multiple outlets, role-based access, and full transaction management from order to reconciliation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (beta) + `@auth/prisma-adapter` |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Export | xlsx |
| Validation | Zod v4 |
| AI | Google Generative AI |
| UI Tour | driver.js |
| Icons | Lucide React |

---

## Features by Phase

### Phase 1 — Auth & Onboarding
- Email/password registration and login
- Multi-step onboarding wizard (business type, outlet setup, hours, tax/service rate)
- Guided product tour via driver.js

### Phase 2 — RBAC & Employee Management
- Custom roles with granular permission flags
- Employee creation with PIN assignment
- Role-based UI and server-action guards

### Phase 3 — Product & Category Management
- Category hierarchy with color/icon support
- Product creation with variants, pricing, and image upload
- Active/inactive toggle per product

### Phase 4 — Inventory & Stock Management
- Per-outlet stock tracking
- Stock adjustment (opname) with reason logging
- Inter-outlet stock transfers
- Low-stock alerts

### Phase 5 — POS Kasir
- Full transaction interface: category browse, cart, quantity controls
- Dine-in table selection or takeaway mode
- Order notes, item-level modifiers
- Hold/resume orders

### Phase 6 — Payment Gateway
- Cash payment with change calculation
- QRIS Static (fixed QR code per outlet)
- QRIS Dynamic (per-transaction QR via Midtrans / Xendit)
- Payment status polling

### Phase 7 — Dashboard & Reports
- KPI cards: revenue, transactions, average order value, top products
- Bar/line charts (Recharts) for daily/weekly/monthly trends
- Excel export for all report data

### Phase 8 — Customer & CRM
- Customer profiles with visit count, total spend, last visit
- Customer lookup and attachment at checkout
- Customer history and notes

### Phase 9 — Promo & Diskon
- Voucher/coupon codes with percentage or flat discount
- Bundle deals (buy X get Y / bundle pricing)
- Happy hour time-based pricing
- Promo stacking rules and order-level application

### Phase 10 — Outlet Management & Multi-outlet
- Unlimited outlet creation (plan-gated)
- Per-outlet settings: hours, address, contact
- Outlet context switching in dashboard and POS

### Phase 11 — System Settings
- Business-wide settings: tax rate, service charge, currency
- Payment method configuration (enable/disable per method)
- Business profile and branding

### Phase 12 — Shift & Kasir Closing
- Shift open/close with initial cash declaration
- Cash sales tracking during shift
- Closing reconciliation: expected cash vs actual vs difference
- Shift summary report (surplus/deficit)

### Phase 13 — Printer Integration *(pending)*
### Phase 14 — Add-ons / Marketplace *(pending)*

---

## Subscription Plans

| Plan | Outlets | Employees | Price |
|------|---------|-----------|-------|
| Starter | 1 | 5 | Free |
| Pro | 10 | 50 | Rp 199.000/mo |
| Enterprise | Unlimited | Unlimited | Rp 599.000/mo |

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- `tsx` (installed as dev dependency)

### Steps

```bash
# 1. Clone
git clone <repo-url>
cd pos-b

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 4. Run database migrations
npx prisma migrate deploy

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bayaro_pos"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Midtrans (for QRIS Dynamic)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"

# Xendit (alternative payment gateway)
XENDIT_SECRET_KEY="your-xendit-secret-key"
XENDIT_WEBHOOK_TOKEN="your-xendit-webhook-token"

# Google AI (optional, for AI features)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
```

---

## Demo Accounts

After running `npm run db:seed`, the following accounts are available:

| Role | Email | Password | POS PIN |
|------|-------|----------|---------|
| Admin | admin@bayaro.id | demo123 | 1234 |
| Manager | manager@bayaro.id | demo123 | 2222 |
| Kasir | kasir@bayaro.id | demo123 | 3333 |

Demo business: **Bayaro Coffee Demo** — 2 outlets, Pro plan, products and tables pre-seeded.

---

## Kasir Entry Flow

There are two ways to access the POS interface:

**1. Via Dashboard Login**
```
Login (email + password) → Dashboard → Select Outlet → Open POS
```

**2. Via Kasir Public Entry (PIN only)**
```
/kasir-public → Select Outlet → Enter PIN → POS Interface
```

The second flow is designed for kasir staff who don't need full dashboard access. No email/password required — just outlet selection and a 4-digit PIN.

---

## Project Structure

```
pos-b/
├── prisma/
│   ├── schema.prisma       # All data models
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── actions/            # Server actions (auth, kasir, products, reports, etc.)
│   ├── app/
│   │   ├── (auth)/         # Login, register pages
│   │   ├── (dashboard)/    # Dashboard, all management pages
│   │   ├── (kasir)/        # POS interface (authenticated)
│   │   ├── (kasir-public)/ # PIN-based POS entry
│   │   ├── onboarding/     # Multi-step setup wizard
│   │   └── api/            # API routes (webhooks, uploads)
│   ├── components/
│   │   ├── charts/         # Recharts wrappers
│   │   ├── kasir/          # POS-specific components (cart, product grid)
│   │   ├── layout/         # Sidebar, navbar, outlet switcher
│   │   ├── shared/         # Reusable UI (tables, forms, modals)
│   │   └── ui/             # Base UI primitives
│   ├── lib/
│   │   ├── auth.ts         # NextAuth config
│   │   ├── permissions.ts  # RBAC permission checks
│   │   ├── payment-gateway.ts  # Midtrans/Xendit integration
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── validations.ts  # Zod schemas
│   └── types/
│       └── next-auth.d.ts  # Session type extensions
├── docs/
│   └── phases/             # Phase-by-phase PRD documents
└── public/
    └── branding/           # Logos and brand assets
```

---

## Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:seed      # Seed demo data (runs prisma/seed.ts)

npx prisma migrate dev       # Create and apply new migration
npx prisma migrate deploy    # Apply migrations (production)
npx prisma studio            # Open Prisma Studio GUI
npx prisma generate          # Regenerate Prisma client
```

---

## Data Model Overview

Core models in `prisma/schema.prisma`:

- **User** — auth accounts (owners + employees share this table)
- **Business** — tenant root, holds settings, tax/service rates, subscription
- **Outlet** — physical locations under a business
- **Employee** — staff linked to business + user, with PIN and role
- **Role / Permission** — RBAC configuration per business
- **Product / Category** — menu/product catalog
- **Stock** — per-outlet inventory quantities
- **StockAdjustment / StockTransfer** — inventory movement audit
- **Order / OrderItem** — transaction records
- **Payment** — payment records with method and gateway reference
- **CashierSession** — shift records with opening/closing cash reconciliation
- **Customer** — CRM profiles with visit/spend tracking
- **Promo / PromoBundle / OrderPromo** — discount and promotion engine
- **Table** — dine-in table management per outlet
- **BusinessSettings / PaymentMethod** — configurable business options
- **Subscription / Plan** — SaaS billing tiers

---

## Phase Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Auth + Onboarding Wizard | Done |
| 2 | RBAC + Employee Management | Done |
| 3 | Product & Category Management | Done |
| 4 | Inventory & Stock Management | Done |
| 5 | POS Kasir Interface | Done |
| 6 | Payment Gateway (Cash, QRIS, Midtrans/Xendit) | Done |
| 7 | Dashboard & Reports + Excel Export | Done |
| 8 | Customer & CRM | Done |
| 9 | Promo & Diskon (Voucher, Bundle, Happy Hour) | Done |
| 10 | Outlet Management + Multi-outlet | Done |
| 11 | System Settings | Done |
| 12 | Shift & Kasir Closing (Cash Reconciliation) | Done |
| 13 | Printer Integration | Pending |
| 14 | Add-ons / Marketplace | Pending |
