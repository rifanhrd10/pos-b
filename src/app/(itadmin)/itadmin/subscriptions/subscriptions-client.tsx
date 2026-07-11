"use client"

import { useState } from "react"
import { updateSubscription } from "@/actions/itadmin"
import { useRouter } from "next/navigation"
import { CreditCard, Check, Loader2 } from "lucide-react"

type Subscription = {
  id: string
  businessId: string
  businessName: string
  planId: string
  planName: string
  price: number
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  createdAt: string
}

type Plan = {
  id: string
  name: string
  displayName: string
  price: number
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    trial: "bg-amber-500/20 text-amber-400",
    expired: "bg-red-500/20 text-red-400",
    cancelled: "bg-slate-500/20 text-slate-400",
  }
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${colors[status] || colors.cancelled}`}>
      {status.toUpperCase()}
    </span>
  )
}

export function SubscriptionsClient({
  subscriptions,
  plans,
}: {
  subscriptions: Subscription[]
  plans: Plan[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAction(id: string, action: "activate" | "extend30" | "extend90" | "cancel", planId?: string) {
    setLoading(true)
    const now = new Date()

    let data: { status?: string; planId?: string; currentPeriodEnd?: string } = {}

    switch (action) {
      case "activate":
        data = { status: "active", currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }
        break
      case "extend30":
        data = { currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: "active" }
        break
      case "extend90":
        data = { currentPeriodEnd: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), status: "active" }
        break
      case "cancel":
        data = { status: "cancelled" }
        break
    }

    if (planId) data.planId = planId

    await updateSubscription(id, data)
    setLoading(false)
    setEditingId(null)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-400">Bisnis</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Plan</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Harga</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Berakhir</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-700/30 hover:bg-slate-800/80 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-indigo-400" />
                    <span className="font-medium text-white">{sub.businessName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingId === sub.id ? (
                    <select
                      defaultValue={sub.planId}
                      onChange={(e) => handleAction(sub.id, "activate", e.target.value)}
                      className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>{p.displayName}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-300">{sub.planName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  Rp {sub.price.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {sub.status === "trial" && (
                      <button
                        onClick={() => handleAction(sub.id, "activate")}
                        disabled={loading}
                        className="rounded-lg bg-emerald-600/20 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-600/30 transition"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(sub.id, "extend30")}
                      disabled={loading}
                      className="rounded-lg bg-indigo-600/20 px-2 py-1 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-600/30 transition"
                    >
                      +30 hari
                    </button>
                    <button
                      onClick={() => handleAction(sub.id, "extend90")}
                      disabled={loading}
                      className="rounded-lg bg-cyan-600/20 px-2 py-1 text-[11px] font-semibold text-cyan-400 hover:bg-cyan-600/30 transition"
                    >
                      +90 hari
                    </button>
                    <button
                      onClick={() => setEditingId(editingId === sub.id ? null : sub.id)}
                      disabled={loading}
                      className="rounded-lg bg-amber-600/20 px-2 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-600/30 transition"
                    >
                      Ubah Plan
                    </button>
                    {sub.status !== "cancelled" && (
                      <button
                        onClick={() => handleAction(sub.id, "cancel")}
                        disabled={loading}
                        className="rounded-lg bg-red-600/20 px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-600/30 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
