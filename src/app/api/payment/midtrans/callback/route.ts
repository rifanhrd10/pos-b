import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    if (!order_id || !transaction_status || !signature_key) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Find payment by externalId
    const payment = await prisma.payment.findFirst({
      where: { externalId: order_id },
      include: {
        order: {
          include: {
            business: {
              include: {
                paymentMethods: {
                  where: { provider: "MIDTRANS" },
                  select: { apiKey: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!payment || !payment.order) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get server key
    const serverKey = payment.order.business.paymentMethods[0]?.apiKey;
    if (!serverKey) {
      return NextResponse.json({ error: "Server key not found" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code ?? "200",
      gross_amount ?? String(Math.round(payment.totalAmount)),
      serverKey,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Update based on transaction_status
    if (transaction_status === "settlement" || transaction_status === "capture") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID", paidAt: new Date() },
      });
    } else if (transaction_status === "expire") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "EXPIRED" },
      });
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "failure"
    ) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Midtrans callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
