"use client"

import * as React from "react"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.css"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value?: string // "HH:mm" format
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pilih waktu",
  disabled = false,
  className = "",
  name,
}: TimePickerProps) {
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
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            onChange(`${hours}:${minutes}`)
          }
        }}
        options={{
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          time_24hr: true,
          disableMobile: true,
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={`flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}
