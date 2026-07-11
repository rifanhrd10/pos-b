import { auth, getBusinessContext } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCashierReport } from "@/actions/reports"
import { PageHeader } from "@/components/layout/page-header"
import { BarChart } from "@/components/charts/bar-chart"
import { KpiCard } from "@/components/shared/kpi-card"
import { formatRp } from "@/lib/format"
import { Users, ShoppingCart, TrendingUp } from "lucide-react"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { ExportExcelButton } from "@/components/shared/export-excel-button"

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string }>
}

function getDefaultDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  return {
    startStr: start.toISOString().slice(0, 10),
    endStr: end.toISOString().slice(0, 10),
  }
}

export default async function CashierReportPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/dashboard")

  const { start, end } = await searchParams
  const { startStr, endStr } = getDefaultDates()
  const startDate = new Date(start ?? startStr)
  const endDate = new Date(end ?? endStr)
  // set endDate to end of day
  endDate.setHours(23, 59, 59, 999)

  const data = await getCashierReport(ctx.businessId, startDate, endDate)

  const totalCashiers = data.length
  const totalTransactions = data.reduce((sum, r) => sum + r.transactions, 0)
  const totalRevenue = data.reduce((sum, r) => sum + r.totalRevenue, 0)

  const chartData = data.map((r) => ({
    name: r.employeeName,
    value: r.totalRevenue,
  }))

  const exportColumns = [
    { key: "employeeName", label: "Kasir" },
    { key: "sessions", label: "Jumlah Sesi" },
    { key: "transactions", label: "Jumlah Transaksi" },
    { key: "totalRevenue", label: "Total Revenue" },
    { key: "avgPerTransaction", label: "Rata-rata/Transaksi" },
  ]

  const exportData = data.map((r) => ({
    employeeName: r.employeeName,
    sessions: r.sessions,
    transactions: r.transactions,
    totalRevenue: r.totalRevenue,
    avgPerTransaction: r.avgPerTransaction,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Kasir"
        description="Laporan kinerja kasir berdasarkan periode"
        breadcrumb="Laporan / Kasir"
        actions={
          <ExportExcelButton
            data={exportData}
            filename="laporan-kasir"
            columns={exportColumns}
          />
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <DateRangePicker
          startDate={start ?? startStr}
          endDate={end ?? endStr}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Kasir Aktif"
          value={totalCashiers.toString()}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <KpiCard
          label="Total Transaksi"
          value={totalTransactions.toLocaleString("id-ID")}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="purple"
        />
        <KpiCard
          label="Total Revenue"
          value={formatRp(totalRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Revenue per Kasir</h2>
          <BarChart data={chartData} color="#8b5cf6" height={Math.max(200, chartData.length * 50)} />
        </div>
      )}

      {/* Table */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Detail Kasir</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kasir</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Jumlah Sesi</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Jumlah Transaksi</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Total Revenue</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Avg/Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data untuk periode ini
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      {row.employeeName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 text-right">
                      {row.sessions.toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 text-right">
                      {row.transactions.toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 text-right">
                      {formatRp(row.totalRevenue)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 text-right">
                      {formatRp(row.avgPerTransaction)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
