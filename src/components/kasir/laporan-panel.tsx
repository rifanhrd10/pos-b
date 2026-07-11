"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, CreditCard, Search, User, Store, Clock, BarChart2, ListOrdered, FileText } from "lucide-react";
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
          <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-4 h-24 animate-pulse shadow-sm"
            ></div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-48 animate-pulse shadow-sm"></div>

        {/* Table skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-64 animate-pulse shadow-sm"></div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText size={160} className="-rotate-12 transform translate-x-8 -translate-y-8" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Laporan Shift
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-blue-100 font-medium">
            <div className="flex items-center gap-1.5 bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-400/20 backdrop-blur-sm">
              <User size={14} className="opacity-70" />
              <span className="text-sm">{kasirName}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-400/20 backdrop-blur-sm">
              <Store size={14} className="opacity-70" />
              <span className="text-sm">{outletName}</span>
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 rounded-full pl-2 pr-4 py-1 border border-white/20 text-sm text-blue-50 backdrop-blur-sm shadow-sm">
            <div className="bg-blue-400/30 p-1 rounded-full">
               <Clock size={14} />
            </div>
            <span className="font-medium">Dibuka: {formatDate(summary.openedAt)}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Omset */}
        <div className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-6 -right-6 text-blue-50 opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
             <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Omset
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {fmt(summary.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-6 -right-6 text-emerald-50 opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
             <ShoppingCart size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl text-white shadow-sm shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Transaksi
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {summary.totalOrders}{" "}
              <span className="text-sm font-semibold text-slate-400 tracking-normal">
                transaksi
              </span>
            </p>
          </div>
        </div>

        {/* Pembayaran */}
        <div className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-6 -right-6 text-amber-50 opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
             <CreditCard size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl text-white shadow-sm shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Pembayaran
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Tunai</span>
                 <span className="text-sm font-bold text-slate-800">{fmt(summary.cashRevenue)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                 <span className="text-xs font-semibold text-slate-500 uppercase">QRIS</span>
                 <span className="text-sm font-bold text-slate-800">{fmt(summary.qrisRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
             <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tren Transaksi per Jam
          </h3>
        </div>
        
        {activeHours.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <BarChart2 className="w-8 h-8 text-slate-300 mb-2 opacity-50" />
            <span className="text-sm font-medium">Belum ada transaksi</span>
          </div>
        ) : (
          <div className="flex items-end justify-start gap-3 h-40 mt-4 px-2">
            {visibleHourlyStats.map((stat) => (
              <div
                key={stat.hour}
                className="flex flex-col items-center gap-2 flex-1 min-w-0 group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800/95 backdrop-blur-sm text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10 translate-y-2 group-hover:translate-y-0">
                   <div className="font-bold text-xs">{stat.count} Trx</div>
                   <div className="text-slate-300">{fmt(stat.total)}</div>
                   {/* Arrow */}
                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800/95"></div>
                </div>
                
                {/* Bar */}
                <div
                  className="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md w-full transition-all duration-300 group-hover:from-indigo-600 group-hover:to-indigo-500 cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                  style={{
                    height: stat.count > 0 ? `${(stat.count / maxHourlyCount) * 100}%` : "2px",
                    minHeight: "2px",
                    backgroundColor: stat.count === 0 ? "#e2e8f0" : undefined,
                    backgroundImage: stat.count === 0 ? "none" : undefined,
                    boxShadow: stat.count === 0 ? "none" : undefined,
                  }}
                ></div>
                <span className="text-slate-500 text-[10px] font-bold">{stat.hour}:00</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
               <ListOrdered className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Riwayat Transaksi
            </h3>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50 shadow-inner w-full md:w-auto">
              {(["ALL", "CASH", "QRIS"] as const).map((method) => (
                 <button
                   key={method}
                   onClick={() => setMethodFilter(method)}
                   className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                     methodFilter === method
                       ? "bg-white text-blue-700 shadow-sm border border-slate-200/50"
                       : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent"
                   }`}
                 >
                   {method === "ALL" ? "Semua" : method === "CASH" ? "Tunai" : "QRIS"}
                 </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Search className="w-8 h-8 mx-auto mb-3 text-slate-300 opacity-50" />
            <p className="text-sm font-medium">
              {searchQuery || methodFilter !== "ALL"
                ? "Tidak ada transaksi yang sesuai pencarian Anda"
                : "Belum ada transaksi di shift ini"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="text-center py-3 px-4 w-12">#</th>
                  <th className="text-left py-3 px-4">Waktu</th>
                  <th className="text-left py-3 px-4">No Order</th>
                  <th className="text-left py-3 px-4">Meja</th>
                  <th className="text-center py-3 px-4">Items</th>
                  <th className="text-center py-3 px-4">Metode</th>
                  <th className="text-right py-3 px-4 rounded-tr-xl">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 20).map((order, idx) => (
                  <tr
                    key={order.id}
                    className="bg-white hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-3 px-4 text-slate-400 text-center text-xs font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                       <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                          {formatTime(order.paidAt)}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold tracking-tight text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium text-xs">
                      {order.tableId ? `Meja ${order.tableId}` : "Takeaway"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-center font-semibold text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                         {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.payment?.method === "CASH" ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-green-50 border border-green-200/60 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                          Tunai
                        </span>
                      ) : order.payment?.method === "QRIS" ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          QRIS
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {order.payment?.method || "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-extrabold text-right text-xs">
                      {fmt(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length > 20 && (
              <div className="bg-slate-50 border-t border-slate-200 p-3">
                <p className="text-slate-500 text-xs font-medium text-center">
                  Menampilkan 20 dari {filteredOrders.length} transaksi terbaru
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
