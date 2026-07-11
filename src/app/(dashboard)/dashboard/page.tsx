import { auth, getBusinessContext } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  getDashboardStats,
  getRevenueChartData,
  getTopProducts,
  getPaymentBreakdown,
  getRecentTransactions,
  getLowStockAlerts,
  type Period,
} from "@/actions/reports"
import { rupiah } from "@/lib/utils"
import { KpiCard } from "@/components/shared/kpi-card"
import { PeriodSelector } from "@/components/shared/period-selector"
import { RecentTransactionsCard } from "@/components/shared/recent-transactions-card"
import { LowStockCard } from "@/components/shared/low-stock-card"
import { AreaChart } from "@/components/charts/area-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { TrendingUp, ShoppingCart, CreditCard, Package } from "lucide-react"
import { Suspense } from "react"

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>
}

function isValidPeriod(value: string | undefined): value is Period {
  return value === "today" || value === "7days" || value === "30days"
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/onboarding/business")

  const { businessId, businessName } = ctx

  const resolvedParams = await searchParams
  const period: Period = isValidPeriod(resolvedParams.period) ? resolvedParams.period : "today"

  const [stats, chartData, topProducts, paymentBreakdown, recentTransactions, lowStockAlerts] =
    await Promise.all([
      getDashboardStats(businessId, period),
      getRevenueChartData(businessId, period),
      getTopProducts(businessId, period, 5),
      getPaymentBreakdown(businessId, period),
      getRecentTransactions(businessId, 5),
      getLowStockAlerts(businessId, 10),
    ])

  const topProductsChartData = topProducts.map((p) => ({
    name: p.name,
    value: p.revenue,
  }))

  const recentTransactionsMapped = recentTransactions.map((t) => ({
    id: t.id,
    orderNumber: t.orderNumber,
    outletName: t.outletName,
    employeeName: t.employeeName,
    method: t.method,
    totalAmount: Number(t.totalAmount),
    createdAt: t.createdAt,
  }))

  const lowStockMapped = lowStockAlerts.map((a) => ({
    productName: a.name,
    categoryName: a.category,
    outletName: a.outlet,
    currentStock: a.stock,
  }))

  const paymentBreakdownMapped = paymentBreakdown.map((p) => ({
    method: p.method,
    count: p.count,
    amount: Number(p.amount),
  }))

  const periodLabel = period === "today" ? "hari ini" : period === "7days" ? "7 hari terakhir" : "30 hari terakhir"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang, <span className="font-medium">{businessName}</span> — data {periodLabel}
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-lg bg-gray-100" />}>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Pendapatan"
          value={rupiah(Number(stats.revenue))}
          change={stats.revenueChange}
          changeLabel="vs periode sebelumnya"
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
        />
        <KpiCard
          label="Transaksi"
          value={stats.transactions.toString()}
          change={stats.transactionsChange}
          changeLabel="vs periode sebelumnya"
          icon={<ShoppingCart className="h-5 w-5" />}
          color="green"
        />
        <KpiCard
          label="Rata-rata Order"
          value={rupiah(Number(stats.avgOrderValue))}
          icon={<CreditCard className="h-5 w-5" />}
          color="purple"
        />
        <KpiCard
          label="Item Terjual"
          value={Number(stats.itemsSold).toString()}
          icon={<Package className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Grafik Omzet</h2>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-500">Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <AreaChart data={chartData} height={220} />
        )}
      </div>

      {/* Top Products + Payment Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Produk Terlaris</h2>
          {topProductsChartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-gray-500">Belum ada data produk</p>
            </div>
          ) : (
            <BarChart data={topProductsChartData} height={250} />
          )}
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Metode Pembayaran</h2>
          {paymentBreakdownMapped.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-gray-500">Belum ada data pembayaran</p>
            </div>
          ) : (
            <DonutChart data={paymentBreakdownMapped} height={200} />
          )}
        </div>
      </div>

      {/* Recent Transactions + Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactionsCard
          initialTransactions={recentTransactionsMapped}
          businessId={businessId}
        />
        <LowStockCard alerts={lowStockMapped} />
      </div>
    </div>
  )
}
