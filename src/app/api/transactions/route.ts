import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    where: { deletedAt: null },
    include: { cashier: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}
