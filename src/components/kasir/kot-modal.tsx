"use client";

import { X, Printer } from "lucide-react";

interface KotModalProps {
  order: {
    orderNumber: string;
    tableName?: string;
    orderType: string;
    cashierName: string;
    createdAt: Date;
    items: Array<{
      name: string;
      variantName?: string;
      toppings?: Array<{ name: string }>;
      quantity: number;
      notes?: string;
    }>;
  };
  onClose: () => void;
}

const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function KotModal({ order, onClose }: KotModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          .kot-print-area { display: block !important; }
          .no-print { display: none !important; }
        }
        .kot-print-area { display: none; }
      `}</style>

      {/* Print-only area */}
      <div className="kot-print-area">
        <div style={{ fontFamily: "monospace", fontSize: "12px", width: "80mm", padding: "4px" }}>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
            *** KOT ***
          </div>
          <div style={{ textAlign: "center" }}>
            {order.orderType === "DINE_IN" ? "Dine In" : "Takeaway"}
            {order.tableName ? ` — Meja: ${order.tableName}` : ""}
          </div>
          <div>No: {order.orderNumber}</div>
          <div>Tgl: {formatDateTime(order.createdAt)}</div>
          <div>Kasir: {order.cashierName}</div>
          <div>{"─".repeat(32)}</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {item.quantity}x {item.name}
                {item.variantName ? ` (${item.variantName})` : ""}
              </div>
              {item.toppings?.map((t, j) => (
                <div key={j}>&nbsp;&nbsp;+ {t.name}</div>
              ))}
              {item.notes && (
                <div style={{ fontStyle: "italic" }}>&nbsp;&nbsp;* {item.notes}</div>
              )}
            </div>
          ))}
          <div>{"─".repeat(32)}</div>
        </div>
      </div>

      {/* Modal UI */}
      <div className="no-print fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh]">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white">Kitchen Order Ticket</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* KOT content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl p-4 font-mono text-sm">
              {/* KOT header */}
              <div className="text-center font-bold text-lg mb-1">*** KOT ***</div>
              <div className="text-center text-slate-600 mb-2">
                {order.orderType === "DINE_IN" ? "Dine In" : "Takeaway"}
                {order.tableName ? ` — Meja: ${order.tableName}` : ""}
              </div>
              <div className="text-xs text-slate-500">No: {order.orderNumber}</div>
              <div className="text-xs text-slate-500">
                Tgl: {formatDateTime(order.createdAt)}
              </div>
              <div className="text-xs text-slate-500 mb-2">
                Kasir: {order.cashierName}
              </div>
              <div className="border-t border-dashed border-slate-300 my-2" />

              {/* Items */}
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-bold text-base">
                      {item.quantity}x {item.name}
                      {item.variantName && (
                        <span className="font-normal text-slate-600">
                          {" "}({item.variantName})
                        </span>
                      )}
                    </div>
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="pl-4 text-slate-600 text-sm">
                        {item.toppings.map((t, j) => (
                          <div key={j}>+ {t.name}</div>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <div className="pl-4 text-slate-500 text-xs italic">
                        * {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 my-2" />
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak KOT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
