# Phase 11: System Settings

**Goal:** Konfigurasi bisnis, pajak, struk, payment methods, general settings.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 1  
**Priority:** P1

---

## 1. Pages & Routes

```
src/app/(dashboard)/
  settings/
    page.tsx              — Settings overview / redirect
    business/page.tsx     — Profil bisnis (nama, logo, alamat)
    tax/page.tsx          — Pengaturan pajak + service charge
    receipt/page.tsx      — Template struk
    payment/page.tsx      — Payment method config
    general/page.tsx      — General settings
    account/page.tsx      — Account settings (password, profile)
```

---

## 2. Settings Sections

### Business Profile
- Nama bisnis, logo, alamat, kota, provinsi
- Phone, email bisnis
- Jenis usaha

### Tax & Service Charge
- PPN rate (default 11%)
- Tax inclusive/exclusive toggle
- Service charge rate (default 0%)
- Service charge auto-apply toggle

### Receipt Template
- Custom header text (line 1, 2, 3)
- Custom footer text
- Show/hide: logo, address, phone, kasir name
- Receipt number format
- Thank you message

### Payment Methods
- Enable/disable per method (Cash, QRIS, Debit, etc)
- QRIS image upload (static QR)
- Bank account info (for transfer)
- E-wallet numbers

### General
- Currency symbol (Rp, $, etc)
- Date format (DD/MM/YYYY or MM/DD/YYYY)
- Timezone
- Language (Bahasa Indonesia / English)
- Auto-print receipt toggle

### Account
- Change password
- Update profile (name, email, phone, avatar)
- Two-factor authentication toggle (future)
- Active sessions

---

## 3. Server Actions

```typescript
// src/actions/settings.ts
getBusinessSettings()              — Get all settings
updateBusinessProfile(data)        — Update profile
updateTaxSettings(data)            — Update tax/service
updateReceiptTemplate(data)        — Update receipt config
updatePaymentSettings(data)        — Update payment methods
updateGeneralSettings(data)        — Update general
changePassword(oldPw, newPw)       — Change user password
updateUserProfile(data)            — Update user info
```

---

## 4. Deliverables Checklist

```
- [ ] Build settings layout with sub-navigation (sidebar tabs)
- [ ] Build business profile page (with logo upload)
- [ ] Build tax & service charge settings
- [ ] Build receipt template settings (with preview)
- [ ] Build payment method settings (QRIS upload)
- [ ] Build general settings page
- [ ] Build account settings (change password + profile)
- [ ] Connect settings to POS (tax auto-apply, receipt template)
- [ ] Test: change tax rate → verify in POS calculation
- [ ] Commit
```
