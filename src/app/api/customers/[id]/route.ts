import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = customerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input pelanggan tidak valid." }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
    },
  });

  const transactionCount = await prisma.transaction.count({ where: { customerId: id } });

  return NextResponse.json({
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    transactionCount,
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ message: "Pelanggan berhasil dihapus." });
}
