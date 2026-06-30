import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate, rupiah } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      outlet: true,
      cashier: true,
      customer: true,
      items: { include: { modifiers: true } },
      payments: { include: { paymentMethod: true } },
    },
  });

  if (!transaction) {
    return new NextResponse("Transaksi tidak ditemukan.", { status: 404 });
  }

  const html = `<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Struk ${transaction.transactionNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      .wrap { max-width: 420px; margin: 0 auto; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 16px; }
      .row { display: flex; justify-content: space-between; gap: 12px; margin: 6px 0; }
      .muted { color: #64748b; font-size: 12px; }
      .title { text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 6px; }
      .center { text-align: center; }
      .divider { border-top: 1px dashed #cbd5e1; margin: 14px 0; }
      .item { margin-bottom: 10px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="title">${transaction.outlet.name}</div>
      <div class="center muted">${transaction.transactionNumber}</div>
      <div class="center muted">${formatDate(transaction.createdAt)}</div>
      <div class="divider"></div>
      <div class="row"><span>Kasir</span><span>${transaction.cashier.name}</span></div>
      <div class="row"><span>Pelanggan</span><span>${transaction.customer?.name || "-"}</span></div>
      <div class="divider"></div>
      ${transaction.items
        .map(
          (item) => `
        <div class="item">
          <div class="row"><strong>${item.productNameSnapshot} x${item.quantity}</strong><strong>${rupiah(decimalToNumber(item.subtotal))}</strong></div>
          ${item.modifiers
            .map((mod) => `<div class="row muted"><span>+ ${mod.modifierNameSnapshot}</span><span>${rupiah(decimalToNumber(mod.subtotal))}</span></div>`)
            .join("")}
        </div>`,
        )
        .join("")}
      <div class="divider"></div>
      <div class="row"><span>Subtotal</span><span>${rupiah(decimalToNumber(transaction.subtotal))}</span></div>
      <div class="row"><span>Pajak</span><span>${rupiah(decimalToNumber(transaction.taxTotal))}</span></div>
      <div class="row"><span>Service</span><span>${rupiah(decimalToNumber(transaction.serviceChargeTotal))}</span></div>
      <div class="row"><strong>Total</strong><strong>${rupiah(decimalToNumber(transaction.grandTotal))}</strong></div>
      <div class="divider"></div>
      ${transaction.payments
        .map((payment) => `<div class="row"><span>${payment.paymentMethod.name}</span><span>${rupiah(decimalToNumber(payment.amount))}</span></div>`)
        .join("")}
      <div class="divider"></div>
      <div class="center muted">${transaction.outlet.receiptFooter || "Terima kasih telah berbelanja."}</div>
    </div>
  </body>
  </html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
