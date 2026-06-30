import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}
