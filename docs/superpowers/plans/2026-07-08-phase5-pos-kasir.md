# Phase 5 — POS Kasir F&B

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Estimated:** 5–7 days  
**Route:** `/kasir` (terpisah dari `/dashboard`)

---

## Tujuan

Membangun POS kasir fullscreen yang dapat digunakan kasir untuk:
- Masuk dengan PIN setelah login email/password
- Membuka shift dengan modal awal kas
- Memilih meja / takeaway
- Menambahkan produk ke cart (termasuk variant + topping)
- Menerima pembayaran Cash atau QRIS
- Mencetak/menampilkan struk
- Melihat laporan transaksi shift sendiri dengan grafik
- Menutup shift

---

## Referensi Design

Folder `pos-kasir-f&b/` adalah React/Vite prototype. Komponen yang akan diadaptasi:
- `LoginScreen.tsx` → `app/(kasir)/pin/page.tsx`
- `ShiftModal.tsx` → `components/kasir/shift-modal.tsx`
- `TableSelection.tsx` → `components/kasir/table-selection.tsx`
- `ProductCatalog.tsx` → `components/kasir/product-catalog.tsx`
- `CartPanel.tsx` → `components/kasir/cart-panel.tsx`
- `PaymentModal.tsx` → `components/kasir/payment-modal.tsx`
- `ReceiptModal.tsx` → `components/kasir/receipt-modal.tsx`
- `HistoryPanel.tsx` → `components/kasir/laporan-panel.tsx`
- `Navbar.tsx` → `components/kasir/kasir-navbar.tsx`

---

## Design System

- **Style:** Motion-Driven dengan microinteractions smooth
- **Palette:** Dark professional kasir
  - Background: `#0F172A` (slate-900)
  - Surface: `#1E293B` (slate-800)
  - Card: `#334155` (slate-700)
  - Primary: `#2563EB` (blue-600)
  - CTA/Bayar: `#16A34A` (green-600)
  - Warning: `#D97706` (amber-600)
  - Danger/Void: `#DC2626` (red-600)
  - Text: `#F8FAFC` (slate-50)
  - Muted: `#94A3B8` (slate-400)
- **Icons:** Lucide React (no emoji)
- **Transitions:** 150-300ms ease
- **Font:** Inter (sudah di sistem)
- **Hover states:** semua interaktif elemen wajib ada hover
- **Focus:** visible ring untuk keyboard nav
- **prefers-reduced-motion:** dihormati di semua animasi

---

## Schema Baru (Prisma)

Tambahkan ke `prisma/schema.prisma` setelah blok INVENTORY:

```prisma
// ============================================================
// POS KASIR
// ============================================================

model Table {
  id         String   @id @default(cuid())
  businessId String
  outletId   String
  name       String   // "Meja 1", "VIP 1", "Bar 1"
  capacity   Int      @default(4)
  isActive   Boolean  @default(true)
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  outlet   Outlet   @relation(fields: [outletId], references: [id], onDelete: Cascade)
  orders   Order[]

  @@unique([outletId, name])
}

enum OrderStatus {
  DRAFT
  ACTIVE
  PAID
  VOID
  CANCELLED
}

enum OrderType {
  DINE_IN
  TAKEAWAY
}

model Order {
  id             String      @id @default(cuid())
  businessId     String
  outletId       String
  tableId        String?     // null = takeaway
  employeeId     String      // kasir yg buat
  shiftId        String?
  orderNumber    String      // TRX-20260708-001
  status         OrderStatus @default(DRAFT)
  orderType      OrderType   @default(DINE_IN)
  customerName   String?
  customerNote   String?
  subtotal       Float       @default(0)
  taxAmount      Float       @default(0)
  serviceAmount  Float       @default(0)
  discountAmount Float       @default(0)
  totalAmount    Float       @default(0)
  paidAt         DateTime?
  voidReason     String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  business Business    @relation(fields: [businessId], references: [id], onDelete: Cascade)
  outlet   Outlet      @relation(fields: [outletId], references: [id])
  table    Table?      @relation(fields: [tableId], references: [id])
  employee Employee    @relation(fields: [employeeId], references: [id])
  shift    Shift?      @relation(fields: [shiftId], references: [id])
  items    OrderItem[]
  payment  Payment?
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  productId  String
  variantId  String?
  name       String   // snapshot
  variantName String?
  price      Float
  quantity   Int      @default(1)
  subtotal   Float
  notes      String?
  toppings   OrderItemTopping[]

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product        @relation(fields: [productId], references: [id])
  variant ProductVariant? @relation(fields: [variantId], references: [id])
}

model OrderItemTopping {
  id          String @id @default(cuid())
  orderItemId String
  toppingId   String
  name        String  // snapshot
  price       Float

  orderItem OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
}

model Payment {
  id           String   @id @default(cuid())
  orderId      String   @unique
  businessId   String
  outletId     String
  employeeId   String
  method       String   // CASH | QRIS | BANK_TRANSFER
  totalAmount  Float
  cashEntered  Float?
  changeAmount Float?
  referenceNo  String?  // untuk QRIS
  paidAt       DateTime @default(now())
  createdAt    DateTime @default(now())

  order    Order    @relation(fields: [orderId], references: [id])
  business Business @relation(fields: [businessId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])
}

model Shift {
  id          String    @id @default(cuid())
  businessId  String
  outletId    String
  employeeId  String
  openedAt    DateTime  @default(now())
  closedAt    DateTime?
  initialCash Float     @default(0)
  closingCash Float?
  isOpen      Boolean   @default(true)
  note        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  outlet   Outlet   @relation(fields: [outletId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])
  orders   Order[]
}
```

Tambahkan relasi balik di model yang ada:
- `Business`: tambah `tables Table[]`, `orders Order[]`, `payments Payment[]`
- `Outlet`: tambah `tables Table[]`, `orders Order[]`, `payments Payment[]`, `shifts Shift[]`
- `Employee`: tambah `orders Order[]`, `payments Payment[]`, `shifts Shift[]`
- `Product`: tambah `orderItems OrderItem[]`
- `ProductVariant`: tambah `orderItems OrderItem[]`

---

## Cookie Context

Tambahkan helper ke `src/lib/outlet-context.ts`:

```typescript
const KASIR_OUTLET_COOKIE = "bayaro_kasir_outlet_id";
const KASIR_EMPLOYEE_COOKIE = "bayaro_kasir_employee_id";

export async function getKasirOutletId(): Promise<string | null> { ... }
export async function setKasirOutletCookie(outletId: string | null): Promise<void> { ... }
export async function getKasirEmployeeId(): Promise<string | null> { ... }
export async function setKasirEmployeeCookie(employeeId: string | null): Promise<void> { ... }
```

---

## Route Structure

```
src/app/(kasir)/
  layout.tsx               ← fullscreen, dark bg, no dashboard shell
  page.tsx                 ← redirect ke /kasir/pin jika belum PIN
  pin/
    page.tsx               ← PIN entry screen (4-digit numpad)
  outlet/
    page.tsx               ← outlet selector (hanya muncul jika > 1 outlet)
  pos/
    page.tsx               ← main POS (table + catalog + cart)
  laporan/
    page.tsx               ← shift report (redirect ke /kasir/pos jika tidak ada shift aktif)
```

---

## File Structure

```
src/
  app/(kasir)/
    layout.tsx
    page.tsx
    pin/page.tsx
    outlet/page.tsx
    pos/page.tsx
    laporan/page.tsx
  actions/
    kasir.ts               ← semua server actions POS
  components/kasir/
    kasir-navbar.tsx
    shift-modal.tsx
    table-selection.tsx
    product-catalog.tsx
    cart-panel.tsx
    payment-modal.tsx
    receipt-modal.tsx
    laporan-panel.tsx
    pin-pad.tsx
    outlet-selector.tsx
```

---

## Server Actions (`src/actions/kasir.ts`)

```typescript
"use server";

// PIN
export async function verifyPin(employeeId: string, pin: string): Promise<{ ok: boolean; error?: string }>
export async function getEmployeeByUserId(userId: string): Promise<Employee | null>
export async function getAssignedOutlets(employeeId: string): Promise<Outlet[]>

// Shift
export async function getActiveShift(employeeId: string, outletId: string): Promise<Shift | null>
export async function openShift(data: { employeeId: string; outletId: string; businessId: string; initialCash: number }): Promise<{ shift?: Shift; error?: string }>
export async function closeShift(shiftId: string, data: { closingCash: number; note?: string }): Promise<{ ok: boolean; error?: string }>

// Tables
export async function getTables(outletId: string): Promise<Table[]>
export async function getTableOrders(outletId: string): Promise<{ tableId: string; order: Order | null }[]>

// Orders
export async function getOrCreateDraftOrder(data: { businessId: string; outletId: string; employeeId: string; shiftId: string; tableId?: string; orderType: "DINE_IN" | "TAKEAWAY" }): Promise<Order>
export async function addOrderItem(orderId: string, item: { productId: string; variantId?: string; toppingIds?: string[]; quantity: number; notes?: string }): Promise<{ ok: boolean; error?: string }>
export async function updateOrderItemQty(orderItemId: string, quantity: number): Promise<{ ok: boolean }>
export async function removeOrderItem(orderItemId: string): Promise<{ ok: boolean }>
export async function voidOrder(orderId: string, reason: string, pinConfirm: string): Promise<{ ok: boolean; error?: string }>
export async function getOrderWithItems(orderId: string): Promise<Order & { items: OrderItem[] } | null>

// Payment
export async function processPayment(data: { orderId: string; method: "CASH" | "QRIS" | "BANK_TRANSFER"; cashEntered?: number }): Promise<{ payment?: Payment; error?: string }>

// Laporan
export async function getShiftSummary(shiftId: string): Promise<ShiftSummary>
export async function getShiftOrders(shiftId: string): Promise<Order[]>
export async function getHourlyStats(shiftId: string): Promise<{ hour: number; count: number; total: number }[]>

// Products untuk POS
export async function getPosProducts(businessId: string, outletId: string): Promise<PosProduct[]>
export async function getPosCategories(businessId: string): Promise<Category[]>
```

---

## Komponen Detail

### `(kasir)/layout.tsx`
```tsx
export const dynamic = "force-dynamic";

export default async function KasirLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {children}
    </div>
  );
}
```

### `pin/page.tsx`
- Dark fullscreen: `bg-slate-900`
- Logo bisnis di atas
- Greeting: "Selamat Datang, {nama}" 
- Display PIN: 4 dot circles, mengisi satu per satu saat ketik
- Numpad 3x4 grid (1-9, hapus, 0, enter)
- Submit otomatis setelah 4 digit masuk
- Shake animation jika PIN salah
- "Keluar" link kiri bawah → `signOut`
- Setelah PIN benar: cek outlet count → redirect ke `/kasir/outlet` atau `/kasir/pos`

### `outlet/page.tsx`
- Grid card outlet: nama, alamat, status
- Klik → set cookie kasir_outlet_id → redirect `/kasir/pos`
- Hanya tampil jika employee punya > 1 outlet

### `pos/page.tsx` (Main POS)
Layout fullscreen 2-kolom:
```
┌─ KasirNavbar ────────────────────────────────────────────────────────┐
│ [Logo] [Outlet: Pusat] [Kasir: Budi] [Shift: 08:00] [Laporan] [Exit]│
└──────────────────────────────────────────────────────────────────────┘
┌──── 38% ─────────────────┬──── 62% ──────────────────────────────────┐
│  TableSelection           │  ProductCatalog                           │
│  Grid meja 3-4 col        │  [Semua] [Makanan] [Minuman] [Snack]     │
│  Status badge warna:      │  Grid produk 3 col                       │
│  • Tersedia: slate-700    │  [Cart Panel di bawah catalog]           │
│  • Terisi: blue-600       │  Item list + qty stepper                 │
│  • Mau Bayar: amber-600   │  Subtotal / PPN / Service / Total        │
│  [+ Takeaway btn]         │  [Simpan] [BAYAR]                        │
└──────────────────────────┴──────────────────────────────────────────┘
```

### `KasirNavbar`
```tsx
// Props: kasirName, outletName, shiftOpenedAt, onLaporan, onCloseShift
// Kanan: tombol Laporan (BarChart2 icon) + Close Shift (LogOut icon) + PIN konfirmasi
```

### `ShiftModal`
- Trigger: otomatis saat masuk POS jika tidak ada shift aktif
- Form: input nominal kas awal (format rupiah)
- CTA: "Buka Shift" → openShift action
- Close shift: input kas akhir + ringkasan (total transaksi, cash, QRIS)

### `TableSelection`
```tsx
// State: selectedTableId | "takeaway"
// Grid responsive: 3-4 kolom
// Each table card:
//   - Nama meja besar
//   - Kapasitas (ikon kursi + angka)
//   - Status badge: TERSEDIA | TERISI | BAYAR
//   - onClick → setSelectedTable + load/create order
// Bottom: tombol "+ Takeaway"
```

### `ProductCatalog`
```tsx
// Tab kategori horizontal scroll
// Grid produk: gambar / placeholder, nama, harga
// onClick produk → cek apakah punya variant:
//   - Punya variant: buka VariantModal
//   - Tidak: langsung addOrderItem dengan quantity 1
// Search input di atas grid
// Empty state jika tidak ada produk
```

### `CartPanel`
```tsx
// Header: "Order #TRX-001 | Meja 5"
// Item list:
//   - Nama produk + variant/topping kecil
//   - Qty stepper: [-] [n] [+]
//   - Harga item
//   - Tombol hapus (X)
// Footer:
//   - Subtotal
//   - PPN (jika taxRate > 0)
//   - Service (jika serviceRate > 0)
//   - Diskon (jika ada)
//   - Total (bold, besar)
//   - [Simpan Bill]  [BAYAR →]
// Empty state: "Pilih meja atau takeaway dulu"
```

### `PaymentModal`
```tsx
// Tabs: TUNAI | QRIS | TRANSFER
// TUNAI:
//   - Total yang harus dibayar (besar, menonjol)
//   - Input nominal uang diterima (keypad angka cepat: 50rb, 100rb, dst)
//   - Kembalian otomatis hitung
//   - [Proses Pembayaran]
// QRIS:
//   - Tampilkan QR image dari PaymentMethod.qrisImage
//   - Nominal di bawah QR
//   - [Konfirmasi Pembayaran Diterima]
// Setelah bayar: trigger ReceiptModal
```

### `ReceiptModal`
```tsx
// Thermal receipt preview (80mm style, font mono)
// Header: logo bisnis + nama + alamat
// Order: nomor, tanggal, kasir, meja
// Item list: nama | qty | harga | subtotal
// Footer: subtotal, pajak, service, total, metode bayar, kembalian
// Tombol: [Cetak] [Tutup]
// Print: window.print() dengan CSS @media print
```

### `LaporanPanel` (tab Laporan)
```tsx
// 3 Stat Cards: Total Omset | Total Transaksi | Cash vs QRIS
// Bar chart: transaksi per jam (pure CSS bar chart, no library)
// Table transaksi:
//   - No | Jam | Meja | Item | Total | Metode
//   - Row klik → buka detail order
//   - Filter: search + method
// Bottom: info shift (buka jam berapa, kasir, outlet)
```

---

## Blocks Eksekusi

### Block A — Schema & Migration
1. Tambah models baru ke `prisma/schema.prisma`: `Table`, `Order`, `OrderItem`, `OrderItemTopping`, `Payment`, `Shift`
2. Tambah relasi balik di `Business`, `Outlet`, `Employee`, `Product`, `ProductVariant`
3. Run `npx prisma migrate dev --name phase5-pos-kasir`
4. Run `npx prisma generate`
5. Verifikasi: `npx tsc --noEmit`

### Block B — Server Actions
1. Buat `src/actions/kasir.ts` dengan semua fungsi di atas
2. Pattern: `"use server"`, import `auth` + `prisma`, ownership check via `businessId`
3. PIN verify: `bcrypt.compare(pin, employee.pin)`
4. Order number: generate `TRX-{YYYYMMDD}-{SEQ}` dari count order hari ini
5. Verifikasi: `npx tsc --noEmit`

### Block C — Layout & PIN Screen
1. Buat `src/app/(kasir)/layout.tsx` — dark fullscreen, auth check
2. Buat `src/app/(kasir)/page.tsx` — redirect ke `/kasir/pin`
3. Buat `src/components/kasir/pin-pad.tsx` — numpad komponen reusable
4. Buat `src/app/(kasir)/pin/page.tsx` — PIN screen lengkap
5. Buat `src/app/(kasir)/outlet/page.tsx` — outlet selector
6. Update cookie helper di `src/lib/outlet-context.ts`
7. Verifikasi: `npx tsc --noEmit`

### Block D — Main POS Layout + Table + Catalog
1. Buat `src/components/kasir/kasir-navbar.tsx`
2. Buat `src/components/kasir/shift-modal.tsx`
3. Buat `src/components/kasir/table-selection.tsx`
4. Buat `src/components/kasir/product-catalog.tsx`
5. Buat `src/app/(kasir)/pos/page.tsx` — assembly semua komponen
6. Verifikasi: `npx tsc --noEmit`

### Block E — Cart + Payment + Receipt
1. Buat `src/components/kasir/cart-panel.tsx`
2. Buat `src/components/kasir/payment-modal.tsx`
3. Buat `src/components/kasir/receipt-modal.tsx`
4. Wire ke pos/page.tsx
5. Verifikasi: `npx tsc --noEmit`

### Block F — Laporan & Close Shift
1. Buat `src/components/kasir/laporan-panel.tsx` — stats + chart + table
2. Buat `src/app/(kasir)/laporan/page.tsx`
3. Close shift flow di `KasirNavbar` → `ShiftModal` mode close
4. Verifikasi: `npx tsc --noEmit`

### Block G — Nav Update + Cleanup + Commit
1. Tambahkan link "Kasir" di nav dashboard (sidebar) dengan permission `pos.access`
2. Hapus folder `pos-kasir-f&b/` (sudah selesai dijadikan referensi)
3. Run `npx tsc --noEmit` — 0 errors
4. `git add -A && git commit -m "feat: phase 5 — POS kasir F&B"`

---

## Permissions

Tambahkan ke permission list:
```
pos.access      — akses /kasir route
pos.void        — void transaksi (perlu PIN konfirmasi ulang)
pos.discount    — beri diskon manual
pos.close_shift — tutup shift
```

---

## UX Details Penting

- **Animasi PIN:** dot circles scale-up saat diisi, shake red saat salah
- **Table card hover:** skala naik sedikit (scale-105), cursor-pointer
- **Product card hover:** border primary menyala, shadow blue
- **Cart item:** qty stepper dengan tap target minimal 44px
- **PaymentModal:** background blur overlay, slide-up animation
- **ReceiptModal:** thermal style dengan border dash, font mono
- **Loading states:** skeleton loader di catalog dan table grid
- **Responsive:** bekerja di tablet 768px (landscape untuk kasir tablet)
- **Keyboard shortcuts:** Enter = bayar, Escape = tutup modal
- **Error handling:** toast merah di pojok kanan atas, jelas dan auto-dismiss
- **Empty cart:** ilustrasi sederhana + teks "Tambahkan item dari katalog"
- **No emoji di UI** — semua icon dari Lucide React

---

## Catatan Teknis

- Tidak ada `recharts` atau library chart eksternal — gunakan pure CSS bar chart (div dengan height proportional) untuk menghindari install dependency baru
- `framer-motion` tidak diinstall — gunakan Tailwind `transition` + `animate-*` classes
- State management: React `useState` + `useOptimistic` untuk cart (optimistic UI)
- Server Components untuk data loading, Client Components untuk interaksi
- Cookie `bayaro_kasir_outlet_id` dan `bayaro_kasir_employee_id` untuk persist state kasir
- PIN tidak pernah di-log atau di-return ke client dalam bentuk plaintext
- Semua mutasi validasi `businessId` ownership sebelum eksekusi

---

## Definition of Done

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Flow lengkap: login → PIN → outlet → buka shift → pilih meja → tambah produk → bayar → struk → laporan → tutup shift
- [ ] PIN shake animation saat salah
- [ ] Table grid dengan status warna yang jelas
- [ ] Product catalog dengan kategori tab + search
- [ ] Cart dengan qty stepper + total kalkulasi benar (pajak + service)
- [ ] Payment modal Cash (dengan kembalian) + QRIS (dengan QR image)
- [ ] Receipt modal thermal style
- [ ] Laporan tab: 3 stat cards + bar chart per jam + tabel transaksi
- [ ] Close shift modal dengan ringkasan
- [ ] Dark mode UI yang konsisten di semua komponen
- [ ] Semua hover states ada
- [ ] Folder `pos-kasir-f&b/` dihapus
- [ ] Git commit dengan pesan yang jelas
