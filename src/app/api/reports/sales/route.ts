import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTransactionWhere, parseReportFilters } from "@/lib/report-filters";
import { decimalToNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const filters = parseReportFilters(new URL(request.url).searchParams);
  const summary = await prisma.transaction.aggregate({
    _sum: { grandTotal: true, subtotal: true, taxTotal: true, serviceChargeTotal: true },
    _count: true,
    where: buildTransactionWhere(filters),
  });

  return NextResponse.json({
    filters,
    count: summary._count,
    grandTotal: decimalToNumber(summary._sum.grandTotal),
    subtotal: decimalToNumber(summary._sum.subtotal),
    taxTotal: decimalToNumber(summary._sum.taxTotal),
    serviceChargeTotal: decimalToNumber(summary._sum.serviceChargeTotal),
  });
}
