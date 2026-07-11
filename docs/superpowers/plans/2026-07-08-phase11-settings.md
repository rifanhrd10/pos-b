# Phase 11: System Settings — Implementation Plan

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Dependencies:** Phase 1 ✅, Phase 4 ✅

---

## Overview

7 section settings dalam 1 sprint:
- **Block A:** Schema + Migration (BusinessSettings, PaymentMethod)
- **Block B:** Server Actions (settings.ts)
- **Block C:** Settings Layout + Navigation
- **Block D:** Pages — Business, Tax, Receipt, General, Account
- **Block E:** Payment Methods page (Cash + QRIS Statis + API)
- **Block F:** Update phase-06.md, nav sidebar, tsc verify + commit

---

## Block A: Schema + Migration

### Design Decision
Data settings sebagian sudah ada di `Business` model (taxRate, serviceRate, currency, openTime, closeTime). Daripada duplicate, kita:
1. Tambah `BusinessSettings` model baru untuk settings yang belum ada (receipt template, general settings)
2. Tambah `PaymentMethod` model untuk konfigurasi payment per business
3. Fields yang sudah di `Business` (taxRate, serviceRate, currency) tetap di sana — settings page cukup read/write ke sana

### New Models

```prisma
model BusinessSettings {
  id         String  @id @default(cuid())
  businessId String  @unique
  
  // Receipt template
  receiptHeader1    String?
  receiptHeader2    String?
  receiptHeader3    String?
  receiptFooter     String?
  receiptShowLogo   Boolean @default(true)
  receiptShowAddress Boolean @default(true)
  receiptShowPhone  Boolean @default(true)
  receiptShowKasir  Boolean @default(true)
  receiptNumberFormat String @default("TRX-{YYYYMMDD}-{SEQ}")
  receiptThankYou   String? @default("Terima kasih atas kunjungan Anda!")
  
  // General
  dateFormat        String  @default("DD/MM/YYYY")
  timezone          String  @default("Asia/Jakarta")
  language          String  @default("id")
  autoPrintReceipt  Boolean @default(false)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

enum PaymentMethodType {
  CASH
  QRIS_STATIC
  QRIS_DYNAMIC
  BANK_TRANSFER
  EWALLET
}

enum QrisProvider {
  MIDTRANS
  XENDIT
  CUSTOM
}

model PaymentMethod {
  id         String            @id @default(cuid())
  businessId String
  type       PaymentMethodType
  name       String            // display name, e.g. "Cash", "QRIS BCA"
  isEnabled  Boolean           @default(true)
  sortOrder  Int               @default(0)
  
  // QRIS Static
  qrisImage  String?           // uploaded image URL/path
  qrisNote   String?           // note untuk kasir
  
  // QRIS Dynamic / API
  provider   QrisProvider?
  apiKey     String?           // encrypted or stored as-is for now
  apiSecret  String?
  apiEndpoint String?          // custom endpoint for CUSTOM provider
  merchantId String?           // merchant ID from provider
  
  // Bank Transfer
  bankName   String?
  accountNumber String?
  accountName String?
  
  // E-wallet
  walletNumber String?
  walletName   String?
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@unique([businessId, type, name])
}
```

### Back-relation to add in Business model
```prisma
  settings       BusinessSettings?
  paymentMethods PaymentMethod[]
```

### Commands
```bash
npx prisma migrate dev --name add_business_settings_and_payment_methods
npx prisma generate
```

---

## Block B: Server Actions (`src/actions/settings.ts`)

```typescript
"use server"

// Read
getBusinessSettings()
// Returns: Business (taxRate, serviceRate, currency, openTime, closeTime) 
//          + BusinessSettings (receipt, general)
//          + PaymentMethod[] (all methods)

// Business Profile
updateBusinessProfile(formData: FormData)
// Updates: Business.name, logo, address, province, phone, email, type

// Tax & Service
updateTaxSettings(data: { taxRate, serviceRate, taxInclusive?, serviceAutoApply? })
// Updates: Business.taxRate, Business.serviceRate

// Receipt Template
updateReceiptTemplate(data: { header1?, header2?, header3?, footer?, showLogo?, showAddress?, showPhone?, showKasir?, numberFormat?, thankYou? })
// Upsert: BusinessSettings (receipt fields)

// General
updateGeneralSettings(data: { dateFormat?, timezone?, language?, autoPrintReceipt? })
// Upsert: BusinessSettings (general fields)

// Payment Methods
getPaymentMethods()                        // List all for business
createPaymentMethod(data)                  // Create new method
updatePaymentMethod(id, data)              // Update method
deletePaymentMethod(id)                    // Delete
togglePaymentMethod(id, isEnabled)         // Enable/disable

// Account
changePassword(oldPassword, newPassword)   // bcrypt compare + update
updateUserProfile(formData: FormData)      // name, phone, avatar
```

### Validation (add to `src/lib/validations.ts`)
```typescript
updateBusinessProfileSchema
updateTaxSettingsSchema     // taxRate: 0-100, serviceRate: 0-100
updateReceiptTemplateSchema
createPaymentMethodSchema
```

---

## Block C: Settings Layout

### `src/app/(dashboard)/settings/layout.tsx`
- Sidebar tab navigation (vertikal di desktop, horizontal scroll di mobile)
- Tabs: Profil Bisnis | Pajak & Service | Template Struk | Payment | General | Akun
- Active tab highlight
- Server component — tidak butuh client state

```
src/app/(dashboard)/settings/
  layout.tsx          — settings shell dengan sub-nav sidebar
  page.tsx            — redirect ke /settings/business
  business/page.tsx
  tax/page.tsx
  receipt/page.tsx
  payment/page.tsx
  general/page.tsx
  account/page.tsx
```

---

## Block D: Pages — Business, Tax, Receipt, General, Account

### D1: `settings/business/page.tsx`
- Form: nama bisnis, logo upload, alamat, kota, provinsi, phone, email, jenis usaha
- Logo upload: reuse pola dari product image upload (`/api/upload`)
- Submit → `updateBusinessProfile(formData)`

### D2: `settings/tax/page.tsx`
- Form: PPN rate (slider + number input 0-100%), tax inclusive toggle
- Service charge rate, auto-apply toggle
- Note: "PPN default Indonesia 11%"
- Submit → `updateTaxSettings(data)`

### D3: `settings/receipt/page.tsx`
- Form kiri: input fields (header 1/2/3, footer, toggles)
- Preview kanan: live preview struk dengan data dummy
- Submit → `updateReceiptTemplate(data)`
- Client component untuk live preview

### D4: `settings/general/page.tsx`
- Date format select (DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD)
- Timezone select (Asia/Jakarta, Asia/Makassar, Asia/Jayapura)
- Language select (Bahasa Indonesia | English)
- Auto-print toggle
- Submit → `updateGeneralSettings(data)`

### D5: `settings/account/page.tsx`
- Section 1: Update profil (nama, phone, avatar)
- Section 2: Ganti password (old → new → confirm)
- Submit profile → `updateUserProfile(formData)`
- Submit password → `changePassword(old, new)`

---

## Block E: Payment Methods Page (Core Feature)

### `settings/payment/page.tsx`
Server component yang load existing payment methods, render client form.

### `settings/payment/payment-settings-client.tsx` (Client Component)
3 kartu payment method:

#### 1. Cash
- Toggle enable/disable
- Tidak ada config tambahan
- Selalu ada sebagai default (auto-create jika belum ada)

#### 2. QRIS Statis
- Toggle enable/disable
- Upload gambar QR (file upload, preview thumbnail)
- Note field: "Catatan untuk kasir" (default: "Tampilkan QR ke customer, klik 'Sudah Dibayar' setelah customer konfirmasi")
- **Warning banner** (orange): "QRIS Statis tidak dapat memverifikasi pembayaran secara otomatis. Kasir perlu mengkonfirmasi pembayaran secara manual."
- Tombol close/confirm di POS nanti: "Sudah Dibayar" (bukan "Konfirmasi Otomatis")

#### 3. QRIS Dinamis / Payment Gateway API
- Toggle enable/disable
- Provider select: Midtrans | Xendit | Custom
- Fields berdasarkan provider:
  - **Midtrans**: Server Key, Client Key, Merchant ID, mode (Sandbox/Production)
  - **Xendit**: Secret Key, Webhook Token, mode (Test/Live)
  - **Custom**: API Endpoint, API Key, API Secret
- Status badge: "Belum dikonfigurasi" / "Terkonfigurasi" (cek apiKey !== null)
- Note: "Integrasi aktif akan tersedia di Phase 6 (Pembayaran). Konfigurasi disimpan dan siap digunakan."
- **Security note**: "API Key disimpan di server dan tidak ditampilkan setelah disimpan. Isi ulang hanya jika ingin menggantinya."
- Input apiKey: type="password", placeholder="••••••••" jika sudah ada

### API Key Security
- Untuk saat ini: simpan as-is di DB (plain text) — note di code untuk enkripsi nanti
- Saat display: jika apiKey sudah ada, tampilkan placeholder "••••••••" bukan value asli
- Saat submit: jika field kosong (user tidak ubah), jangan overwrite existing value

---

## Block F: Nav + phase-06.md + tsc + Commit

### Update `src/lib/nav.ts`
Tambah Settings section:
```typescript
{
  label: "Pengaturan",
  href: "/settings",
  icon: Settings,
  children: [
    { label: "Profil Bisnis", href: "/settings/business" },
    { label: "Pajak & Service", href: "/settings/tax" },
    { label: "Template Struk", href: "/settings/receipt" },
    { label: "Payment", href: "/settings/payment" },
    { label: "General", href: "/settings/general" },
    { label: "Akun", href: "/settings/account" },
  ]
}
```

### Update `docs/phases/phase-06.md`
Tambah note di section "Payment Methods":
```
## 6. Payment Settings Integration (from Phase 11)
Payment method configuration is stored in `PaymentMethod` model (configured in Settings → Payment).
Phase 6 implementation should:
- Read active PaymentMethod records for the business
- For QRIS_STATIC: load qrisImage from settings, show to customer, use manual confirm "Sudah Dibayar"
- For QRIS_DYNAMIC: use apiKey/apiSecret/provider from settings to call payment gateway API
  - Midtrans: use midtrans-client npm package with serverKey from settings
  - Xendit: use xendit-node npm package with secretKey from settings
  - Custom: POST to apiEndpoint with apiKey header
- Cash: always available, no external API needed
```

---

## Checklist

```
Block A
- [ ] Add BusinessSettings model to schema.prisma
- [ ] Add PaymentMethod model + PaymentMethodType + QrisProvider enums
- [ ] Add back-relations to Business model
- [ ] Run prisma migrate dev
- [ ] Run prisma generate

Block B
- [ ] Add validation schemas to src/lib/validations.ts
- [ ] Create src/actions/settings.ts with all 10+ functions

Block C
- [ ] settings/layout.tsx — sub-nav sidebar
- [ ] settings/page.tsx — redirect to /settings/business

Block D
- [ ] settings/business/page.tsx
- [ ] settings/tax/page.tsx
- [ ] settings/receipt/page.tsx (with live preview client component)
- [ ] settings/general/page.tsx
- [ ] settings/account/page.tsx

Block E
- [ ] settings/payment/page.tsx (server, loads data)
- [ ] settings/payment/payment-settings-client.tsx (client, 3 cards)
- [ ] QRIS static: upload + warning banner + manual confirm note
- [ ] QRIS dynamic: provider select + API key fields + security masking

Block F
- [ ] Update src/lib/nav.ts with Settings section
- [ ] Update docs/phases/phase-06.md with payment integration notes
- [ ] npx tsc --noEmit → 0 errors
- [ ] Commit
```

---

## Notes

- `taxInclusive` belum ada di Business model — tambah ke schema jika dibutuhkan, atau simpan di BusinessSettings
- Receipt live preview menggunakan data dummy (bukan data transaksi real) — cukup show template
- Account page change password harus bcrypt compare dulu sebelum update
- Payment API keys: simpan plain untuk sekarang, tambah TODO comment untuk enkripsi (AES-256 atau KMS) sebelum production
- QRIS Statis image: reuse `/api/upload` endpoint yang sudah ada dari product image upload
- Default payment methods: saat BusinessSettings dibuat, auto-create Cash (enabled) sebagai default
