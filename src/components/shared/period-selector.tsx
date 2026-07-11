"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type PeriodValue = "today" | "7days" | "30days"

interface PeriodOption {
  value: PeriodValue
  label: string
}

const OPTIONS: PeriodOption[] = [
  { value: "today", label: "Hari ini" },
  { value: "7days", label: "7 Hari" },
  { value: "30days", label: "30 Hari" },
]

export function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPeriod = (searchParams.get("period") as PeriodValue) || "today"

  const handlePeriodChange = (period: PeriodValue) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", period)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => handlePeriodChange(option.value)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            currentPeriod === option.value
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
