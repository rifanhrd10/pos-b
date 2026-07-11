import { getSystemStats } from "@/actions/itadmin"
import { Users, Store, ShoppingBag, Banknote, Package, UserCog, Activity } from "lucide-react"

export default async function SystemPage() {
  const stats = await getSystemStats()
  if (!stats) return <p className="text-red-400">Unauthorized</p>

  const items = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-indigo-500/20 text-indigo-400" },
    { label: "Total Bisnis", value: stats.totalBusinesses, icon: Store, color: "bg-cyan-500/20 text-cyan-400" },
    { label: "Total Orders (Completed)", value: stats.totalOrders.toLocaleString("id-ID"), icon: ShoppingBag, color: "bg-emerald-500/20 text-emerald-400" },
    { label: "Total Revenue", value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: Banknote, color: "bg-amber-500/20 text-amber-400" },
    { label: "Total Produk", value: stats.totalProducts, icon: Package, color: "bg-purple-500/20 text-purple-400" },
    { label: "Total Karyawan", value: stats.totalEmployees, icon: UserCog, color: "bg-rose-500/20 text-rose-400" },
    { label: "Avg Orders / Day (30d)", value: stats.avgOrdersPerDay, icon: Activity, color: "bg-teal-500/20 text-teal-400" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System</h1>
        <p className="text-sm text-slate-400">Statistik keseluruhan platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                <Icon size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-400">{item.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
