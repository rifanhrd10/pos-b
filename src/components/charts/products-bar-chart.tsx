"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRp } from "@/lib/format";

interface ProductsBarChartProps {
  data: Array<{ rank: number; name: string; category: string; qty: number; revenue: number }>;
  height?: number;
}

export function ProductsBarChart({ data, height = 400 }: ProductsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 20, left: 120, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis
          type="number"
          stroke="#64748b"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#64748b"
          style={{ fontSize: "11px" }}
          width={115}
          tick={{ fill: "#475569" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value) => [formatRp(Number(value)), "Pendapatan"] as [string, string]}
        />
        <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
