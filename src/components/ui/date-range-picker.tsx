"use client"

import * as React from "react"
import Flatpickr from "react-flatpickr"
import { Indonesian } from "flatpickr/dist/l10n/id"
import "flatpickr/dist/flatpickr.css"
import { Calendar } from "lucide-react"

interface DateRangePickerProps {
  from?: string // ISO string atau "YYYY-MM-DD"
  to?: string
  onFromChange?: (date: string) => void
  onToChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromName?: string
  toName?: string
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
  className = "",
  fromName,
  toName,
}: DateRangePickerProps) {
  const flatpickrRef = React.useRef<any>(null)
  const [dateRange, setDateRange] = React.useState<string[]>([])

  React.useEffect(() => {
    if (from && to) {
      setDateRange([from, to])
    } else if (from) {
      setDateRange([from])
    }
  }, [from, to])

  return (
    <div className="relative">
      {fromName && <input type="hidden" name={fromName} value={from || ""} />}
      {toName && <input type="hidden" name={toName} value={to || ""} />}
      
      <Flatpickr
        ref={flatpickrRef}
        value={dateRange}
        onChange={(dates) => {
          if (dates.length === 2) {
            const [startDate, endDate] = dates
            const formattedStart = startDate.toISOString().split('T')[0]
            const formattedEnd = endDate.toISOString().split('T')[0]
            onFromChange?.(formattedStart)
            onToChange?.(formattedEnd)
            setDateRange([formattedStart, formattedEnd])
          } else if (dates.length === 1) {
            const formattedStart = dates[0].toISOString().split('T')[0]
            onFromChange?.(formattedStart)
            setDateRange([formattedStart])
          }
        }}
        options={{
          mode: "range",
          dateFormat: "d M Y",
          locale: Indonesian,
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
