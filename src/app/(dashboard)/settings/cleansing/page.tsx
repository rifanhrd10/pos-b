"use client"

import { useState } from "react"
import { cleanseData, type CleansingOption } from "@/actions/cleansing"
import {
  AlertTriangle,
  Trash2,
  ShoppingBag,
  Users,
  Boxes,
  Receipt,
  UserCog,
  Loader2,
  CheckCircle2,
} from "lucide-react"

const CLEANSING_OPTIONS: {
  id: CleansingOption
  label: string
  description: string
  icon: typeof Trash2
  color: string
}[] = [
  {
    id: "transactions",
    label: "Transaksi & Pembayaran",
    description: "Semua order, pembayaran, sesi kasir, dan riwayat transaksi",
    icon: Receipt,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "customers",
    label: "Data Pelanggan",
    description: "Semua data pelanggan dan riwayat kunjungan",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: "products",
    label: "Produk & Kategori",
    description: "Semua produk, varian, topping, kategori, dan promo",
    icon: ShoppingBag,
    color: "text-green-600 bg-green-50",
  },
  {
    id: "inventory",
    label: "Data Inventori",
    description: "Stok, pergerakan stok, dan transfer antar outlet",
    icon: Boxes,
    color: "text-orange-600 bg-orange-50",
  },
  {
    id: "employees",
    label: "Karyawan & Role",
    description: "Semua karyawan (kecuali owner) dan role custom",
    icon: UserCog,
    color: "text-rose-600 bg-rose-50",
  },
]

export default function CleansingPage() {
  const [selected, setSelected] = useState<CleansingOption[]>([])
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  const selectAll = selected.length === CLEANSING_OPTIONS.length

  function toggleOption(id: CleansingOption) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
    setResult(null)
  }

  function toggleAll() {
    if (selectAll) {
      setSelected([])
    } else {
      setSelected(CLEANSING_OPTIONS.map((o) => o.id))
    }
    setResult(null)
  }

  async function handleCleanse() {
    if (confirmText !== "HAPUS DATA") return
    if (selected.length === 0) return

    setLoading(true)
    setResult(null)

    const options: CleansingOption[] = selectAll ? ["all"] : selected
    const res = await cleanseData(options)
    setResult(res)
    setLoading(false)

    if (res.success) {
      setSelected([])
      setConfirmText("")
    }
  }

  const canSubmit = selected.length > 0 && confirmText === "HAPUS DATA" && !loading

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cleansing Data</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hapus data demo/testing dari sistem. Aksi ini tidak dapat dibatalkan.
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Peringatan</p>
            <p className="mt-1 text-sm text-amber-700">
              Data yang dihapus tidak dapat dikembalikan. Pastikan Anda sudah
              mem-backup data penting sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Pilih Data yang Akan Dihapus</h2>
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {selectAll ? "Batal Semua" : "Pilih Semua"}
          </button>
        </div>

        <div className="space-y-3">
          {CLEANSING_OPTIONS.map((option) => {
            const Icon = option.icon
            const isChecked = selected.includes(option.id)
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                  isChecked
                    ? "border-indigo-200 bg-indigo-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(option.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${option.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{option.label}</p>
                  <p className="text-sm text-slate-500">{option.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Confirmation */}
      {selected.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-900">Konfirmasi Penghapusan</h3>
          <p className="mt-1 text-sm text-red-700">
            Ketik <span className="font-mono font-bold">HAPUS DATA</span> untuk konfirmasi.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Ketik HAPUS DATA"
            className="mt-3 w-full rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-mono placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <button
            type="button"
            onClick={handleCleanse}
            disabled={!canSubmit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus data...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus {selectAll ? "Semua Data" : `${selected.length} Kategori Data`}
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">Data berhasil dihapus</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-800">
                  Gagal: {result.error || "Terjadi kesalahan"}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
