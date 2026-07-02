# Bayaro Admin Template — Design Spec

**Date:** 2026-07-02

## Goal

Convert the existing Bayaro POS (Next.js + Prisma + Auth) codebase into a fully static, reusable admin template — similar to ThemeForest admin templates — retaining the Bayaro design language (navy sidebar, ultra-rounded cards, glassmorphism, Manrope/Sora fonts) but replacing all dynamic backend code with static/dummy data.

## What Gets Removed

- `/src/app/api/` — all 44 API route files
- `/prisma/` — database schema, migrations, seed
- `/middleware.ts` — auth redirect middleware
- `/src/lib/auth.ts` — requireSession, getSession
- `/src/lib/prisma.ts` — Prisma client singleton
- `/src/lib/validations.ts` — Zod schemas
- `/src/lib/report-filters.ts` — report query builder
- `/src/components/forms/` — all form manager components (API-dependent)
- `/src/components/kasir/` — POS screen
- `/src/components/transactions/` — transaction list manager
- `/src/components/products/` — product catalog/detail managers
- `/src/components/shared/logout-form.tsx` — uses server action
- Dependencies removed: `@prisma/client`, `prisma`, `bcryptjs`, `jose`, `zod`

## What Gets Kept & Simplified

- Design system: `tailwind.config.ts`, `globals.css` (fonts, colors, shadows)
- Layout components: `Sidebar`, `Topbar`, `DashboardShell`, `PageHeader`
- UI primitives: `Button`, `Input`, `Textarea`, `Badge`
- Shared: `BayaroLogo`, `EmptyState`
- `src/lib/utils.ts` — cn(), rupiah(), formatDate(), etc.
- `src/lib/nav.ts` — updated with new admin template nav structure

## New Route Structure

```
src/app/
  (auth)/
    login/page.tsx              — Static login form (no action)
    register/page.tsx           — Static registration form
    forgot-password/page.tsx    — Static forgot password
  (dashboard)/
    layout.tsx                  — Simplified (no auth check, hardcoded user)
    dashboard/page.tsx          — Static stats + chart + recent activity
    ui/
      tables/page.tsx           — Basic table + DataTable demo
      forms/page.tsx            — All form elements showcase
      cards/page.tsx            — Card variants
      modals/page.tsx           — Modal/dialog variants
      buttons/page.tsx          — Button + Badge variants
      alerts/page.tsx           — Alert + Toast demos
    pages/
      calendar/page.tsx         — Monthly calendar with static events
      kanban/page.tsx           — Kanban board with static columns
      file-manager/page.tsx     — File grid/list explorer
      chat/page.tsx             — Chat UI with static messages
      invoice/page.tsx          — Invoice detail view
      pricing/page.tsx          — Pricing tier comparison
    profile/page.tsx            — User profile page
    settings/page.tsx           — Settings form page
```

## New Navigation Structure

```
Ringkasan: Dashboard
UI Elements: Tables, Forms, Cards, Modals, Buttons & Badges, Alerts
Pages: Calendar, Kanban, File Manager, Chat, Invoice, Pricing
User: Profile, Settings
```

## New UI Components Added

- `src/components/ui/alert.tsx` — info/success/warning/error variants
- `src/components/ui/select.tsx` — styled select wrapper
- `src/components/ui/checkbox.tsx` — styled checkbox
- `src/components/ui/switch.tsx` — toggle switch
- `src/components/ui/radio.tsx` — styled radio group

## Design Language (Preserved)

- **Colors:** bayaro-navy (#0A1F54), bayaro-blue (#135FEF), bayaro-aqua (#22D3EE)
- **Background:** radial-gradient aqua + linear blue-white (globals.css)
- **Sidebar:** #071a49 navy, white text, rounded-2xl active items
- **Cards:** rounded-[24px] or rounded-[28px] with shadow-soft
- **Main content:** bg-white/42 backdrop-blur (glassmorphism)
- **Fonts:** Manrope (body), Sora (headings)
- **Border radius:** rounded-2xl for inputs/buttons, rounded-[28px] for panels

## Static Data Strategy

All pages use hardcoded dummy data defined at the top of each page file in a `const` block. No external data fetching. All interactivity (modals, tabs, filters, kanban drag) is client-side state only.
