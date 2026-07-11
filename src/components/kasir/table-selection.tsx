"use client";

import { useState } from "react";
import { Coffee, CheckCircle2, AlertCircle, ShoppingBag, Ban, Users } from "lucide-react";

interface TableSelectionProps {
  tables: Array<{ id: string; name: string; capacity: number }>;
  tableStatuses: Array<{
    tableId: string;
    tableName: string;
    status: "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED";
    orderId?: string | null;
  }>;
  selectedTableId: string | null;
  onSelectTable: (tableId: string | "takeaway") => void;
}

type FilterType = "Semua" | "Tersedia" | "Terisi" | "Menunggu";

export function TableSelection({
  tables,
  tableStatuses,
  selectedTableId,
  onSelectTable,
}: TableSelectionProps) {
  const [filter, setFilter] = useState<FilterType>("Semua");

  const getTableStatus = (tableId: string) => {
    return tableStatuses.find((ts) => ts.tableId === tableId);
  };

  // Map backend status to display
  const getDisplayStatus = (tableId: string): "Tersedia" | "Terisi" | "Menunggu Pembayaran" => {
    const status = getTableStatus(tableId);
    if (!status) return "Tersedia";
    switch (status.status) {
      case "OCCUPIED":
        return "Terisi";
      case "BILL_REQUESTED":
        return "Menunggu Pembayaran";
      default:
        return "Tersedia";
    }
  };

  // Filter tables
  const filteredTables = tables.filter((t) => {
    if (filter === "Semua") return true;
    const displayStatus = getDisplayStatus(t.id);
    if (filter === "Tersedia") return displayStatus === "Tersedia";
    if (filter === "Terisi") return displayStatus === "Terisi";
    if (filter === "Menunggu") return displayStatus === "Menunggu Pembayaran";
    return true;
  });

  // Stats
  const availableCount = tables.filter((t) => getDisplayStatus(t.id) === "Tersedia").length;
  const occupiedCount = tables.filter((t) => getDisplayStatus(t.id) === "Terisi").length;
  const waitingCount = tables.filter((t) => getDisplayStatus(t.id) === "Menunggu Pembayaran").length;

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-800">Denah Layout Meja</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pilih meja aktif untuk melayani pesanan pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-500 font-medium">Semua: <strong className="text-slate-800">{tables.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 font-medium">Tersedia: <strong className="text-emerald-900">{availableCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-rose-700 font-medium">Terisi: <strong className="text-rose-900">{occupiedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-700 font-medium">Menunggu: <strong className="text-amber-900">{waitingCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Takeaway */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["Semua", "Tersedia", "Terisi", "Menunggu"] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-150"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelectTable("takeaway")}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-150 cursor-pointer active:scale-95"
          type="button"
        >
          <ShoppingBag className="w-4 h-4" /> Pesanan Baru (Takeaway)
        </button>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const displayStatus = getDisplayStatus(table.id);
            const isActive = selectedTableId === table.id;

            let statusBg = "";
            let statusBorder = "";
            let statusIconBg = "";
            let statusIconColor = "";
            let statusDot = "";
            let statusTextColor = "";
            let StatusIcon = CheckCircle2;

            switch (displayStatus) {
              case "Tersedia":
                statusBg = "bg-white hover:bg-slate-50";
                statusBorder = isActive ? "border-emerald-500 ring-4 ring-emerald-500/20" : "border-slate-200 hover:border-emerald-300";
                statusIconBg = "bg-emerald-50 group-hover:bg-emerald-100";
                statusIconColor = "text-emerald-600";
                statusDot = "bg-emerald-500";
                statusTextColor = "text-emerald-700";
                StatusIcon = CheckCircle2;
                break;
              case "Terisi":
                statusBg = "bg-rose-50/40 hover:bg-rose-50/80";
                statusBorder = isActive ? "border-rose-500 ring-4 ring-rose-500/20" : "border-rose-200 hover:border-rose-300";
                statusIconBg = "bg-white";
                statusIconColor = "text-rose-600";
                statusDot = "bg-rose-500";
                statusTextColor = "text-rose-700";
                StatusIcon = Coffee;
                break;
              case "Menunggu Pembayaran":
                statusBg = "bg-amber-50/40 hover:bg-amber-50/80";
                statusBorder = isActive ? "border-amber-500 ring-4 ring-amber-500/20" : "border-amber-200 hover:border-amber-300";
                statusIconBg = "bg-white";
                statusIconColor = "text-amber-600";
                statusDot = "bg-amber-500";
                statusTextColor = "text-amber-700";
                StatusIcon = AlertCircle;
                break;
            }

            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={`group relative flex h-28 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${statusBg} ${statusBorder}`}
                type="button"
              >
                <div className="flex w-full items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-800">{table.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Users size={12} className="opacity-70" />
                      <span>{table.capacity} Kursi</span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-2.5 transition-colors ${statusIconBg}`}>
                    <StatusIcon size={16} className={`${statusIconColor}`} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="mt-auto flex w-full items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusDot} ${isActive ? "animate-pulse" : ""}`}></div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${statusTextColor}`}>
                    {displayStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 mt-2">
            <Ban className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">Tidak ada meja dengan status &ldquo;{filter}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
