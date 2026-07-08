"use client"

interface DateRangePickerProps {
  startDate: string
  endDate: string
}

export function DateRangePicker({ startDate, endDate }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
      <span>{startDate}</span>
      <span>—</span>
      <span>{endDate}</span>
    </div>
  )
}
