"use client"

import { useState } from "react"
import { updateBusinessProfile } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Business {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  province: string | null
  logo: string | null
}

interface BusinessFormProps {
  business: Business | null
}

export function BusinessForm({ business }: BusinessFormProps) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(business?.logo ?? "")

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

  return (
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

        {/* Provinsi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
          <input
            name="province"
            type="text"
            defaultValue={business?.province ?? ""}
            placeholder="DKI Jakarta"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
  )
}
