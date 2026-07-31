"use client"

import { useState } from "react"
import { updatePlan } from "@/actions/itadmin"
import { useRouter } from "next/navigation"
import { Package, Check, X, Save, Loader2 } from "lucide-react"

type Plan = {
  id: string
  name: string
  displayName: string
  maxOutlets: number
  maxEmployees: number
  features: string[]
  price: number
}

type FeatureKey = {
  key: string
  label: string
}

export function PlansClient({ plans, featureKeys }: { plans: Plan[]; featureKeys: FeatureKey[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Plan>>({})
  const [loading, setLoading] = useState(false)

  function startEdit(plan: Plan) {
    setEditingId(plan.id)
    setEditData({
      displayName: plan.displayName,
      price: plan.price,
      maxOutlets: plan.maxOutlets,
      maxEmployees: plan.maxEmployees,
      features: [...plan.features],
    })
  }

  function toggleFeature(key: string) {
    const features = editData.features || []
    if (features.includes(key)) {
      setEditData({ ...editData, features: features.filter((f) => f !== key) })
    } else {
      setEditData({ ...editData, features: [...features, key] })
    }
  }

  async function handleSave() {
    if (!editingId) return
    setLoading(true)
    await updatePlan(editingId, editData)
    setLoading(false)
    setEditingId(null)
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const isEditing = editingId === plan.id
        const data = isEditing ? editData : plan

        return (
          <div key={plan.id} className="rounded-xl bg-white shadow-sm p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={20} />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      value={data.displayName || ""}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className="w-full rounded-lg bg-white border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-900">{plan.displayName}</p>
                  )}
                  <p className="text-xs text-slate-400">{plan.name}</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Harga / bulan</p>
              {isEditing ? (
                <input
                  type="number"
                  value={data.price || 0}
                  onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                  className="w-full rounded-lg bg-white border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-bold text-slate-900">
                  Rp {plan.price.toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Max Outlet</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={data.maxOutlets || 0}
                    onChange={(e) => setEditData({ ...editData, maxOutlets: Number(e.target.value) })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{plan.maxOutlets}</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Max Karyawan</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={data.maxEmployees || 0}
                    onChange={(e) => setEditData({ ...editData, maxEmployees: Number(e.target.value) })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{plan.maxEmployees}</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Fitur</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {featureKeys.map((fk) => {
                  const active = (data.features || []).includes(fk.key)
                  return (
                    <div
                      key={fk.key}
                      onClick={() => isEditing && toggleFeature(fk.key)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition ${
                        isEditing ? "cursor-pointer hover:bg-slate-50" : ""
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                          active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {active ? <Check size={10} /> : <X size={10} />}
                      </span>
                      <span className={active ? "text-slate-900" : "text-slate-400"}>{fk.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(plan)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit Plan
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
