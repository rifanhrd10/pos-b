"use client"

import { useState } from "react"
import { updateTaxSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"

interface TaxFormProps {
  taxRate: number
  serviceRate: number
}

export function TaxForm({ taxRate, serviceRate }: TaxFormProps) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [tax, setTax] = useState(taxRate)
  const [service, setService] = useState(serviceRate)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const result = await updateTaxSettings({ taxRate: tax, serviceRate: service })

    if (result.success) {
      setStatus({ type: "success", message: "Perubahan berhasil disimpan" })
    } else {
      setStatus({ type: "error", message: result.error ?? "Terjadi kesalahan" })
    }
    setLoading(false)
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Pajak &amp; Biaya Layanan</h2>
      <p className="text-sm text-slate-500 mb-4">
        PPN default Indonesia 11%. Tax rate diterapkan ke semua transaksi.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PPN Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">PPN Rate</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 pr-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
          </div>
        </div>

        {/* Service Charge */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Service Charge</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={service}
              onChange={(e) => setService(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 pr-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
          </div>
        </div>

        {status && (
          <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.message}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  )
}
