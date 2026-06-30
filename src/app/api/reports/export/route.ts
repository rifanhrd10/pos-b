import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTransactionWhere, parseReportFilters } from "@/lib/report-filters";
import { decimalToNumber } from "@/lib/utils";

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "sales";
  const filters = parseReportFilters(url.searchParams);
  const where = buildTransactionWhere(filters);

  if (type === "products") {
    const products = await prisma.transactionItem.groupBy({
      by: ["productNameSnapshot"],
      where: { transaction: where },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
    });

    const rows = [
      ["Produk", "Qty", "Subtotal"],
      ...products.map((item) => [
        item.productNameSnapshot,
        item._sum.quantity || 0,
        decimalToNumber(item._sum.subtotal),
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"bayaro-laporan-produk.csv\"`,
      },
    });
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      cashier: true,
      payments: { include: { paymentMethod: true } },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Nomor Transaksi", "Tanggal", "Kasir", "Pelanggan", "Subtotal", "Pajak", "Service Charge", "Grand Total", "Pembayaran"],
    ...transactions.map((transaction) => [
      transaction.transactionNumber,
      transaction.createdAt.toISOString(),
      transaction.cashier.name,
      transaction.customer?.name || "",
      decimalToNumber(transaction.subtotal),
      decimalToNumber(transaction.taxTotal),
      decimalToNumber(transaction.serviceChargeTotal),
      decimalToNumber(transaction.grandTotal),
      transaction.payments.map((payment) => payment.paymentMethod.name).join(" / "),
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"bayaro-laporan-penjualan.csv\"`,
    },
  });
}
