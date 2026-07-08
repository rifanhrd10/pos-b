import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXenditCallback } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get("x-callback-token") ?? "";
    const body = await req.json();
    const { external_id, status } = body;

    if (!external_id || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Find payment by externalId
    const payment = await prisma.payment.findFirst({
      where: { externalId: external_id },
      include: {
        order: {
          include: {
            business: {
              include: {
                paymentMethods: {
                  where: { provider: "XENDIT" },
                  select: { apiSecret: true },
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

    // Verify callback token
    const expectedToken = payment.order.business.paymentMethods[0]?.apiSecret ?? "";
    if (!expectedToken || !verifyXenditCallback(callbackToken, expectedToken)) {
      return NextResponse.json({ error: "Invalid callback token" }, { status: 403 });
    }

    // Update based on status
    if (status === "PAID" || status === "SETTLED") {
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
  } catch (err) {
    console.error("Xendit callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
