import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTransactionWhere, parseReportFilters } from "@/lib/report-filters";
import { decimalToNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const filters = parseReportFilters(new URL(request.url).searchParams);
  const products = await prisma.transactionItem.groupBy({
    by: ["productNameSnapshot"],
    where: {
      transaction: buildTransactionWhere(filters),
    },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
  });

  return NextResponse.json(
    products.map((item) => ({
      productName: item.productNameSnapshot,
      quantity: item._sum.quantity || 0,
      subtotal: decimalToNumber(item._sum.subtotal),
    })),
  );
}
