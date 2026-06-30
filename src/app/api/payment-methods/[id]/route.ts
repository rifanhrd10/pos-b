import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method) {
    return NextResponse.json({ message: "Metode pembayaran tidak ditemukan." }, { status: 404 });
  }

  const updated = await prisma.paymentMethod.update({
    where: { id },
    data: { isActive: !method.isActive },
  });

  return NextResponse.json(updated);
}
