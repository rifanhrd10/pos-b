import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

export async function GET() {
  const [productCount, categoryCount, transactionCount, sales] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.transaction.aggregate({
      _sum: { grandTotal: true },
      where: { status: "PAID", deletedAt: null },
    }),
  ]);

  return NextResponse.json({
    productCount,
    categoryCount,
    transactionCount,
    salesTotal: decimalToNumber(sales._sum.grandTotal),
  });
}
