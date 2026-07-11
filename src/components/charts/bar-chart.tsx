"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatRp } from "@/lib/format"

interface BarChartProps {
  data: Array<{ name: string; value: number }>
  color?: string
  height?: number
  formatValue?: (v: number) => string
}

export function BarChart({
  data,
  color = "#8b5cf6",
  height = 250,
  formatValue = formatRp,
}: BarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    displayName: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          type="number"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
            return value.toString()
          }}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#e5e7eb" }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          formatter={(value) => [formatValue(Number(value ?? 0)), "Nilai"]}
          labelFormatter={(label) => {
            const item = data.find((d) => d.name.startsWith(String(label).replace("...", "")))
            return item?.name || String(label)
          }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 8, 8, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
