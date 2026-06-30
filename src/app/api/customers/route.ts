import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET() {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { transactions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const parsed = customerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input pelanggan tidak valid." }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
    },
  });

  return NextResponse.json({
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    transactionCount: 0,
  });
}
