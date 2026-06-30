import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      cashier: true,
      customer: true,
      outlet: true,
      items: { include: { modifiers: true } },
      payments: { include: { paymentMethod: true } },
    },
  });

  if (!transaction || transaction.deletedAt) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(transaction);
}
