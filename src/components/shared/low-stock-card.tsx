"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LowStockAlert {
  productName: string
  categoryName: string
  outletName: string
  currentStock: number
}

interface LowStockCardProps {
  alerts: LowStockAlert[]
}

export function LowStockCard({ alerts }: LowStockCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <h2 className="text-lg font-semibold text-gray-900">Stok Menipis</h2>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Semua stok aman</p>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 p-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    alert.currentStock < 5 ? "bg-red-500" : "bg-yellow-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{alert.productName}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {alert.categoryName} • {alert.outletName}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                    alert.currentStock < 5
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {alert.currentStock} unit
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
