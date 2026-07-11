# Phase 6: Payment (Cash + QRIS)

**Goal:** Proses pembayaran cash dan QRIS.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 5  
**Priority:** P0

---

## 1. Payment Flow

```
User clicks [BAYAR] on POS
  → Payment modal opens
  → Select payment method (Cash / QRIS)
  
Cash flow:
  → Input nominal dibayar
  → Show kembalian (auto-calculate)
  → Confirm → mark COMPLETED → print receipt

QRIS flow:
  → Generate/show QR code (static QRIS dari settings)
  → Kasir input reference number
  → Confirm → mark COMPLETED → print receipt
```

---

## 2. Components

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

---

## 3. Features

- Cash payment: input paid amount, auto-calculate change
- Quick amount buttons (Rp 50k, 100k, 150k, exact)
- QRIS: display static QR (from business settings), manual confirm
- Split payment (partial cash + partial QRIS) — opsional
- Receipt generation (HTML-based, print via browser)
- Thermal printer support (ESC/POS via Web Serial API)
- Payment history tied to transactions
- Daily payment summary (cash total, QRIS total)

---

## 4. Receipt Format

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

---

## 5. Payment Settings Integration (from Phase 11)

Payment method configuration is stored in the `PaymentMethod` model, configured via **Settings → Payment Methods**.

Phase 6 implementation should read from this model:

```
PaymentMethod.type:
  CASH         → always available, no external API
  QRIS_STATIC  → load qrisImage from settings, display to customer
                 kasir confirms manually with "Sudah Dibayar" button
                 NOTE: no auto-verification possible
  QRIS_DYNAMIC → use provider + apiKey + apiSecret from settings
                 Midtrans: midtrans-client npm, serverKey from settings
                 Xendit: xendit-node npm, secretKey from settings
                 Custom: POST to apiEndpoint with apiKey header
```

**QRIS Static flow (Phase 6):**
```
→ Load qrisImage from PaymentMethod where type=QRIS_STATIC
→ Display QR image fullscreen to customer
→ Show [Sudah Dibayar] button (no polling, no webhook)
→ Kasir clicks → mark transaction COMPLETED → print receipt
```

**QRIS Dynamic flow (Phase 6):**
```
→ Read provider/apiKey/apiSecret from PaymentMethod where type=QRIS_DYNAMIC
→ Call provider API to generate dynamic QR
→ Poll or webhook for payment status
→ Auto-confirm → mark COMPLETED → print receipt
```

---

## 6. Deliverables Checklist

```
- [ ] Build payment modal component
- [ ] Build cash payment flow (input + change calculation)
- [ ] Build quick amount buttons
- [ ] Build QRIS payment flow (QR display + confirm)
- [ ] Build receipt preview component
- [ ] Build print receipt functionality (browser print)
- [ ] Connect payment to transaction (mark completed)
- [ ] Build reprint receipt from transaction history
- [ ] Add QRIS settings to business config
- [ ] Build payment summary page
- [ ] Test: full transaction → cash pay → receipt
- [ ] Test: full transaction → QRIS pay → receipt
- [ ] Commit
```
