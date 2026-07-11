"use client"

import * as React from "react"
import Flatpickr from "react-flatpickr"
import { Indonesian } from "flatpickr/dist/l10n/id"
import "flatpickr/dist/flatpickr.css"
import { Calendar } from "lucide-react"

interface DatePickerProps {
  value?: string // ISO string atau "YYYY-MM-DD"
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
  minDate?: string
  maxDate?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className = "",
  name,
  minDate,
  maxDate,
}: DatePickerProps) {
  const flatpickrRef = React.useRef<any>(null)

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={value || ""} />}
      
      <Flatpickr
        ref={flatpickrRef}
        value={value || ""}
        onChange={(dates) => {
          if (dates.length > 0 && onChange) {
            const date = dates[0]
            const formatted = date.toISOString().split('T')[0]
            onChange(formatted)
          }
        }}
        options={{
          dateFormat: "d M Y",
          locale: Indonesian,
          minDate: minDate,
          maxDate: maxDate,
          disableMobile: true,
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={`flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}
