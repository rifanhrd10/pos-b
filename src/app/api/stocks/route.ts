import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { stock: "asc" },
  });
  return NextResponse.json(products);
}
