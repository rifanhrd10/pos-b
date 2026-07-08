"use client";

import { ShoppingBag, Users } from "lucide-react";

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

export function TableSelection({
  tables,
  tableStatuses,
  selectedTableId,
  onSelectTable,
}: TableSelectionProps) {
  const getTableStatus = (tableId: string) => {
    return tableStatuses.find((ts) => ts.tableId === tableId);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 h-full overflow-y-auto">
      <h3 className="text-slate-300 text-sm font-medium mb-3">Pilih Meja</h3>

      <div className="grid grid-cols-3 gap-2">
        {tables.map((table) => {
          const status = getTableStatus(table.id);
          const isSelected = selectedTableId === table.id;

          let statusClass = "bg-slate-700";
          let statusText = "Tersedia";
          let statusColor = "text-slate-400";

          if (status?.status === "OCCUPIED") {
            statusClass = "bg-blue-900/50 border border-blue-700";
            statusText = "Terisi";
            statusColor = "text-blue-400";
          } else if (status?.status === "BILL_REQUESTED") {
            statusClass = "bg-amber-900/50 border border-amber-700";
            statusText = "Minta Bill";
            statusColor = "text-amber-400";
          }

          return (
            <button
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className={`
                ${statusClass} rounded-xl p-3 cursor-pointer transition-all duration-150
                hover:bg-slate-600 active:scale-95 text-left
                ${isSelected ? "ring-2 ring-blue-500 bg-slate-600" : ""}
              `}
            >
              <div className="text-slate-50 font-bold text-base mb-1">{table.name}</div>
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                <Users className="w-3 h-3" />
                <span>{table.capacity}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColor.replace("text-", "bg-")}`} />
                <span className={`${statusColor} text-xs font-medium`}>{statusText}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Takeaway button */}
      <button
        onClick={() => onSelectTable("takeaway")}
        className={`
          bg-slate-700 hover:bg-slate-600 rounded-xl p-3 w-full flex items-center gap-2
          cursor-pointer mt-3 transition-all duration-150 active:scale-95
          ${selectedTableId === "takeaway" ? "ring-2 ring-blue-500 bg-slate-600" : ""}
        `}
      >
        <ShoppingBag className="w-5 h-5 text-blue-400" />
        <span className="text-slate-50 font-semibold">Takeaway</span>
      </button>
    </div>
  );
}
