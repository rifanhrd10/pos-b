"use client";

import { ShoppingCart, Minus, Plus, X } from "lucide-react";

type OrderWithItems = {
  id: string;
  orderNumber: string;
  tableId: string | null;
  tableName?: string;
  orderType: string;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    variantName: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    notes: string | null;
    toppings: Array<{ id: string; name: string; price: number }>;
  }>;
};

interface CartPanelProps {
  order: OrderWithItems | null;
  businessTaxRate: number;
  businessServiceRate: number;
  onUpdateQty: (orderItemId: string, qty: number) => void;
  onRemoveItem: (orderItemId: string) => void;
  onPay: () => void;
  onSaveBill: () => void;
  loading?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export function CartPanel({
  order,
  businessTaxRate,
  businessServiceRate,
  onUpdateQty,
  onRemoveItem,
  onPay,
  onSaveBill,
  loading = false,
}: CartPanelProps) {
  const hasItems = order && order.items.length > 0;

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-700 rounded-t-xl px-4 py-3 flex items-center justify-between">
        {order ? (
          <>
            <span className="text-slate-300 text-sm">{order.orderNumber}</span>
            <span className="text-slate-50 font-bold">
              {order.tableName || (order.orderType === "TAKEAWAY" ? "Takeaway" : "—")}
            </span>
          </>
        ) : (
          <span className="text-slate-400 text-sm">Tidak ada pesanan aktif</span>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!hasItems ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm text-center">Pilih meja atau tambah produk</p>
          </div>
        ) : (
          order.items.map((item) => (
            <div key={item.id} className="bg-slate-700 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-50 font-medium text-sm truncate">{item.name}</div>
                  {item.variantName && (
                    <div className="text-slate-400 text-xs mt-0.5">{item.variantName}</div>
                  )}
                  {item.toppings.length > 0 && (
                    <div className="text-slate-400 text-xs mt-0.5">
                      + {item.toppings.map((t) => t.name).join(", ")}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-slate-400 text-xs mt-0.5 italic">{item.notes}</div>
                  )}
                </div>

                {/* Right: delete + price */}
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    disabled={loading}
                    className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-slate-50 text-sm font-bold">{formatCurrency(item.subtotal)}</div>
                </div>
              </div>

              {/* Qty stepper */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                  disabled={loading}
                  className="
                    w-9 h-9 rounded-lg bg-slate-600 hover:bg-slate-500
                    flex items-center justify-center cursor-pointer
                    transition-all duration-150 active:scale-95 disabled:opacity-50
                  "
                >
                  <Minus className="w-4 h-4 text-slate-50" />
                </button>
                <span className="text-slate-50 font-bold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                  disabled={loading}
                  className="
                    w-9 h-9 rounded-lg bg-slate-600 hover:bg-slate-500
                    flex items-center justify-center cursor-pointer
                    transition-all duration-150 active:scale-95 disabled:opacity-50
                  "
                >
                  <Plus className="w-4 h-4 text-slate-50" />
                </button>
                <span className="text-slate-400 text-xs ml-auto">{formatCurrency(item.price)}/item</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-700 rounded-b-xl p-4">
        {order && (
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-50">{formatCurrency(order.subtotal)}</span>
            </div>
            {businessTaxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">PPN ({businessTaxRate}%)</span>
                <span className="text-slate-50">{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {businessServiceRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Layanan ({businessServiceRate}%)</span>
                <span className="text-slate-50">{formatCurrency(order.serviceAmount)}</span>
              </div>
            )}
            <div className="h-px bg-slate-600 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Total</span>
              <span className="text-xl font-bold text-slate-50">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSaveBill}
            disabled={!hasItems || loading}
            className="
              flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-slate-50
              rounded-xl text-sm font-medium transition-all duration-150
              cursor-pointer active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Simpan Bill
          </button>
          <button
            onClick={onPay}
            disabled={!hasItems || loading}
            className="
              flex-1 py-3 px-6 bg-green-600 hover:bg-green-500 text-white
              rounded-xl font-bold text-base transition-all duration-150
              cursor-pointer active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            BAYAR
          </button>
        </div>
      </div>
    </div>
  );
}
