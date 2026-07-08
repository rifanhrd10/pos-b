"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { formatRp } from "@/lib/format"

interface DonutChartProps {
  data: Array<{ method: string; count: number; amount: number }>
  height?: number
}

const COLORS: Record<string, string> = {
  CASH: "#10b981",
  QRIS: "#3b82f6",
  BANK_TRANSFER: "#8b5cf6",
  DEBIT_CARD: "#f59e0b",
  CREDIT_CARD: "#ef4444",
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  DEBIT_CARD: "Kartu Debit",
  CREDIT_CARD: "Kartu Kredit",
}

export function DonutChart({ data, height = 200 }: DonutChartProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

  const chartData = data.map((item) => ({
    name: METHOD_LABELS[item.method] || item.method,
    value: item.amount,
    count: item.count,
    color: COLORS[item.method] || "#9ca3af",
  }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value) => formatRp(Number(value ?? 0))}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-500">({item.count}x)</span>
            </div>
            <span className="font-semibold text-gray-900">{formatRp(item.value)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2">
        <div className="flex items-center justify-between font-semibold">
          <span className="text-gray-700">Total</span>
          <span className="text-gray-900">{formatRp(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}
