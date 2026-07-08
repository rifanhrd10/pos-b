"use client"

import { useState } from "react"
import { formatDateYYYYMMDD } from "@/lib/format"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange?: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setStart(val)
    onChange?.(val, end)
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setEnd(val)
    onChange?.(start, val)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
      <input
        type="date"
        value={start}
        onChange={handleStartChange}
        className="border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
      />
      <span className="text-slate-400">—</span>
      <input
        type="date"
        value={end}
        onChange={handleEndChange}
        className="border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
      />
    </div>
  )
}
