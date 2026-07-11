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
    setEditData({ displayName: plan.displayName, price: plan.price, maxOutlets: plan.maxOutlets, maxEmployees: plan.maxEmployees, features: [...plan.features] })
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
          <div key={plan.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Package size={20} />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      value={data.displayName || ""}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-sm font-bold text-white"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">{plan.displayName}</p>
                  )}
                  <p className="text-[11px] text-slate-500">{plan.name}</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Harga / bulan</p>
              {isEditing ? (
                <input
                  type="number"
                  value={data.price || 0}
                  onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              ) : (
                <p className="text-xl font-bold text-white">
                  {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                </p>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Max Outlet</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={data.maxOutlets ?? 0}
                    onChange={(e) => setEditData({ ...editData, maxOutlets: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-white">{plan.maxOutlets === -1 ? "Unlimited" : plan.maxOutlets}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Max Karyawan</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={data.maxEmployees ?? 0}
                    onChange={(e) => setEditData({ ...editData, maxEmployees: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-white">{plan.maxEmployees === -1 ? "Unlimited" : plan.maxEmployees}</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Fitur yang bisa diakses</p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {featureKeys.map((fk) => {
                  const hasFeature = (data.features || []).includes(fk.key)
                  return (
                    <label
                      key={fk.key}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition cursor-pointer ${
                        isEditing ? "hover:bg-slate-700/50" : ""
                      } ${hasFeature ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={hasFeature}
                          onChange={() => toggleFeature(fk.key)}
                          className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-indigo-600"
                        />
                      ) : hasFeature ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <X size={12} className="text-slate-600" />
                      )}
                      <span>{fk.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-700/50">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(plan)}
                  className="w-full rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
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
