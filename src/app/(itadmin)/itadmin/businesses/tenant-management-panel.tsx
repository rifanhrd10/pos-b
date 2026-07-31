"use client"

import { useMemo, useState, useTransition, useEffect } from "react"
import { createPortal } from "react-dom"
import { updateTenantSubscription } from "@/actions/itadmin"
import { KpiCard } from "@/components/shared/kpi-card"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertTriangle, CheckCircle2, Clock3, PauseCircle, Search, Settings2, Store, X } from "lucide-react"

type Plan = {
  id: string
  displayName: string
  price: number
}

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

type TenantStats = {
  total: number
  active: number
  trial: number
  inactive: number
  expiringSoon: number
}

const STATUS_OPTIONS = ["active", "trial", "expired", "suspended", "cancelled", "pending"] as const

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  suspended: "Suspended",
  cancelled: "Cancelled",
  pending: "Pending",
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-amber-100 text-amber-700",
  cancelled: "bg-slate-100 text-slate-500",
  pending: "bg-purple-100 text-purple-700",
}

const STATUS_HELP_TEXT: Record<string, { title: string; description: string; type: "info" | "warning" | "danger" | "success" }> = {
  active: {
    title: "Toko Aktif",
    description: "Toko memiliki akses penuh ke semua fitur sesuai paket yang dipilih.",
    type: "success",
  },
  trial: {
    title: "Masa Percobaan (Trial)",
    description: "Toko sedang dalam masa percobaan gratis. Batas waktu akses ditentukan oleh 'Tanggal akhir trial'.",
    type: "info",
  },
  expired: {
    title: "Masa Aktif Habis",
    description: "Toko sudah melewati masa aktif. Pemilik toko tidak bisa lagi mengakses fitur utama sampai paket diperpanjang.",
    type: "warning",
  },
  suspended: {
    title: "Toko Dibekukan (Suspended)",
    description: "Akses toko diblokir sementara oleh sistem atau admin. Hubungi pemilik toko untuk klarifikasi.",
    type: "danger",
  },
  cancelled: {
    title: "Langganan Dibatalkan",
    description: "Toko telah berhenti berlangganan secara mandiri. Data mungkin akan dihapus sesuai kebijakan retensi.",
    type: "warning",
  },
  pending: {
    title: "Menunggu Pembayaran",
    description: "Toko sedang menunggu konfirmasi pembayaran. Akses penuh akan terbuka otomatis setelah dibayar.",
    type: "info",
  },
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

function toInputDate(value: string | null) {
  if (!value) return ""
  return value.slice(0, 10)
}

export function TenantManagementPanel({
  tenants,
  plans,
  stats,
  title = "Tenant Management",
  description = "Kelola toko SaaS: status, trial, plan, dan masa aktif.",
  showStats = true,
}: {
  tenants: Tenant[]
  plans: Plan[]
  stats?: TenantStats
  title?: string
  description?: string
  showStats?: boolean
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [form, setForm] = useState({ status: "", planId: "", trialEndsAt: "", currentPeriodEnd: "" })
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const keyword = query.toLowerCase().trim()
      const matchKeyword = !keyword || tenant.name.toLowerCase().includes(keyword) || tenant.ownerName.toLowerCase().includes(keyword) || tenant.ownerEmail.toLowerCase().includes(keyword)
      const matchStatus = status === "all" || tenant.status === status
      return matchKeyword && matchStatus
    })
  }, [query, status, tenants])

  function openTenant(tenant: Tenant) {
    setSelectedTenant(tenant)
    setForm({
      status: tenant.status,
      planId: tenant.planId || "",
      trialEndsAt: toInputDate(tenant.trialEndsAt),
      currentPeriodEnd: toInputDate(tenant.currentPeriodEnd),
    })
  }

  function saveTenant() {
    const subscriptionId = selectedTenant?.subscriptionId
    if (!subscriptionId) return
    startTransition(async () => {
      await updateTenantSubscription(subscriptionId, {
        status: form.status as Parameters<typeof updateTenantSubscription>[1]["status"],
        planId: form.planId || undefined,
        trialEndsAt: form.trialEndsAt || undefined,
        currentPeriodEnd: form.currentPeriodEnd || undefined,
      })
      setSelectedTenant(null)
    })
  }

  function applyPreset(payload: Parameters<typeof updateTenantSubscription>[1]) {
    const subscriptionId = selectedTenant?.subscriptionId
    if (!subscriptionId) return
    startTransition(async () => {
      await updateTenantSubscription(subscriptionId, payload)
      setSelectedTenant(null)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          {filteredTenants.length} dari {tenants.length} toko
        </div>
      </div>

      {showStats && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard label="Total Toko" value={String(stats.total)} icon={<Store size={20} />} color="blue" />
          <KpiCard label="Active" value={String(stats.active)} icon={<CheckCircle2 size={20} />} color="green" />
          <KpiCard label="Trial" value={String(stats.trial)} icon={<Clock3 size={20} />} color="blue" />
          <KpiCard label="Butuh Tindakan" value={String(stats.inactive)} icon={<PauseCircle size={20} />} color="purple" />
          <KpiCard label="Expired ≤ 7 Hari" value={String(stats.expiringSoon)} icon={<AlertTriangle size={20} />} color="orange" />
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 pt-4 pb-0">
          {/* Row 1: search + count */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari toko, owner, email..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {filteredTenants.length} / {tenants.length} toko
            </span>
          </div>
          {/* Row 2: filter pills as tabs */}
          <div className="flex items-center gap-0 -mb-px overflow-x-auto scrollbar-none">
            {[
              { key: "all", label: "Semua", count: tenants.length },
              ...STATUS_OPTIONS.map((s) => ({
                key: s,
                label: STATUS_LABEL[s],
                count: tenants.filter((t) => t.status === s).length,
              })),
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  status === key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {label}
                <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums ${
                  status === key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Toko</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trial</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Masa Aktif</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Usage</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Store size={16} /></div>
                      <div>
                        <p className="font-medium text-slate-900">{tenant.name}</p>
                        <p className="text-xs text-slate-500">{tenant.ownerName} · {tenant.ownerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={tenant.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{tenant.planName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(tenant.trialEndsAt)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{formatDate(tenant.currentPeriodEnd)}</p>
                    <p className="text-xs text-slate-400">{tenant.daysLeft === null ? "-" : `${tenant.daysLeft} hari`}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{tenant.outletCount} outlet · {tenant.employeeCount} staff</p>
                    <p className="text-xs text-slate-400">{tenant.ordersThisMonth} order bulan ini</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openTenant(tenant)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Settings2 size={14} /> Kelola
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Tidak ada toko sesuai filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTenant && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-950/40">
          <div className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Kelola Toko</h2>
                <p className="text-sm text-slate-500">{selectedTenant.name}</p>
              </div>
              <button onClick={() => setSelectedTenant(null)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{selectedTenant.ownerName}</p>
                <p className="text-sm text-slate-500">{selectedTenant.ownerEmail}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Status toko</span>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{STATUS_LABEL[option]}</option>)}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Paket</span>
                  <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Belum ada plan</option>
                    {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.displayName}</option>)}
                  </select>
                </label>

                <label className={`space-y-1.5 block ${form.status !== 'trial' ? 'opacity-60 grayscale' : 'transition-opacity'}`}>
                  <span className="text-sm font-medium text-slate-700">Tanggal akhir trial</span>
                  <DatePicker 
                    value={form.trialEndsAt} 
                    onChange={(val) => setForm({ ...form, trialEndsAt: val })} 
                    disabled={form.status !== 'trial'}
                  />
                </label>

                <label className={`space-y-1.5 block ${form.status !== 'active' ? 'opacity-60 grayscale' : 'transition-opacity'}`}>
                  <span className="text-sm font-medium text-slate-700">Tanggal masa aktif</span>
                  <DatePicker 
                    value={form.currentPeriodEnd} 
                    onChange={(val) => setForm({ ...form, currentPeriodEnd: val })} 
                    disabled={form.status !== 'active'}
                  />
                </label>
              </div>

              {form.status && STATUS_HELP_TEXT[form.status] && (
                <div className={`rounded-xl p-4 border transition-colors duration-300 ${
                  STATUS_HELP_TEXT[form.status].type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                  STATUS_HELP_TEXT[form.status].type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  STATUS_HELP_TEXT[form.status].type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
                  'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                    {STATUS_HELP_TEXT[form.status].title}
                  </p>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {STATUS_HELP_TEXT[form.status].description}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Preset cepat</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => applyPreset({ trialDays: 7 })} disabled={isPending} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50">Trial +7 hari</button>
                  <button onClick={() => applyPreset({ trialDays: 14 })} disabled={isPending} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50">Trial +14 hari</button>
                  <button onClick={() => applyPreset({ activeDays: 30 })} disabled={isPending} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">Active +30 hari</button>
                  <button onClick={() => applyPreset({ status: "suspended" })} disabled={isPending} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50">Suspend</button>
                  <button onClick={() => applyPreset({ status: "cancelled" })} disabled={isPending} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50">Cancel</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setSelectedTenant(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Batal</button>
              <button onClick={saveTenant} disabled={isPending || !selectedTenant.subscriptionId} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">Simpan Perubahan</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
