import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    include: {
      images: { where: { deletedAt: null, isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}
