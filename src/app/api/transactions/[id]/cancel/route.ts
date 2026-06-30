import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  }
  if (transaction.status === "REFUNDED" || transaction.status === "CANCELLED") {
    return NextResponse.json({ message: "Transaksi sudah tidak bisa di-cancel lagi." }, { status: 400 });
  }

  await prisma.transaction.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ message: "Transaksi berhasil di-cancel." });
}
