"use client"

import { useMemo, useState, useTransition } from "react"
import { updateTenantSubscription } from "@/actions/itadmin"
import { Search, Store } from "lucide-react"

type Tenant = {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  status: string
  subscriptionId: string | null
  planId: string | null
  planName: string
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  daysLeft: number | null
  outletCount: number
  employeeCount: number
  ordersThisMonth: number
  createdAt: string
}

type Plan = {
  id: string
  displayName: string
  price: number
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  cancelled: "Cancelled",
  suspended: "Suspended",
  pending: "Pending",
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  suspended: "bg-amber-100 text-amber-700",
  pending: "bg-purple-100 text-purple-700",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[status] || STATUS_CLASS.pending}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function BusinessesClient({ tenants, plans }: { tenants: Tenant[]; plans: Plan[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [isPending, startTransition] = useTransition()

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const keyword = query.toLowerCase().trim()
      const matchKeyword = !keyword || tenant.name.toLowerCase().includes(keyword) || tenant.ownerName.toLowerCase().includes(keyword) || tenant.ownerEmail.toLowerCase().includes(keyword)
      const matchStatus = status === "all" || tenant.status === status
      return matchKeyword && matchStatus
    })
  }, [query, status, tenants])

  function runAction(subscriptionId: string | null, payload: Parameters<typeof updateTenantSubscription>[1]) {
    if (!subscriptionId) return
    startTransition(async () => {
      await updateTenantSubscription(subscriptionId, payload)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Toko</h1>
          <p className="text-sm text-slate-500">Pusat kontrol semua toko: status, plan, trial, dan masa aktif.</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          {filteredTenants.length} dari {tenants.length} toko
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari toko, owner, email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Toko</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Masa Aktif</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Usage</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Store size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{tenant.name}</p>
                        <p className="text-xs text-slate-500">{tenant.ownerName} · {tenant.ownerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={tenant.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={tenant.planId || ""}
                      onChange={(e) => runAction(tenant.subscriptionId, { planId: e.target.value })}
                      disabled={!tenant.subscriptionId || isPending}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Belum ada plan</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>{plan.displayName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{formatDate(tenant.currentPeriodEnd || tenant.trialEndsAt)}</p>
                    <p className="text-xs text-slate-400">{tenant.daysLeft === null ? "-" : `${tenant.daysLeft} hari`}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{tenant.outletCount} outlet · {tenant.employeeCount} staff</p>
                    <p className="text-xs text-slate-400">{tenant.ordersThisMonth} order bulan ini</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => runAction(tenant.subscriptionId, { trialDays: 14 })} disabled={!tenant.subscriptionId || isPending} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50">Trial +14</button>
                      <button onClick={() => runAction(tenant.subscriptionId, { activeDays: 30 })} disabled={!tenant.subscriptionId || isPending} className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">Active +30</button>
                      <button onClick={() => runAction(tenant.subscriptionId, { status: "suspended" })} disabled={!tenant.subscriptionId || isPending} className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50">Suspend</button>
                      <button onClick={() => runAction(tenant.subscriptionId, { status: "cancelled" })} disabled={!tenant.subscriptionId || isPending} className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada toko sesuai filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
