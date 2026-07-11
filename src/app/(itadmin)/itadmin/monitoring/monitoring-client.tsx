"use client"

import { useState } from "react"
import { getMonitoringData } from "@/actions/itadmin"
import { BarChart2, TrendingUp } from "lucide-react"

type DailyData = { date: string; count: number; revenue: number }
type TopBusiness = { name: string; count: number; revenue: number }

type MonitoringData = {
  dailyData: DailyData[]
  topByTransactions: TopBusiness[]
} | null

export function MonitoringClient({
  initialData,
  businesses,
}: {
  initialData: MonitoringData
  businesses: { id: string; name: string }[]
}) {
  const [data, setData] = useState(initialData)
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleFilter(businessId: string) {
    setSelectedBusiness(businessId)
    setLoading(true)
    const result = await getMonitoringData(businessId || undefined)
    setData(result)
    setLoading(false)
  }

  const maxCount = Math.max(...(data?.dailyData.map((d) => d.count) || [1]), 1)

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={selectedBusiness}
          onChange={(e) => handleFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none focus:border-indigo-500"
        >
          <option value="">Semua Bisnis</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {loading && <span className="text-xs text-slate-400">Loading...</span>}
      </div>

      {/* Daily Chart (simple bar) */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-indigo-400" />
          Transaksi 30 Hari Terakhir
        </h2>
        {data?.dailyData && data.dailyData.length > 0 ? (
          <div className="flex items-end gap-1 h-40">
            {data.dailyData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full rounded-t bg-indigo-500 hover:bg-indigo-400 transition min-h-[2px]"
                  style={{ height: `${(d.count / maxCount) * 100}%` }}
                />
                <div className="absolute bottom-full mb-2 hidden group-hover:block rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
                  <p>{d.date}</p>
                  <p>{d.count} order</p>
                  <p>Rp {(d.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Tidak ada data transaksi</p>
        )}
      </div>

      {/* Top Businesses */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Top 5 Toko (30 hari)
        </h2>
        <div className="space-y-3">
          {data?.topByTransactions.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-white">{b.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{b.count} orders</p>
                <p className="text-[11px] text-slate-400">Rp {(b.revenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          ))}
          {(!data?.topByTransactions || data.topByTransactions.length === 0) && (
            <p className="text-slate-500 text-sm">Tidak ada data</p>
          )}
        </div>
      </div>
    </div>
  )
}
