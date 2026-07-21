import { auth, getBusinessContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOutlets } from "@/actions/outlets";
import { getSalesTransactionsReport } from "@/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateYYYYMMDD, formatRp } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; start_date?: string; end_date?: string; outletId?: string; method?: string; cashierId?: string; search?: string; page?: string }>;
}

export default async function SalesTransactionsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const params = await searchParams;
  const now = new Date();
  const defaultEnd = formatDateYYYYMMDD(now);
  const defaultStart = params.start_date ?? params.start ?? defaultEnd;
  const startStr = params.start_date ?? params.start ?? defaultStart;
  const endStr = params.end_date ?? params.end ?? defaultEnd;
  const startDate = new Date(startStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endStr);
  endDate.setHours(23, 59, 59, 999);

  const [report, outlets, cashiers] = await Promise.all([
    getSalesTransactionsReport(ctx.businessId, startDate, endDate, {
      outletId: params.outletId,
      method: params.method,
      cashierId: params.cashierId,
      search: params.search,
      page: params.page ? Number(params.page) : 1,
    }),
    getOutlets(ctx.businessId),
    prisma.employee.findMany({
      where: { businessId: ctx.businessId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Transaksi Penjualan"
        description={`Periode ${formatDate(startDate)} - ${formatDate(endDate)}`}
        breadcrumb="Laporan / Penjualan / Detail Transaksi"
        actions={
          <Link href={`/reports/sales?start_date=${startStr}&end_date=${endStr}${params.outletId ? `&outletId=${params.outletId}` : ""}${params.method ? `&method=${params.method}` : ""}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Laporan
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker startDate={startStr} endDate={endStr} />
        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="start_date" value={startStr} />
          <input type="hidden" name="end_date" value={endStr} />
          <select name="outletId" defaultValue={params.outletId ?? ""} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">Semua Outlet</option>
            {outlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
          </select>
          <select name="method" defaultValue={params.method ?? ""} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">Semua Pembayaran</option>
            <option value="CASH">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="QRIS_STATIC">QRIS Statis</option>
            <option value="QRIS_DYNAMIC">QRIS Dinamis</option>
          </select>
          <select name="cashierId" defaultValue={params.cashierId ?? ""} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">Semua Kasir</option>
            {cashiers.map((cashier) => <option key={cashier.id} value={cashier.id}>{cashier.name}</option>)}
          </select>
          <input name="search" defaultValue={params.search ?? ""} placeholder="Cari no transaksi/pelanggan..." className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" />
          <button type="submit" className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">Filter</button>
        </form>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="font-semibold text-slate-900">Daftar Transaksi</h2>
          <p className="text-sm text-slate-500">{report.total.toLocaleString("id-ID")} transaksi ditemukan.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">No Transaksi</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kasir</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Pelanggan</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Item</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Subtotal</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Diskon</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Pajak</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Total</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Bayar</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-400">Tidak ada transaksi untuk filter ini.</td>
                </tr>
              ) : (
                report.orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{order.orderNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(order.paidAt ?? order.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{order.cashierName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{order.customerName}</td>
                    <td className="min-w-[260px] px-4 py-3 text-slate-600">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-3">
                            <span>{item.quantity}x {item.name}{item.variantName ? ` (${item.variantName})` : ""}</span>
                            <span className="whitespace-nowrap">{formatRp(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatRp(order.subtotal)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatRp(order.discountAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatRp(order.taxAmount + order.serviceAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{formatRp(order.totalAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{order.method}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge tone="success">{order.paymentStatus}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
