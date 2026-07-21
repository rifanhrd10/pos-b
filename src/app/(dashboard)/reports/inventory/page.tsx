import { auth, getBusinessContext } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getInventoryReport } from "@/actions/reports"
import { getOutlets } from "@/actions/outlets"
import { getCategories } from "@/actions/categories"
import { PageHeader } from "@/components/layout/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { Package, AlertTriangle, AlertOctagon } from "lucide-react"
import { ExportExcelButton } from "@/components/shared/export-excel-button"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { formatDateYYYYMMDD } from "@/lib/format"

interface PageProps {
  searchParams: Promise<{ outletId?: string; categoryId?: string; start?: string; end?: string; start_date?: string; end_date?: string; type?: string; search?: string; page?: string }>
}

export default async function InventoryReportPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/dashboard")

  const params = await searchParams
  const { outletId, categoryId, type, search } = params
  const now = new Date()
  const defaultEnd = formatDateYYYYMMDD(now)
  const defaultStart = formatDateYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const startStr = params.start_date ?? params.start ?? defaultStart
  const endStr = params.end_date ?? params.end ?? defaultEnd
  const startDate = new Date(startStr)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(endStr)
  endDate.setHours(23, 59, 59, 999)

  const [data, outlets, categories] = await Promise.all([
    getInventoryReport(ctx.businessId, outletId, categoryId),
    getOutlets(ctx.businessId),
    getCategories(ctx.businessId),
  ])

  const totalProducts = data.length
  const lowStock = data.filter((r) => r.currentStock < 10 && r.currentStock >= 5).length
  const criticalStock = data.filter((r) => r.currentStock < 5).length

  const exportColumns = [
    { key: "name", label: "Produk" },
    { key: "category", label: "Kategori" },
    { key: "outlet", label: "Outlet" },
    { key: "currentStock", label: "Stok Saat Ini" },
  ]

  const exportData = data.map((r) => ({
    name: r.name,
    category: r.category,
    outlet: r.outlet,
    currentStock: r.currentStock,
  }))

  const getRowClass = (stock: number) => {
    if (stock < 5) return "bg-red-50 hover:bg-red-100"
    if (stock < 10) return "bg-yellow-50 hover:bg-yellow-100"
    return "hover:bg-slate-50/50"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Stock"
        description="Laporan stok dan riwayat pergerakan stock produk per outlet"
        breadcrumb="Laporan / Stock"
        actions={
          <ExportExcelButton
            data={exportData}
            filename="laporan-stock"
            columns={exportColumns}
          />
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker startDate={startStr} endDate={endStr} />
        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="start_date" value={startStr} />
          <input type="hidden" name="end_date" value={endStr} />
          <select
            name="outletId"
            defaultValue={outletId ?? ""}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={type ?? ""}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Jenis</option>
            <option value="IN">Stock Masuk</option>
            <option value="OUT">Stock Keluar</option>
            <option value="ADJUSTMENT">Penyesuaian</option>
            <option value="TRANSFER">Transfer</option>
            <option value="OPNAME">Opname</option>
          </select>
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cari produk..."
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Produk"
          value={totalProducts.toLocaleString("id-ID")}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <KpiCard
          label="Stok Rendah (< 10)"
          value={lowStock.toLocaleString("id-ID")}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
        />
        <KpiCard
          label="Stok Kritis (< 5)"
          value={criticalStock.toLocaleString("id-ID")}
          icon={<AlertOctagon className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-red-100" />
          <span>Stok kritis (&lt; 5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-yellow-100" />
          <span>Stok rendah (&lt; 10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-white border border-slate-200" />
          <span>Normal</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Produk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kategori</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Outlet</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Stok Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data inventori
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className={`transition-colors ${getRowClass(row.currentStock)}`}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      <Link href={`/reports/inventory/${row.productId}`} className="hover:text-indigo-600">
                        {row.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.outlet}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/reports/inventory/${row.productId}?start_date=${startStr}&end_date=${endStr}${type ? `&type=${type}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                        className={`font-semibold ${
                          row.currentStock < 5
                            ? "text-red-600"
                            : row.currentStock < 10
                            ? "text-yellow-600"
                            : "text-slate-700"
                        } hover:underline`}
                      >
                        {row.currentStock.toLocaleString("id-ID")}
                      </Link>
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
