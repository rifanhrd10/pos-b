"use client"

import { DateRangePicker as DateRangePickerUI } from "@/components/ui/date-range-picker"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange?: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateUrl(start: string, end: string) {
    if (onChange) {
      onChange(start, end)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("start_date", start)
    params.set("end_date", end)
    params.delete("start")
    params.delete("end")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  function resetRange() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("start")
    params.delete("end")
    params.delete("start_date")
    params.delete("end_date")
    params.delete("page")
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
  }

  return (
    <div className="flex items-center gap-2">
      <DateRangePickerUI
        from={startDate}
        to={endDate}
        onRangeChange={updateUrl}
      />
      <Button type="button" variant="outline" className="h-10 px-3 py-2" onClick={resetRange}>
        Reset
      </Button>
    </div>
  )
}
