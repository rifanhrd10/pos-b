"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, CreditCard, Search } from "lucide-react";
import {
  getShiftSummary,
  getShiftOrders,
  getHourlyStats,
  type ShiftSummary,
} from "@/actions/kasir";

interface LaporanPanelProps {
  sessionId: string;
  kasirName: string;
  outletName: string;
}

type OrderData = {
  id: string;
  orderNumber: string;
  tableId: string | null;
  paidAt: Date | null;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  payment: {
    method: string;
  } | null;
};

export function LaporanPanel({
  sessionId,
  kasirName,
  outletName,
}: LaporanPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [hourlyStats, setHourlyStats] = useState<
    { hour: number; count: number; total: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | "CASH" | "QRIS">(
    "ALL"
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, ordersData, statsData] = await Promise.all([
          getShiftSummary(sessionId),
          getShiftOrders(sessionId),
          getHourlyStats(sessionId),
        ]);

        setSummary(summaryData);
        setOrders(ordersData as OrderData[]);
        setHourlyStats(statsData);
      } catch (err) {
        setError("Gagal memuat laporan");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod =
      methodFilter === "ALL" ||
      (order.payment?.method.toUpperCase() === methodFilter);

    return matchesSearch && matchesMethod;
  });

  const formatTime = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate max hourly count for bar chart scaling
  const maxHourlyCount = Math.max(...hourlyStats.map((s) => s.count), 1);

  // Filter hours that have activity or are within ±2 hours of active hours
  const activeHours = hourlyStats.filter((s) => s.count > 0).map((s) => s.hour);
  const minHour = activeHours.length > 0 ? Math.max(0, Math.min(...activeHours) - 2) : 0;
  const maxHour = activeHours.length > 0 ? Math.min(23, Math.max(...activeHours) + 2) : 23;
  const visibleHourlyStats = hourlyStats.filter(
    (s) => s.hour >= minHour && s.hour <= maxHour
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-slate-700 rounded w-1/4 animate-pulse"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-24 animate-pulse"
            ></div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-48 animate-pulse"></div>

        {/* Table skeleton */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-64 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-150"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50">
          Laporan Shift — {kasirName} @ {outletName}
        </h2>
        <p className="text-slate-400 mt-1">
          Shift dibuka: {formatDate(summary.openedAt)}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Omset */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-400 text-sm font-medium">
              Total Omset
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-50">
            {fmt(summary.totalRevenue)}
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-slate-400 text-sm font-medium">
              Total Transaksi
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-50">
            {summary.totalOrders}{" "}
            <span className="text-base font-normal text-slate-400">
              transaksi
            </span>
          </p>
        </div>

        {/* Pembayaran */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-600/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-slate-400 text-sm font-medium">
              Pembayaran
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-300">
              <span className="font-medium">Tunai:</span> {fmt(summary.cashRevenue)}
            </p>
            <p className="text-sm text-slate-300">
              <span className="font-medium">QRIS:</span> {fmt(summary.qrisRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-bold text-slate-50 mb-4">
          Transaksi per Jam
        </h3>
        {activeHours.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            Belum ada transaksi
          </div>
        ) : (
          <div className="flex items-end justify-start gap-2 h-32">
            {visibleHourlyStats.map((stat) => (
              <div
                key={stat.hour}
                className="flex flex-col items-center gap-1 flex-1 min-w-0"
                title={`Jam ${stat.hour}: ${stat.count} transaksi, Total: ${fmt(stat.total)}`}
              >
                <div
                  className="bg-blue-600 rounded-t-sm w-full transition-all duration-300 hover:bg-blue-500 cursor-pointer"
                  style={{
                    height: stat.count > 0 ? `${(stat.count / maxHourlyCount) * 100}%` : "2px",
                    minHeight: "2px",
                  }}
                ></div>
                <span className="text-slate-400 text-xs">{stat.hour}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-bold text-slate-50 mb-4">
          Riwayat Transaksi
        </h3>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMethodFilter("ALL")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-150 ${
                methodFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-slate-50"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setMethodFilter("CASH")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-150 ${
                methodFilter === "CASH"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-slate-50"
              }`}
            >
              Tunai
            </button>
            <button
              onClick={() => setMethodFilter("QRIS")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-150 ${
                methodFilter === "QRIS"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-slate-50"
              }`}
            >
              QRIS
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {searchQuery || methodFilter !== "ALL"
              ? "Tidak ada transaksi yang sesuai"
              : "Belum ada transaksi"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                  <th className="text-left pb-3 px-2">#</th>
                  <th className="text-left pb-3 px-2">Waktu</th>
                  <th className="text-left pb-3 px-2">No Order</th>
                  <th className="text-left pb-3 px-2">Meja</th>
                  <th className="text-right pb-3 px-2">Items</th>
                  <th className="text-left pb-3 px-2">Metode</th>
                  <th className="text-right pb-3 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 20).map((order, idx) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2 text-slate-50">
                      {formatTime(order.paidAt)}
                    </td>
                    <td className="py-3 px-2 text-slate-50 font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {order.tableId ? `Meja ${order.tableId}` : "Takeaway"}
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-right">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="py-3 px-2">
                      {order.payment?.method === "CASH" ? (
                        <span className="inline-flex px-2 py-1 rounded-md bg-green-600/20 text-green-400 text-xs font-medium">
                          Tunai
                        </span>
                      ) : order.payment?.method === "QRIS" ? (
                        <span className="inline-flex px-2 py-1 rounded-md bg-blue-600/20 text-blue-400 text-xs font-medium">
                          QRIS
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-md bg-slate-600/20 text-slate-400 text-xs font-medium">
                          {order.payment?.method || "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-50 font-medium text-right">
                      {fmt(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length > 20 && (
              <p className="text-slate-400 text-sm text-center mt-4">
                Menampilkan 20 dari {filteredOrders.length} transaksi
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
