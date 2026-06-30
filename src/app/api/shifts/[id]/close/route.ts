import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shiftCloseSchema } from "@/lib/validations";
import { decimalToNumber } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = shiftCloseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input tutup shift tidak valid." }, { status: 400 });
  }

  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift || shift.status !== "OPEN") {
    return NextResponse.json({ message: "Shift OPEN tidak ditemukan." }, { status: 404 });
  }

  const cashPaid = await prisma.transaction.aggregate({
    _sum: { paidTotal: true },
    where: {
      shiftId: id,
      status: "PAID",
      payments: { some: { paymentMethod: { type: "CASH" } } },
    },
  });

  const expectedCash = decimalToNumber(shift.openingCash) + decimalToNumber(cashPaid._sum.paidTotal);
  const cashDifference = parsed.data.closingCash - expectedCash;

  const closed = await prisma.shift.update({
    where: { id },
    data: {
      closedAt: new Date(),
      closingCash: parsed.data.closingCash,
      expectedCash,
      cashDifference,
      status: "CLOSED",
      note: parsed.data.note || shift.note,
    },
  });

  return NextResponse.json(closed);
}
