import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const parsed = supplierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input supplier tidak valid." }, { status: 400 });
  }

  const outlet = await prisma.outlet.findFirstOrThrow({ where: { deletedAt: null } });
  const supplier = await prisma.supplier.create({
    data: {
      outletId: outlet.id,
      name: parsed.data.name,
      contactPerson: parsed.data.contactPerson || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({
    ...supplier,
    createdAt: supplier.createdAt.toISOString(),
  });
}
