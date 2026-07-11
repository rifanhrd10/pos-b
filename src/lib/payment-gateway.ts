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

/**
 * Create a Midtrans Snap transaction and return the QR URL.
 * Docs: https://docs.midtrans.com/reference/snap-api-overview
 */
export async function createMidtransTransaction(
  req: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  const baseUrl = req.sandbox
    ? "https://app.sandbox.midtrans.com"
    : "https://app.midtrans.com";

  const auth = Buffer.from(req.apiKey + ":").toString("base64");
  const externalId = `${req.orderNumber}-${Date.now()}`;

  const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: externalId,
        gross_amount: Math.round(req.amount), // Midtrans requires integer
      },
      customer_details: {
        first_name: req.customerName,
        email: req.customerEmail,
      },
      enabled_payments: ["qris"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Midtrans API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  return {
    externalId,
    qrUrl: data.qr_code ?? data.redirect_url ?? "",
    redirectUrl: data.redirect_url,
  };
}

/**
 * Create a Xendit invoice and return the QR URL.
 * Docs: https://developers.xendit.co/api-reference/#create-invoice
 */
export async function createXenditInvoice(
  req: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  const auth = Buffer.from(req.apiKey + ":").toString("base64");
  const externalId = `${req.orderNumber}-${Date.now()}`;

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: Math.round(req.amount),
      payer_email: req.customerEmail,
      description: `Order #${req.orderNumber}`,
      payment_methods: ["QR_CODE"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Xendit API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  return {
    externalId: data.external_id ?? externalId,
    qrUrl: data.qr_code_url ?? data.invoice_url ?? "",
    redirectUrl: data.invoice_url,
  };
}

/**
 * Verify Midtrans webhook signature.
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  incomingSignature: string
): boolean {
  const signatureInput = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expected = crypto
    .createHash("sha512")
    .update(signatureInput)
    .digest("hex");
  return expected === incomingSignature;
}

/**
 * Verify Xendit callback token.
 */
export function verifyXenditCallback(
  callbackToken: string,
  expectedToken: string
): boolean {
  // Use timingSafeEqual to prevent timing attacks
  try {
    const a = Buffer.from(callbackToken);
    const b = Buffer.from(expectedToken);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
