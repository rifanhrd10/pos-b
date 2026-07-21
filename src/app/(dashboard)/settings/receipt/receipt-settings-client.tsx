"use client"

import { useState, useTransition } from "react"
import { updateReceiptTemplate } from "@/actions/settings"
import type { BusinessSettings } from "@prisma/client"

type Business = {
  id: string
  name: string
  phone: string | null
  address: string | null
  logo: string | null
} | null

type Props = {
  settings: Omit<BusinessSettings, "aiApiKey"> | null
  business: Business
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"

const labelClass = "block text-sm font-medium text-slate-700 mb-1"

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer">
        {label}
      </label>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  )
}

// Pad a string to a fixed width, truncating if too long
function pad(str: string, width: number, right = false) {
  const s = str.slice(0, width)
  return right ? s.padStart(width) : s.padEnd(width)
}

function formatRp(n: number) {
  return n.toLocaleString("id-ID")
}

const RECEIPT_WIDTH = 32

function ReceiptPreview({
  header1,
  header2,
  header3,
  footer,
  thankYou,
  numberFormat,
  showAddress,
  showPhone,
  showKasir,
  showLogo,
  logoUrl,
  businessPhone,
  businessAddress,
}: {
  header1: string
  header2: string
  header3: string
  footer: string
  thankYou: string
  numberFormat: string
  showAddress: boolean
  showPhone: boolean
  showKasir: boolean
  showLogo?: boolean
  logoUrl?: string | null
  businessPhone: string
  businessAddress: string
}) {
  const divider = "─".repeat(RECEIPT_WIDTH)
  const center = (s: string) => {
    if (!s) return null
    const trimmed = s.slice(0, RECEIPT_WIDTH)
    const pad = Math.max(0, Math.floor((RECEIPT_WIDTH - trimmed.length) / 2))
    return " ".repeat(pad) + trimmed
  }

  const sampleNo = numberFormat
    .replace("{YYYYMMDD}", "20260708")
    .replace("{SEQ}", "001")

  const items = [
    { name: "Kopi Susu L", qty: 2, price: 25000 },
    { name: "Croissant", qty: 1, price: 18000 },
  ]

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const tax = Math.round(subtotal * 0.11)
  const total = subtotal + tax
  const bayar = 80000
  const kembali = bayar - total

  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed w-[280px] shrink-0">
      {/* Header */}
      <div className="text-center space-y-0.5">
        {showLogo && logoUrl && (
          <div className="mb-2 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain grayscale" />
          </div>
        )}
        {header1 && <div className="font-bold">{center(header1)}</div>}
        {header2 && (showAddress ? <div>{center(header2)}</div> : null)}
        {!header2 && showAddress && businessAddress && (
          <div>{center(businessAddress)}</div>
        )}
        {showPhone && businessPhone && <div>{center(businessPhone)}</div>}
        {header3 && <div>{center(header3)}</div>}
      </div>

      <div className="my-1 text-slate-300">{divider}</div>

      {/* Meta */}
      <div className="space-y-0.5">
        <div>No: {sampleNo}</div>
        <div>Tgl: 08/07/2026 14:30</div>
        {showKasir && <div>Kasir: John Doe</div>}
      </div>

      <div className="my-1 text-slate-300">{divider}</div>

      {/* Items */}
      <div className="space-y-0.5">
        {items.map((item) => {
          const left = `${item.name} ${item.qty}x`
          const right = formatRp(item.qty * item.price)
          const gap = Math.max(1, RECEIPT_WIDTH - left.length - right.length)
          return (
            <div key={item.name}>
              {left}
              {" ".repeat(gap)}
              {right}
            </div>
          )
        })}
      </div>

      <div className="my-1 text-slate-300">{divider}</div>

      {/* Totals */}
      <div className="space-y-0.5">
        {[
          ["Subtotal:", formatRp(subtotal)],
          ["PPN (11%):", `+${formatRp(tax)}`],
          ["TOTAL:", formatRp(total)],
          ["Bayar:", formatRp(bayar)],
          ["Kembali:", formatRp(kembali)],
        ].map(([label, value]) => {
          const gap = Math.max(1, RECEIPT_WIDTH - label.length - value.length)
          return (
            <div key={label} className={label === "TOTAL:" ? "font-bold" : ""}>
              {label}
              {" ".repeat(gap)}
              {value}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {(thankYou || footer) && (
        <>
          <div className="my-1 text-slate-300">{divider}</div>
          <div className="text-center space-y-0.5">
            {thankYou && <div>{center(thankYou)}</div>}
            {footer && <div>{center(footer)}</div>}
          </div>
        </>
      )}
    </div>
  )
}

export function ReceiptSettingsClient({ settings, business }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state — seeded from saved settings or business defaults
  const [header1, setHeader1] = useState(
    settings?.receiptHeader1 ?? business?.name ?? ""
  )
  const [header2, setHeader2] = useState(
    settings?.receiptHeader2 ?? business?.address ?? ""
  )
  const [header3, setHeader3] = useState(settings?.receiptHeader3 ?? "")
  const [footer, setFooter] = useState(
    settings?.receiptFooter ?? "Terima kasih!"
  )
  const [thankYou, setThankYou] = useState(settings?.receiptThankYou ?? "")
  const [numberFormat, setNumberFormat] = useState(
    settings?.receiptNumberFormat ?? "TRX-{YYYYMMDD}-{SEQ}"
  )
  const [showLogo, setShowLogo] = useState(
    settings?.receiptShowLogo ?? true
  )
  const [showAddress, setShowAddress] = useState(
    settings?.receiptShowAddress ?? true
  )
  const [showPhone, setShowPhone] = useState(
    settings?.receiptShowPhone ?? true
  )
  const [showKasir, setShowKasir] = useState(
    settings?.receiptShowKasir ?? true
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateReceiptTemplate({
        receiptHeader1: header1,
        receiptHeader2: header2,
        receiptHeader3: header3,
        receiptFooter: footer,
        receiptThankYou: thankYou,
        receiptNumberFormat: numberFormat,
        receiptShowLogo: showLogo,
        receiptShowAddress: showAddress,
        receiptShowPhone: showPhone,
        receiptShowKasir: showKasir,
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? "Terjadi kesalahan")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Template Struk</h2>
        <p className="text-sm text-slate-500">
          Kustomisasi tampilan struk untuk pelanggan Anda
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          {/* ── Left: form ── */}
          <div className="min-w-0 flex-1 rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft space-y-5">
            {/* Header fields */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Header Struk
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="header1" className={labelClass}>
                    Header 1
                  </label>
                  <input
                    id="header1"
                    type="text"
                    value={header1}
                    onChange={(e) => setHeader1(e.target.value)}
                    placeholder={business?.name ?? "Nama bisnis"}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="header2" className={labelClass}>
                    Header 2
                  </label>
                  <input
                    id="header2"
                    type="text"
                    value={header2}
                    onChange={(e) => setHeader2(e.target.value)}
                    placeholder={business?.address ?? "Alamat outlet"}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="header3" className={labelClass}>
                    Header 3
                  </label>
                  <input
                    id="header3"
                    type="text"
                    value={header3}
                    onChange={(e) => setHeader3(e.target.value)}
                    placeholder="Tagline atau info tambahan"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Footer Struk
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="thankYou" className={labelClass}>
                    Pesan Terima Kasih
                  </label>
                  <input
                    id="thankYou"
                    type="text"
                    value={thankYou}
                    onChange={(e) => setThankYou(e.target.value)}
                    placeholder="Selamat datang kembali!"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="footer" className={labelClass}>
                    Footer
                  </label>
                  <textarea
                    id="footer"
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                    placeholder="Terima kasih!"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Tampilan
              </h3>
              <div className="rounded-xl border border-slate-100 px-4">
                <ToggleRow
                  id="showLogo"
                  label="Tampilkan Logo"
                  checked={showLogo}
                  onChange={setShowLogo}
                />
                <ToggleRow
                  id="showAddress"
                  label="Tampilkan Alamat"
                  checked={showAddress}
                  onChange={setShowAddress}
                />
                <ToggleRow
                  id="showPhone"
                  label="Tampilkan Nomor Telepon"
                  checked={showPhone}
                  onChange={setShowPhone}
                />
                <ToggleRow
                  id="showKasir"
                  label="Tampilkan Nama Kasir"
                  checked={showKasir}
                  onChange={setShowKasir}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                Format Nomor Struk
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Variabel: <code className="bg-slate-100 px-1 rounded">{"{YYYYMMDD}"}</code>,{" "}
                <code className="bg-slate-100 px-1 rounded">{"{SEQ}"}</code>
              </p>
              <input
                id="numberFormat"
                type="text"
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value)}
                placeholder="TRX-{YYYYMMDD}-{SEQ}"
                className={inputClass}
              />
            </div>

            {/* Status messages */}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-100">
                Template struk berhasil disimpan.
              </p>
            )}

            <div className="border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={isPending}
                className="h-10 rounded-xl bg-indigo-600 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Menyimpan..." : "Simpan Template"}
              </button>
            </div>
          </div>

          {/* ── Right: preview ── */}
          <div className="shrink-0 lg:sticky lg:top-24 h-fit">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Preview Struk
              </h3>
              <ReceiptPreview
                header1={header1}
                header2={header2}
                header3={header3}
                footer={footer}
                thankYou={thankYou}
                numberFormat={numberFormat}
                showAddress={showAddress}
                showPhone={showPhone}
                showKasir={showKasir}
                showLogo={showLogo}
                logoUrl={business?.logo}
                businessPhone={business?.phone ?? ""}
                businessAddress={business?.address ?? ""}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
