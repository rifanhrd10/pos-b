import { getBusinessesList } from "@/actions/itadmin"
import { Store } from "lucide-react"

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    trial: "bg-amber-500/20 text-amber-400",
    expired: "bg-red-500/20 text-red-400",
    cancelled: "bg-slate-500/20 text-slate-400",
    none: "bg-slate-500/20 text-slate-400",
  }
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${colors[status] || colors.none}`}>
      {status.toUpperCase()}
    </span>
  )
}

export default async function BusinessesPage() {
  const businesses = await getBusinessesList()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bisnis / Toko</h1>
        <p className="text-sm text-slate-400">Semua bisnis yang terdaftar di platform</p>
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-400">Bisnis</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Owner</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Plan</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Outlets</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Orders/bln</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Expired</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-b border-slate-700/30 hover:bg-slate-800/80 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Store size={14} />
                      </div>
                      <span className="font-medium text-white">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300">{b.ownerName}</p>
                    <p className="text-[11px] text-slate-500">{b.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                      {b.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">{b.outletCount}</td>
                  <td className="px-4 py-3 text-slate-300">{b.ordersThisMonth}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {b.currentPeriodEnd
                      ? new Date(b.currentPeriodEnd).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                      : "-"}
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Belum ada bisnis terdaftar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
