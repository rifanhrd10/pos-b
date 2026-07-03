# Phase 13: Printer & Receipt Integration

**Goal:** Print struk ke thermal printer (USB/Bluetooth), receipt templates.  
**Estimasi:** 2-3 hari  
**Dependencies:** Phase 6  
**Priority:** P1

---

## 1. Print Methods

| Method | Browser Support | Use Case |
|--------|----------------|----------|
| Browser Print (window.print) | All browsers | Fallback, any printer |
| Web Serial API | Chrome 89+ | USB thermal printer |
| Web Bluetooth API | Chrome 56+ | Bluetooth thermal printer |

---

## 2. Receipt Template (HTML)

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
  [CUSTOM FOOTER TEXT]
================================
```

---

## 3. Components & Utils

```
src/lib/
  printer/
    esc-pos.ts            — ESC/POS command encoder
    web-serial.ts         — Web Serial API wrapper
    web-bluetooth.ts      — Web Bluetooth API wrapper
    receipt-builder.ts    — Build receipt from transaction data

src/components/pos/
  receipt-preview.tsx     — HTML receipt for browser print
  printer-settings.tsx    — Printer connection UI
  
src/app/(dashboard)/
  settings/
    printer/page.tsx      — Printer settings + test print
```

---

## 4. Features

- **Browser print:** CSS @media print styled receipt (58mm/80mm width)
- **ESC/POS USB:** Connect via Web Serial API, send ESC/POS commands
- **Bluetooth:** Connect via Web Bluetooth, send to BT thermal printer
- **Receipt customization:** Header, footer, logo toggle (from settings)
- **Auto-print:** Toggle untuk auto-print setelah bayar
- **Reprint:** Print ulang dari transaction history
- **Kitchen Order Ticket (KOT):** Simplified print for kitchen
- **Test print:** Button to test printer connection

---

## 5. ESC/POS Commands (Core)

```typescript
// src/lib/printer/esc-pos.ts
class EscPosEncoder {
  initialize()           — Reset printer
  text(str)              — Print text
  bold(on: boolean)      — Bold toggle
  align(pos)             — Left/Center/Right
  fontSize(size)         — Normal/Double
  cut()                  — Cut paper
  openCashDrawer()       — Trigger cash drawer
  barcode(data)          — Print barcode
  qrCode(data)           — Print QR code
  
  encode(): Uint8Array   — Get final byte array
}
```

---

## 6. Supported Printers

- Epson TM-T82X, TM-T82i
- Star TSP100 series
- Xprinter XP-58/80
- Generic 58mm/80mm ESC/POS compatible

---

## 7. Deliverables Checklist

```
- [ ] Build receipt HTML template component (58mm + 80mm)
- [ ] Build CSS @media print styles
- [ ] Build ESC/POS encoder utility
- [ ] Build Web Serial API connection manager
- [ ] Build Web Bluetooth connection manager
- [ ] Build printer settings page (select + test)
- [ ] Build auto-print toggle in settings
- [ ] Build reprint from transaction detail
- [ ] Build kitchen order ticket (KOT) template
- [ ] Build cash drawer trigger
- [ ] Test with real thermal printer (if available)
- [ ] Commit
```
