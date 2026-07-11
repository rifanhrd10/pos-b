import { getITAdminDashboardStats } from "@/actions/itadmin"
import { Store, ShoppingBag, Banknote, TrendingUp, AlertTriangle } from "lucide-react"

export default async function ITAdminDashboard() {
  const stats = await getITAdminDashboardStats()
  if (!stats) return <p className="text-red-400">Unauthorized</p>

  const cards = [
    { label: "Total Bisnis", value: stats.totalBusinesses, icon: Store, color: "bg-indigo-500/20 text-indigo-400" },
    { label: "Order Hari Ini", value: stats.todayOrders, icon: ShoppingBag, color: "bg-emerald-500/20 text-emerald-400" },
    { label: "Revenue Hari Ini", value: `Rp ${(stats.todayRevenue / 1000).toFixed(0)}k`, icon: Banknote, color: "bg-amber-500/20 text-amber-400" },
    { label: "Bisnis Baru (Bulan Ini)", value: stats.newBusinessesThisMonth, icon: TrendingUp, color: "bg-cyan-500/20 text-cyan-400" },
    { label: "Subs Segera Expired", value: stats.expiringSoon, icon: AlertTriangle, color: "bg-red-500/20 text-red-400" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview seluruh platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Plan Distribution */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Distribusi Plan</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.planDistribution.map((d) => (
            <div key={d.plan} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3">
              <span className="text-sm font-medium text-slate-300">{d.plan}</span>
              <span className="text-lg font-bold text-white">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
