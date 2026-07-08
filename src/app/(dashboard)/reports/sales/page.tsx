import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSalesReport } from "@/actions/reports";
import { getOutlets } from "@/actions/outlets";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import { LineChart } from "@/components/charts/line-chart";
import { formatRp, formatDate, formatDateYYYYMMDD } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; outletId?: string }>;
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

  const startStr = params.start ?? defaultStart;
  const endStr = params.end ?? defaultEnd;
  const outletId = params.outletId;

  const startDate = new Date(startStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endStr);
  endDate.setHours(23, 59, 59, 999);

  const [report, outlets] = await Promise.all([
    getSalesReport(ctx.businessId, startDate, endDate, outletId),
    getOutlets(ctx.businessId),
  ]);

  const { dailyData, summary } = report;

  const tableRows = [...dailyData].sort((a, b) => b.date.localeCompare(a.date));

  const exportData = tableRows.map((row) => ({
    date: row.date,
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
              { key: "transactions", label: "Jumlah Transaksi" },
              { key: "revenue", label: "Total Pendapatan" },
            ]}
          />
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker startDate={startStr} endDate={endStr} />

        <form method="GET">
          <input type="hidden" name="start" value={startStr} />
          <input type="hidden" name="end" value={endStr} />
          <select
            name="outletId"
            defaultValue={outletId ?? ""}
            onChange={() => {}}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-soft"
          >
            <option value="">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Rata-rata per Transaksi
          </p>
          <p className="mt-2 font-sans text-2xl font-bold text-slate-900">
            {formatRp(summary.avg)}
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
                    Transaksi
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Pendapatan
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
                      {row.transactions.toLocaleString("id-ID")}
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
