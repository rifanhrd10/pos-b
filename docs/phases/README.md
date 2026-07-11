# Bayaro POS — Phased Implementation Overview

**Branch:** pos-b-v2  
**Date:** 3 Juli 2026  
**Status:** Active

---

## Keputusan Arsitektur

| Aspek | Keputusan |
|-------|-----------|
| Architecture | Next.js 15 Full-Stack (App Router + Server Actions) |
| Database | PostgreSQL 15 via Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) + Prisma Adapter |
| Multi-tenancy | Shared DB + `tenant_id` (business_id) |
| Onboarding | Wizard step-by-step |
| UI/Design | Bayaro admin template (navy sidebar, glassmorphism, Manrope/Sora) |
| Deployment | Vercel / VPS + Docker |

## Tech Stack

```
Frontend:  Next.js 15, TypeScript, Tailwind CSS, lucide-react
Backend:   Next.js API Routes + Server Actions
Database:  PostgreSQL 15, Prisma 6
Auth:      NextAuth.js v5 (Auth.js)
Validation: Zod
```

## Phase List

| # | File | Nama | Estimasi | Priority |
|---|------|------|----------|----------|
| 1 | [phase-01.md](./phase-01.md) | Auth + Onboarding + Business Setup | 3-5 hari | P0 |
| 2 | [phase-02.md](./phase-02.md) | RBAC + Employee Management | 3-4 hari | P0 |
| 3 | [phase-03.md](./phase-03.md) | Product & Category Management | 4-5 hari | P0 |
| 4 | [phase-04.md](./phase-04.md) | Inventory & Stock Management | 3-4 hari | P0 |
| 5 | [phase-05.md](./phase-05.md) | POS Kasir (Transaction Interface) | 5-7 hari | P0 |
| 6 | [phase-06.md](./phase-06.md) | Payment (Cash + QRIS) | 3-4 hari | P0 |
| 7 | [phase-07.md](./phase-07.md) | Dashboard & Reports | 4-5 hari | P0 |
| 8 | [phase-08.md](./phase-08.md) | Customer & CRM | 2-3 hari | P1 |
| 9 | [phase-09.md](./phase-09.md) | Promo & Discount | 3-4 hari | P1 |
| 10 | [phase-10.md](./phase-10.md) | Outlet Management + Multi-Outlet | 2-3 hari | P1 |
| 11 | [phase-11.md](./phase-11.md) | System Settings | 2-3 hari | P1 |
| 12 | [phase-12.md](./phase-12.md) | Shift & Kasir Closing | 2-3 hari | P1 |
| 13 | [phase-13.md](./phase-13.md) | Printer & Receipt | 2-3 hari | P1 |
| 14 | [phase-14.md](./phase-14.md) | Add-ons (Optional Modules) | 1-2 hari/each | P2 |

**Total: ~40-55 hari kerja untuk full MVP (Phase 1-13)**

## Cara Pakai

Bilang: `"jalankan phase-1"` → langsung eksekusi phase tersebut.

## Multi-Tenant Data Model

```
User (1) ──owns──> Business (many)
Business (1) ──has──> Outlet (many)
Business (1) ──has──> Employee (many)
Business (1) ──has──> Product (many)
Business (1) ──has──> Transaction (many)
```
