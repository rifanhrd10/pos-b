# Phase 14: Add-ons (Optional Modules)

**Goal:** Fitur tambahan yang bisa di-enable/disable per bisnis.  
**Estimasi:** 1-2 hari per add-on  
**Dependencies:** All previous phases  
**Priority:** P2

---

## 1. Add-on Registry

| # | Add-on | Description | Depends on |
|---|--------|-------------|------------|
| 1 | Barcode/SKU | Generate SKU, scan barcode, label printing | Phase 3 |
| 2 | Kitchen Order Ticket | Print order ke kitchen/bar station | Phase 5, 13 |
| 3 | Table Management | Area meja, denah, status meja | Phase 5 |
| 4 | E-Wallet Payment | GoPay, OVO, Dana, LinkAja | Phase 6 |
| 5 | Debit/Credit/EDC | Payment gateway integration | Phase 6 |
| 6 | Loyalty Program | Point system, member tiers | Phase 8 |
| 7 | Multi-language | Support English + Bahasa | Phase 11 |
| 8 | Dark Mode | Dark theme toggle | All |
| 9 | PWA (Mobile) | Installable Progressive Web App | All |
| 10 | Public API | REST API for third-party integrations | All |

---

## 2. Add-on: Table Management

### Schema

```prisma
model TableArea {
  id          String  @id @default(cuid())
  outletId    String
  name        String        // "Indoor", "Outdoor", "VIP"
  sortOrder   Int     @default(0)
  tables      Table[]
}

model Table {
  id          String  @id @default(cuid())
  areaId      String
  number      String        // "1", "2", "VIP-1"
  capacity    Int     @default(4)
  status      String  @default("available") // available, occupied, reserved, cleaning
  posX        Float?        // for floor plan view
  posY        Float?
  
  area        TableArea @relation(fields: [areaId], references: [id])
}
```

### Features
- Area management (Indoor, Outdoor, VIP)
- Table CRUD (number, capacity)
- Table status visual (floor plan view)
- Auto-set occupied saat dine-in transaction
- Auto-set available saat transaction completed
- Merge tables (group seating)
- Reserve table (with customer name + time)

---

## 3. Add-on: Loyalty Program

### Schema

```prisma
model LoyaltyTier {
  id              String @id @default(cuid())
  businessId      String
  name            String        // "Bronze", "Silver", "Gold"
  minPoints       Int           // minimum points for this tier
  pointMultiplier Float  @default(1) // earn rate multiplier
  benefits        String[]      // descriptions
}

model LoyaltyTransaction {
  id            String   @id @default(cuid())
  customerId    String
  transactionId String?
  points        Int             // positive = earn, negative = redeem
  type          String          // "earn", "redeem", "bonus", "expired"
  description   String?
  createdAt     DateTime @default(now())
}
```

### Features
- Earn points per transaction (configurable rate: 1 point per Rp 10.000)
- Redeem points for discount
- Tier system (Bronze → Silver → Gold)
- Points expiration (configurable)
- Points history per customer
- Bonus points for birthday/anniversary

---

## 4. Add-on: Barcode/SKU

### Features
- Auto-generate SKU based on category + sequence
- Barcode scanner input in POS (via keyboard wedge or camera)
- Print barcode labels (product name + price + barcode)
- Batch print labels
- Scan to add to cart in POS

---

## 5. Add-on: Dark Mode

### Implementation
- CSS variables for all colors
- Toggle in settings (Light/Dark/System)
- Persist preference in localStorage
- Update Tailwind config for dark: variant
- Update all components to support dark mode classes

---

## 6. Add-on: PWA

### Implementation
- Add `manifest.json` (app name, icons, theme color)
- Add service worker (offline caching)
- Add install prompt
- Cache critical assets (fonts, icons, static pages)
- Offline POS mode (queue transactions, sync when online)

---

## 7. Deliverables (per add-on)

Each add-on follows:
```
- [ ] Design schema/components needed
- [ ] Implement backend (schema + actions)
- [ ] Build UI pages/components
- [ ] Add enable/disable toggle in settings
- [ ] Test the add-on
- [ ] Commit
```
