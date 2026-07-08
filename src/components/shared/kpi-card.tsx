"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  color?: "blue" | "green" | "purple" | "orange"
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel = "vs periode sebelumnya",
  icon,
  color = "blue",
}: KpiCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
  }

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    return <TrendingDown className="h-3 w-3 text-red-600" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-gray-500"
    if (change > 0) return "text-green-600"
    return "text-red-600"
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-lg p-3", colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
