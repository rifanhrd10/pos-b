import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outlet = await prisma.outlet.findFirstOrThrow({ where: { deletedAt: null } });
  const record = await prisma.outletAddon.findFirst({
    where: { outletId: outlet.id, addonId: id },
  });

  if (!record) {
    return NextResponse.json({ message: "Add-on outlet tidak ditemukan." }, { status: 404 });
  }

  await prisma.outletAddon.update({
    where: { id: record.id },
    data: {
      status: "INACTIVE",
      expiredAt: null,
    },
  });

  return NextResponse.json({ message: "Add-on berhasil dinonaktifkan." });
}
