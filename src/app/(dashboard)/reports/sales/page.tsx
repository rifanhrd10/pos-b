import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSalesReport } from "@/actions/reports";
import { getOutlets } from "@/actions/outlets";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import { LineChart } from "@/components/charts/line-chart";
import { formatRp, formatDate, formatDateYYYYMMDD } from "@/lib/format";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; start_date?: string; end_date?: string; outletId?: string; method?: string }>;
}

export default async function SalesReportPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/login");

  const params = await searchParams;

  const now = new Date();
  const defaultEnd = formatDateYYYYMMDD(now);
  const defaultStart = formatDateYYYYMMDD(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const startStr = params.start_date ?? params.start ?? defaultStart;
  const endStr = params.end_date ?? params.end ?? defaultEnd;
  const outletId = params.outletId;
  const method = params.method;

  const startDate = new Date(startStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endStr);
  endDate.setHours(23, 59, 59, 999);

  const [report, outlets, paymentMethods] = await Promise.all([
    getSalesReport(ctx.businessId, startDate, endDate, outletId, method),
    getOutlets(ctx.businessId),
    prisma.payment.findMany({
      where: { businessId: ctx.businessId },
      distinct: ["method"],
      select: { method: true },
      orderBy: { method: "asc" },
    }),
  ]);

  const { dailyData, summary } = report;

  const tableRows = [...dailyData].sort((a, b) => b.date.localeCompare(a.date));

  const exportData = tableRows.map((row) => ({
    date: row.date,
    qrisTransactions: row.qrisTransactions,
    qrisRevenue: row.qrisRevenue,
    cashTransactions: row.cashTransactions,
    cashRevenue: row.cashRevenue,
    transactions: row.transactions,
    revenue: row.revenue,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Penjualan"
        description="Laporan penjualan harian"
        breadcrumb="Laporan / Penjualan"
        actions={
          <ExportExcelButton
            data={exportData}
            filename={`laporan-penjualan-${startStr}-${endStr}`}
            columns={[
              { key: "date", label: "Tanggal" },
              { key: "qrisTransactions", label: "Transaksi QRIS" },
              { key: "qrisRevenue", label: "Pendapatan QRIS" },
              { key: "cashTransactions", label: "Transaksi Tunai" },
              { key: "cashRevenue", label: "Pendapatan Tunai" },
              { key: "transactions", label: "Total Transaksi" },
              { key: "revenue", label: "Total Pendapatan" },
            ]}
          />
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker startDate={startStr} endDate={endStr} />

        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="start_date" value={startStr} />
          <input type="hidden" name="end_date" value={endStr} />
          <select
            name="outletId"
            defaultValue={outletId ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-soft"
          >
            <option value="">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            name="method"
            defaultValue={method ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-soft"
          >
            <option value="">Semua Metode</option>
            <option value="QRIS">QRIS</option>
            <option value="CASH">Tunai</option>
            {paymentMethods
              .filter((item) => !["QRIS", "CASH"].includes(item.method))
              .map((item) => (
                <option key={item.method} value={item.method}>{item.method}</option>
              ))}
          </select>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Terapkan
          </button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total QRIS
          </p>
          <p className="mt-2 font-sans text-2xl font-bold text-slate-900">
            {formatRp(summary.qrisTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{summary.qrisCount.toLocaleString("id-ID")} transaksi</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Tunai
          </p>
          <p className="mt-2 font-sans text-2xl font-bold text-slate-900">
            {formatRp(summary.cashTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{summary.cashCount.toLocaleString("id-ID")} transaksi</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Pendapatan
          </p>
          <p className="mt-2 font-sans text-2xl font-bold text-slate-900">
            {formatRp(summary.total)}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Transaksi
          </p>
          <p className="mt-2 font-sans text-2xl font-bold text-slate-900">
            {summary.count.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-sans text-base font-semibold text-slate-900">
          Omzet per Hari
        </h2>
        {dailyData.length > 0 ? (
          <LineChart data={dailyData} height={280} />
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
            Tidak ada data untuk periode ini
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-soft">
        <div className="p-6">
          <h2 className="font-sans text-base font-semibold text-slate-900">
            Rincian Harian
          </h2>
        </div>
        {tableRows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Tidak ada data penjualan untuk periode ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Transaksi QRIS
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Pendapatan QRIS
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Transaksi Tunai
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Pendapatan Tunai
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Total Transaksi
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Total Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-700">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {row.qrisTransactions.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {formatRp(row.qrisRevenue)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {row.cashTransactions.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {formatRp(row.cashRevenue)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {row.transactions > 0 ? (
                        <Link
                          href={`/reports/sales/transactions?start_date=${row.date}&end_date=${row.date}${outletId ? `&outletId=${outletId}` : ""}${method ? `&method=${method}` : ""}`}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          {row.transactions.toLocaleString("id-ID")}
                        </Link>
                      ) : (
                        row.transactions.toLocaleString("id-ID")
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      {formatRp(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
