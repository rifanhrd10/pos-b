"use client"

import { useState } from "react"
import { updateAiApiKey, updateGeneralSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"

interface BusinessSettings {
  dateFormat: string | null
  timezone: string | null
  language: string | null
  autoPrintReceipt: boolean | null
}

interface GeneralFormProps {
  settings: BusinessSettings | null
  aiApiKeyConfigured: boolean
}

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
]

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT)" },
]

const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
]

export function GeneralForm({ settings, aiApiKeyConfigured }: GeneralFormProps) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateFormat, setDateFormat] = useState(settings?.dateFormat ?? "DD/MM/YYYY")
  const [timezone, setTimezone] = useState(settings?.timezone ?? "Asia/Jakarta")
  const [language, setLanguage] = useState(settings?.language ?? "id")
  const [autoPrint, setAutoPrint] = useState(settings?.autoPrintReceipt ?? false)
  const [aiApiKey, setAiApiKey] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const result = await updateGeneralSettings({
      dateFormat,
      timezone,
      language,
      autoPrintReceipt: autoPrint,
    })

    const aiResult = aiApiKey.trim() ? await updateAiApiKey(aiApiKey) : { success: true }

    if (result.success && aiResult.success) {
      setStatus({ type: "success", message: "Perubahan berhasil disimpan" })
      setAiApiKey("")
    } else {
      setStatus({ type: "error", message: result.error ?? aiResult.error ?? "Terjadi kesalahan" })
    }
    setLoading(false)
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Preferensi Umum</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Format Tanggal</label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            {DATE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Zona Waktu</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bahasa</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Auto-print receipt */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Auto-print Struk</p>
            <p className="text-xs text-slate-500 mt-0.5">Cetak struk otomatis setelah transaksi selesai</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoPrint}
            onClick={() => setAutoPrint(!autoPrint)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              autoPrint ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoPrint ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Gemini API Key untuk fitur AI</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Rekomendasi AI dan scan menu hanya muncul pada akun owner setelah key tersimpan.
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${aiApiKeyConfigured ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {aiApiKeyConfigured ? "Sudah aktif" : "Belum diatur"}
            </span>
          </div>
          <input
            type="password"
            value={aiApiKey}
            onChange={(event) => setAiApiKey(event.target.value)}
            placeholder={aiApiKeyConfigured ? "Isi hanya untuk mengganti API key" : "Masukkan Gemini API key"}
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
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
