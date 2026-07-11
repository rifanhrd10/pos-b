"use client"

import { DateRangePicker as DateRangePickerUI } from "@/components/ui/date-range-picker"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange?: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <DateRangePickerUI
      from={startDate}
      to={endDate}
      onFromChange={(date) => onChange?.(date, endDate)}
      onToChange={(date) => onChange?.(startDate, date)}
    />
  )
}
