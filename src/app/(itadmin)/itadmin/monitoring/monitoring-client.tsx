"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, Search, Store } from "lucide-react"

type Tenant = {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  status: string
  planName: string
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  daysLeft: number | null
  outletCount: number
  employeeCount: number
  ordersThisMonth: number
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  suspended: "bg-amber-100 text-amber-700",
  pending: "bg-purple-100 text-purple-700",
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function HealthBadge({ tenant }: { tenant: Tenant }) {
  if (tenant.status === "expired" || tenant.status === "suspended" || tenant.status === "cancelled") {
    return <span className="inline-flex rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Perlu tindakan</span>
  }
  if (tenant.daysLeft !== null && tenant.daysLeft <= 7) {
    return <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Hampir habis</span>
  }
  if (tenant.status === "pending") {
    return <span className="inline-flex rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Setup belum selesai</span>
  }
  return <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Sehat</span>
}

export function TenantHealthClient({ tenants, actionQueue }: { tenants: Tenant[]; actionQueue: Tenant[] }) {
  const [query, setQuery] = useState("")

  const healthStats = useMemo(() => {
    const healthy = tenants.filter((tenant) => tenant.status === "active" && (tenant.daysLeft === null || tenant.daysLeft > 7)).length
    const expiring = tenants.filter((tenant) => tenant.daysLeft !== null && tenant.daysLeft <= 7 && ["active", "trial"].includes(tenant.status)).length
    const blocked = tenants.filter((tenant) => ["expired", "suspended", "cancelled"].includes(tenant.status)).length
    return { healthy, expiring, blocked }
  }, [tenants])

  const filteredTenants = useMemo(() => {
    const keyword = query.toLowerCase().trim()
    return tenants.filter((tenant) => !keyword || tenant.name.toLowerCase().includes(keyword) || tenant.ownerEmail.toLowerCase().includes(keyword))
  }, [query, tenants])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenant Health</h1>
        <p className="text-sm text-slate-500">Pantau toko yang sehat, hampir expired, atau perlu tindakan admin.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Sehat</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{healthStats.healthy}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><CheckCircle2 size={20} /></div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Hampir Habis</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{healthStats.expiring}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Clock3 size={20} /></div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Blocked</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{healthStats.blocked}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-600"><AlertTriangle size={20} /></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Prioritas Hari Ini</h2>
        <p className="mb-4 text-sm text-slate-500">Toko yang paling perlu dicek.</p>
        <div className="space-y-3">
          {actionQueue.map((tenant) => (
            <div key={tenant.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Store size={14} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tenant.name}</p>
                  <p className="text-xs text-slate-500">{tenant.ownerEmail} · {tenant.planName}</p>
                </div>
              </div>
              <HealthBadge tenant={tenant} />
            </div>
          ))}
          {actionQueue.length === 0 && <p className="text-sm text-slate-400">Tidak ada prioritas hari ini.</p>}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari toko atau email..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Toko</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Health</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Expiry</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Usage</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{tenant.name}</p>
                    <p className="text-xs text-slate-500">{tenant.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3"><HealthBadge tenant={tenant} /></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[tenant.status] || STATUS_CLASS.pending}`}>{tenant.status}</span></td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(tenant.currentPeriodEnd || tenant.trialEndsAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{tenant.outletCount} outlet · {tenant.employeeCount} staff</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
