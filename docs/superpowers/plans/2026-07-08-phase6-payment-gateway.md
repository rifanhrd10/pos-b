# Phase 6 — Payment Gateway Integration

**Date:** 2026-07-08  
**Branch:** pos-b-v2  
**Estimated:** 3–4 days  
**Dependencies:** Phase 5 (POS Kasir), Phase 11 (Settings)

---

## Tujuan

Integrate payment gateway APIs (Midtrans & Xendit) untuk QRIS Dynamic generation dan webhook callback auto-confirm payment.

**Current state:**
- Phase 11: PaymentMethod settings sudah ada (apiKey, provider, qrisImage untuk statis)
- Phase 5: POS Kasir sudah support CASH + QRIS statis (kasir upload QR image)

**What's missing:**
- QRIS Dynamic: generate QR via Midtrans/Xendit API saat kasir pilih QRIS
- Webhook callback: Midtrans/Xendit hit `/api/payment/callback` → auto-update Order status ke PAID
- Payment polling: kasir screen polling payment status setiap 3 detik

---

## Scope

### IN scope:
1. **Midtrans Snap API** — create transaction, get QR URL, webhook callback
2. **Xendit Invoice API** — create invoice, get QR URL, webhook callback
3. **Update `processPayment()` di `src/actions/kasir.ts`** — detect jika ada API key → call gateway API
4. **Update `PaymentModal`** — tampilkan QR dari API URL (bukan statis), polling status
5. **API routes** — `POST /api/payment/midtrans/callback`, `POST /api/payment/xendit/callback`
6. **Payment model update** — add `externalId`, `qrUrl`, `status` (PENDING/PAID/FAILED)

### OUT of scope:
- Dashboard payment management (list, detail, refund) — nanti di Phase 7 Reports
- Bank transfer / e-wallet integration — fokus QRIS dulu
- Refund API — not in this phase

---

## Schema Changes

Update `Payment` model di `prisma/schema.prisma`:

```prisma
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
  referenceNo  String?
  
  // NEW FIELDS for gateway integration
  externalId   String?  // Midtrans order_id or Xendit invoice_id
  qrUrl        String?  // URL QR image dari gateway
  status       PaymentStatus @default(PENDING)  // PENDING | PAID | FAILED
  
  paidAt       DateTime @default(now())
  createdAt    DateTime @default(now())

  order    Order    @relation(fields: [orderId], references: [id])
  business Business @relation(fields: [businessId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}
```

---

## API Integration

### Midtrans Snap API

**Create Transaction:**
```typescript
POST https://app.sandbox.midtrans.com/snap/v1/transactions
Headers: 
  Authorization: Basic base64(serverKey + ":")
  Content-Type: application/json

Body:
{
  "transaction_details": {
    "order_id": "TRX-20260708-0001-abc123",  // orderNumber + random suffix
    "gross_amount": 85000
  },
  "customer_details": {
    "first_name": "Outlet Pusat",
    "email": "outlet@business.com"
  },
  "enabled_payments": ["qris"]
}

Response:
{
  "token": "...",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
  "qr_code": "https://api.sandbox.midtrans.com/v2/qris/...-qr-code.png"
}
```

Use `qr_code` URL untuk ditampilkan di PaymentModal.

**Webhook Callback:**
```
POST /api/payment/midtrans/callback
Body: { order_id, transaction_status, ... }

Verify signature: SHA512(order_id+status+gross_amount+serverKey)
```

### Xendit Invoice API

**Create Invoice:**
```typescript
POST https://api.xendit.co/v2/invoices
Headers:
  Authorization: Basic base64(apiKey + ":")
  Content-Type: application/json

Body:
{
  "external_id": "TRX-20260708-0001-xyz789",
  "amount": 85000,
  "payer_email": "outlet@business.com",
  "description": "Order #TRX-20260708-0001",
  "payment_methods": ["QR_CODE"]
}

Response:
{
  "id": "...",
  "external_id": "...",
  "invoice_url": "https://checkout.xendit.co/web/...",
  "qr_code_url": "https://api.xendit.co/qr_codes/..."
}
```

Use `qr_code_url` untuk ditampilkan di PaymentModal.

**Webhook Callback:**
```
POST /api/payment/xendit/callback
Headers: x-callback-token (verify with PaymentMethod.apiSecret)
Body: { external_id, status, paid_amount, ... }
```

---

## Implementation Blocks

### Block A — Schema & Migration

1. Add `externalId`, `qrUrl`, `status` to `Payment` model
2. Add `PaymentStatus` enum
3. Run `npx prisma migrate dev --name phase6-payment-gateway`
4. Run `npx prisma generate`
5. Verify: `npx tsc --noEmit`
6. Commit: `feat(schema): add payment gateway fields`

### Block B — Gateway API Client

Create `src/lib/payment-gateway.ts`:

```typescript
import crypto from "crypto";

export type GatewayProvider = "MIDTRANS" | "XENDIT" | "CUSTOM";

export type CreateTransactionRequest = {
  provider: GatewayProvider;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  apiKey: string;
  apiSecret?: string;
  sandbox?: boolean;
};

export type CreateTransactionResponse = {
  externalId: string;
  qrUrl: string;
  redirectUrl?: string;
};

// Midtrans
export async function createMidtransTransaction(req: CreateTransactionRequest): Promise<CreateTransactionResponse> {
  const baseUrl = req.sandbox 
    ? "https://app.sandbox.midtrans.com"
    : "https://app.midtrans.com";
  
  const auth = Buffer.from(req.apiKey + ":").toString("base64");
  const externalId = `${req.orderNumber}-${Date.now()}`;
  
  const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: externalId,
        gross_amount: req.amount,
      },
      customer_details: {
        first_name: req.customerName,
        email: req.customerEmail,
      },
      enabled_payments: ["qris"],
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midtrans API error: ${error}`);
  }
  
  const data = await response.json();
  return {
    externalId,
    qrUrl: data.qr_code || data.redirect_url,
    redirectUrl: data.redirect_url,
  };
}

// Xendit
export async function createXenditInvoice(req: CreateTransactionRequest): Promise<CreateTransactionResponse> {
  const baseUrl = req.sandbox
    ? "https://api.xendit.co"
    : "https://api.xendit.co";
  
  const auth = Buffer.from(req.apiKey + ":").toString("base64");
  const externalId = `${req.orderNumber}-${Date.now()}`;
  
  const response = await fetch(`${baseUrl}/v2/invoices`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: req.amount,
      payer_email: req.customerEmail,
      description: `Order #${req.orderNumber}`,
      payment_methods: ["QR_CODE"],
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Xendit API error: ${error}`);
  }
  
  const data = await response.json();
  return {
    externalId: data.external_id,
    qrUrl: data.qr_code_url || data.invoice_url,
    redirectUrl: data.invoice_url,
  };
}

// Verify webhook signature
export function verifyMidtransSignature(orderid: string, status: string, amount: number, serverKey: string): string {
  const signatureInput = `${orderid}${status}${Math.floor(amount)}${serverKey}`;
  return crypto.createHash("sha512").update(signatureInput).digest("hex");
}

export function verifyXenditCallback(callbackToken: string, apiSecret: string): boolean {
  return callbackToken === apiSecret;
}
```

### Block C — Update `processPayment()` Server Action

Update `src/actions/kasir.ts`:

```typescript
export async function processPayment(data: {
  orderId: string;
  employeeId: string;
  method: "CASH" | "QRIS" | "BANK_TRANSFER";
  cashEntered?: number;
  referenceNo?: string;
  paymentMethodId?: string;  // NEW: ID PaymentMethod untuk gateway
}): Promise<{ payment?: unknown; qrUrl?: string; externalId?: string; error?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      businessId: true,
      outletId: true,
    },
  });
  if (!order) return { error: "Order tidak ditemukan" };
  if (order.status !== "DRAFT" && order.status !== "ACTIVE") {
    return { error: "Order tidak dalam status yang bisa dibayar" };
  }

  // CASH: langsung mark PAID
  if (data.method === "CASH") {
    if (!data.cashEntered || data.cashEntered < order.totalAmount) {
      return { error: "Uang yang diterima kurang" };
    }
    
    const changeAmount = data.cashEntered - order.totalAmount;
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        businessId: order.businessId,
        outletId: order.outletId,
        employeeId: data.employeeId,
        method: data.method,
        totalAmount: order.totalAmount,
        cashEntered: data.cashEntered,
        changeAmount,
        status: "PAID",  // Cash langsung PAID
      },
    });

    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: "PAID", paidAt: new Date() },
    });

    return { payment };
  }

  // QRIS: check jika ada PaymentMethod dengan API key
  if (data.method === "QRIS" && data.paymentMethodId) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: data.paymentMethodId },
      select: { provider, apiKey, apiSecret, qrisImage },
    });
    
    // Jika ada API key → dynamic QRIS via gateway
    if (paymentMethod?.apiKey && paymentMethod.provider) {
      const { createMidtransTransaction, createXenditInvoice } = await import("@/lib/payment-gateway");
      
      let result;
      if (paymentMethod.provider === "MIDTRANS") {
        result = await createMidtransTransaction({
          provider: "MIDTRANS",
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          customerName: "Outlet",
          customerEmail: "outlet@business.com",
          apiKey: paymentMethod.apiKey,
          sandbox: true,  // TODO: detect dari settings
        });
      } else if (paymentMethod.provider === "XENDIT") {
        result = await createXenditInvoice({
          provider: "XENDIT",
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          customerName: "Outlet",
          customerEmail: "outlet@business.com",
          apiKey: paymentMethod.apiKey,
          sandbox: true,
        });
      } else {
        return { error: "Provider tidak didukung" };
      }
      
      // Create payment record dengan status PENDING
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          businessId: order.businessId,
          outletId: order.outletId,
          employeeId: data.employeeId,
          method: data.method,
          totalAmount: order.totalAmount,
          externalId: result.externalId,
          qrUrl: result.qrUrl,
          status: "PENDING",  // Menunggu callback
        },
      });
      
      // Order tetap ACTIVE, tunggu callback
      return { payment, qrUrl: result.qrUrl, externalId: result.externalId };
    }
    
    // Fallback: QRIS statis (upload QR image)
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        businessId: order.businessId,
        outletId: order.outletId,
        employeeId: data.employeeId,
        method: data.method,
        totalAmount: order.totalAmount,
        status: "PENDING",  // Kasir confirm manual
      },
    });
    
    return { payment, qrUrl: paymentMethod?.qrisImage ?? undefined };
  }

  return { error: "Metode pembayaran tidak valid" };
}

// NEW: Check payment status (untuk polling)
export async function checkPaymentStatus(paymentId: string): Promise<{ status: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { status: true },
  });
  return { status: payment?.status ?? "PENDING" };
}
```

### Block D — Webhook API Routes

Create `src/app/api/payment/midtrans/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, transaction_status, gross_amount, signature_key } = body;
  
  // Find payment by externalId
  const payment = await prisma.payment.findFirst({
    where: { externalId: order_id },
    include: { order: { include: { business: { include: { paymentMethods: true } } } } },
  });
  
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  
  // Get server key from PaymentMethod
  const paymentMethod = payment.order.business.paymentMethods.find(
    (pm) => pm.provider === "MIDTRANS"
  );
  if (!paymentMethod?.apiKey) {
    return NextResponse.json({ error: "Server key not found" }, { status: 400 });
  }
  
  // Verify signature
  const expectedSignature = verifyMidtransSignature(
    order_id,
    transaction_status,
    gross_amount,
    paymentMethod.apiKey
  );
  if (signature_key !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }
  
  // Update payment status
  if (transaction_status === "settlement" || transaction_status === "capture") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
  } else if (transaction_status === "expire" || transaction_status === "cancel") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: transaction_status === "expire" ? "EXPIRED" : "FAILED" },
    });
  }
  
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/payment/xendit/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXenditCallback } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  const callbackToken = req.headers.get("x-callback-token");
  const body = await req.json();
  const { external_id, status, paid_amount } = body;
  
  // Find payment by externalId
  const payment = await prisma.payment.findFirst({
    where: { externalId: external_id },
    include: { order: { include: { business: { include: { paymentMethods: true } } } } },
  });
  
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  
  // Get api secret from PaymentMethod
  const paymentMethod = payment.order.business.paymentMethods.find(
    (pm) => pm.provider === "XENDIT"
  );
  if (!paymentMethod?.apiSecret) {
    return NextResponse.json({ error: "API secret not found" }, { status: 400 });
  }
  
  // Verify callback token
  if (!callbackToken || !verifyXenditCallback(callbackToken, paymentMethod.apiSecret)) {
    return NextResponse.json({ error: "Invalid callback token" }, { status: 403 });
  }
  
  // Update payment status
  if (status === "PAID") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
  } else if (status === "EXPIRED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "EXPIRED" },
    });
  }
  
  return NextResponse.json({ ok: true });
}
```

### Block E — Update PaymentModal UI

Update `src/components/kasir/payment-modal.tsx`:

1. Detect jika method = QRIS dan ada PaymentMethod dengan apiKey
2. Call `processPayment()` dengan `paymentMethodId`
3. Jika dapat `qrUrl` → tampilkan QR dari URL (bukan upload statis)
4. Jika `status = PENDING` → start polling `checkPaymentStatus()` setiap 3 detik
5. Jika status berubah jadi PAID → call `onSuccess()`

```typescript
// Di handleProcessPayment
const result = await processPayment({
  orderId: order.id,
  employeeId,
  method: activeTab as "CASH" | "QRIS",
  cashEntered: activeTab === "CASH" ? cashEntered : undefined,
  paymentMethodId: activeTab === "QRIS" ? activeMethod?.id : undefined,
});

if (result.error) {
  setError(result.error);
  return;
}

// Jika QRIS dynamic (ada qrUrl + externalId)
if (result.qrUrl && result.externalId) {
  setQrUrl(result.qrUrl);
  setPaymentId((result.payment as any).id);
  
  // Start polling
  const interval = setInterval(async () => {
    const statusResult = await checkPaymentStatus((result.payment as any).id);
    if (statusResult.status === "PAID") {
      clearInterval(interval);
      onSuccess((result.payment as any).id);
    }
  }, 3000);
  
  // Cleanup setelah 5 menit
  setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  
  return;
}

// Jika CASH atau QRIS statis → langsung success
onSuccess((result.payment as any).id);
```

### Block F — Verifikasi & Commit

1. Run `npx tsc --noEmit` — 0 errors
2. Test flow di POS:
   - CASH → harus langsung PAID
   - QRIS statis (tanpa API key) → kasir confirm manual
   - QRIS dynamic (dengan API key) → generate QR, tampil, polling status
3. Test webhook callback (use ngrok atau webhook.site untuk local test)
4. Commit: `git add -A && git commit -m "feat(payment): integrate Midtrans and Xendit gateway for QRIS dynamic"`

---

## Environment Variables

Add to `.env`:

```
# Midtrans
MIDTRANS_SANDBOX=true
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx

# Xendit
XENDIT_SANDBOX=true
XENDIT_API_KEY=xnd_development_xxx
XENDIT_WEBHOOK_TOKEN=xxx
```

Note: API keys akan diambil dari `PaymentMethod` table (per-business), env vars hanya untuk fallback/testing.

---

## Testing

Manual test checklist:
- [ ] CASH payment → Order status PAID, Payment status PAID
- [ ] QRIS statis (upload image, no API key) → Order ACTIVE, Payment PENDING, kasir confirm manual
- [ ] QRIS dynamic Midtrans → QR generated, tampil di modal, polling status works
- [ ] QRIS dynamic Xendit → QR generated, tampil di modal, polling status works
- [ ] Midtrans webhook callback → Payment + Order status update ke PAID
- [ ] Xendit webhook callback → Payment + Order status update ke PAID
- [ ] Signature verification gagal → webhook return 403

---

## Catatan Teknis

- **Sandbox mode:** Hardcoded `sandbox: true` di Block C untuk development. Production nanti bisa toggle via `BusinessSettings.paymentGatewaySandbox`
- **Customer email:** Saat ini hardcoded `"outlet@business.com"`. Bisa ambil dari `Business.email` nanti
- **Polling timeout:** 5 menit. Setelah itu kasir harus refresh atau re-initiate payment
- **Error handling:** Gateway API error ditangkap dan return error message ke user
- **No refund API:** Out of scope Phase 6. Refund bisa manual di dashboard gateway (Midtrans/Xendit)

---

## Dependencies

- No new npm packages (fetch API sudah built-in Node.js 18+)
- Crypto module (built-in) untuk signature verification

---

## Definition of Done

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Migration applied successfully
- [ ] `processPayment()` detect API key → call gateway API
- [ ] Midtrans + Xendit API integration working
- [ ] Webhook routes created dan verify signature correctly
- [ ] PaymentModal tampilkan QR dari URL + polling status
- [ ] CASH payment still works (no regression)
- [ ] QRIS statis fallback still works
- [ ] Manual test passed (checklist di atas)
- [ ] Git commit dengan pesan yang jelas
