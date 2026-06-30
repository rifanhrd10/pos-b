import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = supplierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input supplier tidak valid." }, { status: 400 });
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ message: "Supplier berhasil dihapus." });
}
