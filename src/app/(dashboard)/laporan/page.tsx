import { prisma } from "@/lib/prisma";
import { decimalToNumber, rupiah } from "@/lib/utils";
import { buildTransactionWhere, parseReportFilters } from "@/lib/report-filters";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

function percentage(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(8, Math.round((value / max) * 100));
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseReportFilters(await searchParams);
  const transactionWhere = buildTransactionWhere(filters);
  const exportQuery = new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) => (value ? [[key, value]] : [])),
  ).toString();

  const [cashiers, paymentMethods, sales, transactions, topProducts, paymentBreakdown] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.transaction.aggregate({
      _sum: { grandTotal: true },
      _count: true,
      where: transactionWhere,
    }),
    prisma.transaction.findMany({
      where: transactionWhere,
      include: { cashier: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.transactionItem.groupBy({
      by: ["productNameSnapshot"],
      where: {
        transaction: transactionWhere,
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.transactionPayment.groupBy({
      by: ["paymentMethodId"],
      where: {
        transaction: transactionWhere,
      },
      _sum: { amount: true },
    }),
  ]);

  const methodMap = new Map(paymentMethods.map((item) => [item.id, item.name]));
  const omzet = decimalToNumber(sales._sum.grandTotal);
  const transactionCount = sales._count;
  const averageTicket = transactionCount > 0 ? omzet / transactionCount : 0;
  const topProductMaxQty = Math.max(...topProducts.map((item) => Number(item._sum.quantity || 0)), 0);
  const paymentMaxAmount = Math.max(...paymentBreakdown.map((item) => decimalToNumber(item._sum.amount)), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Data transaksi PAID sudah siap dipakai untuk laporan penjualan dasar dengan seluruh metode pembayaran yang aktif di sistem."
        breadcrumb="Analitik / Laporan"
        actions={
          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/reports/export?type=sales${exportQuery ? `&${exportQuery}` : ""}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Export Penjualan CSV
            </a>
            <a
              href={`/api/reports/export?type=products${exportQuery ? `&${exportQuery}` : ""}`}
              className="inline-flex items-center justify-center rounded-2xl bg-bayaro-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102864]"
            >
              Export Produk CSV
            </a>
          </div>
        }
      />
      <form className="grid gap-4 rounded-[28px] bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal dari</label>
          <input
            type="date"
            name="dateFrom"
            defaultValue={filters.dateFrom}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal sampai</label>
          <input
            type="date"
            name="dateTo"
            defaultValue={filters.dateTo}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Kasir</label>
          <select
            name="cashierId"
            defaultValue={filters.cashierId || ""}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
          >
            <option value="">Semua kasir</option>
            {cashiers.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>{cashier.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Metode pembayaran</label>
          <select
            name="paymentMethodId"
            defaultValue={filters.paymentMethodId || ""}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
          >
            <option value="">Semua metode</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button className="inline-flex w-full items-center justify-center rounded-2xl bg-bayaro-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#102864]" type="submit">
            Terapkan Filter
          </button>
          <a
            href="/laporan"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </a>
        </div>
      </form>
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Transaksi PAID</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{sales._count}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Omzet</p>
          <p className="mt-3 text-3xl font-bold text-bayaro-navy">{rupiah(decimalToNumber(sales._sum.grandTotal))}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Status modul</p>
          <div className="mt-3"><Badge tone="success">Full Access</Badge></div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft md:col-span-3">
          <p className="text-sm text-slate-500">Rata-rata nilai transaksi</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <p className="text-3xl font-bold text-emerald-600">{rupiah(averageTicket)}</p>
            <p className="max-w-2xl text-sm text-slate-500">
              Nilai ini dihitung dari total omzet dibagi jumlah transaksi dengan status <span className="font-semibold text-slate-700">PAID</span>
              {" "}berdasarkan filter yang sedang aktif.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Produk Terlaris</h2>
          {topProducts.length > 0 ? (
            <div className="mt-5 space-y-4">
              {topProducts.map((item) => {
                const quantity = Number(item._sum.quantity || 0);
                return (
                  <div key={item.productNameSnapshot} className="rounded-3xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.productNameSnapshot}</p>
                        <p className="text-sm text-slate-500">{quantity} item terjual</p>
                      </div>
                      <p className="font-semibold text-bayaro-navy">{rupiah(decimalToNumber(item._sum.subtotal))}</p>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-bayaro-blue via-sky-400 to-cyan-300"
                        style={{ width: `${percentage(quantity, topProductMaxQty)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Belum ada transaksi <span className="font-semibold text-slate-700">PAID</span> untuk filter ini, jadi grafik produk terlaris masih kosong.
            </div>
          )}
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Metode Pembayaran</h2>
          {paymentBreakdown.length > 0 ? (
            <div className="mt-5 space-y-4">
              {paymentBreakdown.map((item) => {
                const amount = decimalToNumber(item._sum.amount);
                return (
                  <div key={item.paymentMethodId} className="rounded-3xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-slate-900">{methodMap.get(item.paymentMethodId) || "Metode"}</p>
                      <p className="font-semibold text-bayaro-navy">{rupiah(amount)}</p>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300"
                        style={{ width: `${percentage(amount, paymentMaxAmount)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Belum ada pembayaran yang cocok dengan filter aktif, jadi distribusi metode pembayaran belum bisa ditampilkan.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Transaksi Terbaru</h2>
        {transactions.length > 0 ? (
          <div className="mt-5 space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between rounded-3xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{transaction.transactionNumber}</p>
                  <p className="text-sm text-slate-500">{transaction.cashier.name}</p>
                </div>
                <p className="font-semibold text-bayaro-navy">{rupiah(decimalToNumber(transaction.grandTotal))}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Belum ada transaksi <span className="font-semibold text-slate-700">PAID</span> yang masuk ke laporan ini.
          </div>
        )}
      </div>
    </div>
  );
}
