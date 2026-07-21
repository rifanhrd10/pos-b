"use client"

import { useState } from "react"
import { updateBusinessProfile, generateStoreCode } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import RegionSelects from "@/components/RegionSelects"
import { Copy, RefreshCw, Key } from "lucide-react"

interface Business {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  province: string | null
  logo: string | null
}

interface BusinessFormProps {
  business: Business | null
  storeCode: string | null
}

export function BusinessForm({ business, storeCode: initialStoreCode }: BusinessFormProps) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(business?.logo ?? "")
  const [storeCode, setStoreCode] = useState(initialStoreCode)
  const [codeLoading, setCodeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateBusinessProfile(formData)

    if (result.success) {
      setStatus({ type: "success", message: "Perubahan berhasil disimpan" })
    } else {
      setStatus({ type: "error", message: result.error ?? "Terjadi kesalahan" })
    }
    setLoading(false)
  }

  async function handleGenerateCode() {
    if (storeCode && !window.confirm("Buat ulang kode dari nama bisnis saat ini? Kode lama tidak dapat dipakai lagi oleh kasir.")) return
    setCodeLoading(true)
    setStatus(null)
    const result = await generateStoreCode()
    if (result.success && result.storeCode) {
      setStoreCode(result.storeCode)
      setStatus({ type: "success", message: `Kode toko diperbarui menjadi ${result.storeCode}` })
    } else {
      setStatus({ type: "error", message: result.error ?? "Gagal membuat kode toko" })
    }
    setCodeLoading(false)
  }

  function handleCopyCode() {
    if (!storeCode) return
    navigator.clipboard.writeText(storeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Kode Toko Card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Key className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Kode Toko</h2>
            <p className="text-xs text-slate-500">Kode ini digunakan kasir untuk login ke POS</p>
          </div>
        </div>

        {storeCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-mono text-2xl font-bold tracking-widest text-slate-900">{storeCode}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              title="Salin kode"
            >
              <Copy size={18} />
            </button>
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={codeLoading}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
              title="Buat ulang dari nama bisnis"
            >
              <RefreshCw size={18} className={codeLoading ? "animate-spin" : ""} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateCode}
            disabled={codeLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={codeLoading ? "animate-spin" : ""} />
            {codeLoading ? "Membuat kode..." : "Buat Kode dari Nama Toko"}
          </button>
        )}

        {copied && (
          <p className="mt-2 text-xs text-green-600">Kode berhasil disalin!</p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Kode dibuat otomatis dari nama bisnis agar mudah diingat. Jika nama yang sama sudah dipakai, sistem menambahkan angka pendek. Bagikan kode ini ke kasir untuk masuk melalui <span className="font-mono">/kasir/enter</span>.
        </p>
      </div>

      {/* Business Info Card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Informasi Bisnis</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Bisnis */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama Bisnis <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={business?.name ?? ""}
            placeholder="Nama bisnis Anda"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
          <input
            name="logo"
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://contoh.com/logo.png"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {logoUrl && (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <Image
                  src={logoUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain p-1"
                  onError={() => {}}
                />
              </div>
              <span className="text-xs text-slate-500">Preview logo</span>
            </div>
          )}
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
          <input
            name="address"
            type="text"
            defaultValue={business?.address ?? ""}
            placeholder="Jl. Contoh No. 1"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Wilayah */}
        <div className="pt-2">
          <RegionSelects 
            defaultValues={{ 
              province: business?.province,
              city: business?.city
            }} 
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
          <input
            name="phone"
            type="tel"
            defaultValue={business?.phone ?? ""}
            placeholder="08xxxxxxxxxx"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={business?.email ?? ""}
            placeholder="bisnis@contoh.com"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
    </div>
  )
}
