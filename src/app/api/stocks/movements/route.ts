import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true, modifier: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(movements);
}
