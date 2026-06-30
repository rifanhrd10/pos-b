import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shiftOpenSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const parsed = shiftOpenSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input buka shift tidak valid." }, { status: 400 });
  }

  const existing = await prisma.shift.findFirst({
    where: { userId: parsed.data.userId, status: "OPEN" },
  });
  if (existing) {
    return NextResponse.json({ message: "Kasir ini masih memiliki shift OPEN." }, { status: 409 });
  }

  const shift = await prisma.shift.create({
    data: {
      outletId: parsed.data.outletId,
      userId: parsed.data.userId,
      openedAt: new Date(),
      openingCash: parsed.data.openingCash,
      status: "OPEN",
      note: parsed.data.note || null,
    },
  });

  return NextResponse.json(shift);
}
