"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRp } from "@/lib/format";

interface LineChartProps {
  data: Array<{ date: string; revenue: number; transactions: number }>;
  height?: number;
}

export function LineChart({ data, height = 250 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          yAxisId="left"
          stroke="#6366f1"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#10b981"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value, name) => {
            const num = Number(value);
            if (name === "Pendapatan") return [formatRp(num), "Pendapatan"];
            return [String(num), "Transaksi"];
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2}
          name="Pendapatan"
          dot={{ fill: "#6366f1" }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="transactions"
          stroke="#10b981"
          strokeWidth={2}
          name="Transaksi"
          dot={{ fill: "#10b981" }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
