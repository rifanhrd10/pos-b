"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Minus, Plus, X, Tag, ChevronDown } from "lucide-react";
import { getActivePromos, applyPromoByCode, applyPromoById, removePromo } from "@/actions/promo";
import { emitToast } from "@/components/ui/toast-provider";
import { CustomerSelector } from "@/components/kasir/customer-selector";

type ActivePromo = {
  id: string;
  name: string;
  type: string;
  discountType: string;
  discountValue: number;
  code?: string | null;
};

type OrderPromo = {
  id: string;
  discountAmount: number;
  promo: {
    id: string;
    name: string;
    type: string;
  };
};

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
  promos?: OrderPromo[];
  customer?: { id: string; name: string; phone: string | null } | null;
};

interface CartPanelProps {
  order: OrderWithItems | null;
  businessId: string;
  businessTaxRate: number;
  businessServiceRate: number;
  onUpdateQty: (orderItemId: string, qty: number) => void;
  onRemoveItem: (orderItemId: string) => void;
  onPay: () => void;
  onSaveBill: () => void;
  onRefreshOrder: (orderId: string) => Promise<void>;
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
  businessId,
  businessTaxRate,
  businessServiceRate,
  onUpdateQty,
  onRemoveItem,
  onPay,
  onSaveBill,
  onRefreshOrder,
  loading = false,
}: CartPanelProps) {
  const hasItems = order && order.items.length > 0;

  // Promo state
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [activePromos, setActivePromos] = useState<ActivePromo[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);

  const fetchActivePromos = useCallback(async () => {
    if (!businessId || !order) return;
    try {
      const promos = await getActivePromos(businessId, order.subtotal) as ActivePromo[];
      setActivePromos(promos);
    } catch {
      // silently ignore fetch errors
    }
  }, [businessId, order?.subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (order?.id) {
      fetchActivePromos();
    }
  }, [order?.id, order?.subtotal, fetchActivePromos]);

  const handleApplyVoucher = async () => {
    if (!order || !voucherCode.trim()) return;
    setPromoLoading(true);
    try {
      const result = await applyPromoByCode(order.id, voucherCode.trim());
      if (result.ok) {
        emitToast({ title: `Promo "${result.promoName}" diterapkan`, tone: "success" });
        setVoucherCode("");
        await onRefreshOrder(order.id);
        await fetchActivePromos();
      } else {
        emitToast({ title: result.error ?? "Gagal menerapkan promo", tone: "error" });
      }
    } catch {
      emitToast({ title: "Terjadi kesalahan", tone: "error" });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyPromoById = async () => {
    if (!order || !selectedPromoId) return;
    setPromoLoading(true);
    try {
      const result = await applyPromoById(order.id, selectedPromoId);
      if (result.ok) {
        emitToast({ title: `Promo "${result.promoName}" diterapkan`, tone: "success" });
        setSelectedPromoId("");
        await onRefreshOrder(order.id);
        await fetchActivePromos();
      } else {
        emitToast({ title: result.error ?? "Gagal menerapkan promo", tone: "error" });
      }
    } catch {
      emitToast({ title: "Terjadi kesalahan", tone: "error" });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = async (promoId: string) => {
    if (!order) return;
    setPromoLoading(true);
    try {
      const result = await removePromo(order.id, promoId);
      if (result.ok) {
        emitToast({ title: "Promo dihapus", tone: "info" });
        await onRefreshOrder(order.id);
        await fetchActivePromos();
      } else {
        emitToast({ title: result.error ?? "Gagal menghapus promo", tone: "error" });
      }
    } catch {
      emitToast({ title: "Terjadi kesalahan", tone: "error" });
    } finally {
      setPromoLoading(false);
    }
  };

  // Filter out already-applied promos from the dropdown
  const appliedPromoIds = new Set((order?.promos ?? []).map((op) => op.promo.id));
  const availablePromos = activePromos.filter((p) => !appliedPromoIds.has(p.id));

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
                <span className="text-slate-50 font-bold w-6 text-center text-sm">
                  {item.quantity}
                </span>
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-700 space-y-3">
        {hasItems && (
          <>
            {/* ── Customer Section ── */}
            <CustomerSelector
              businessId={businessId}
              orderId={order.id}
              currentCustomer={order.customer}
              onCustomerChange={() => onRefreshOrder(order.id)}
            />

            {/* ── Promo & Diskon Section ── */}
            <div className="bg-slate-700/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                  Promo &amp; Diskon
                </span>
              </div>

              {/* Applied promos badges */}
              {(order?.promos ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {order!.promos!.map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center gap-1 bg-green-900/40 border border-green-700/50 rounded-lg px-2 py-1"
                    >
                      <span className="text-green-300 text-xs font-medium">{op.promo.name}</span>
                      <span className="text-green-400 text-xs">
                        -{formatCurrency(op.discountAmount)}
                      </span>
                      <button
                        onClick={() => handleRemovePromo(op.promo.id)}
                        disabled={promoLoading}
                        className="text-green-500 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Voucher code input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                  placeholder="Kode voucher..."
                  disabled={promoLoading || !order}
                  className="
                    flex-1 bg-slate-600 border border-slate-500 rounded-lg px-2.5 py-1.5
                    text-slate-50 text-xs placeholder-slate-400
                    focus:outline-none focus:border-blue-400
                    disabled:opacity-50
                  "
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={promoLoading || !voucherCode.trim() || !order}
                  className="
                    px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white
                    rounded-lg text-xs font-medium transition-all duration-150
                    cursor-pointer active:scale-95
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  Terapkan
                </button>
              </div>

              {/* Dropdown select from active promos */}
              {availablePromos.length > 0 && (
                <div className="flex gap-1.5">
                  <div className="flex-1 relative">
                    <select
                      value={selectedPromoId}
                      onChange={(e) => setSelectedPromoId(e.target.value)}
                      disabled={promoLoading || !order}
                      className="
                        w-full bg-slate-600 border border-slate-500 rounded-lg px-2.5 py-1.5 pr-7
                        text-slate-50 text-xs appearance-none
                        focus:outline-none focus:border-blue-400
                        disabled:opacity-50 cursor-pointer
                      "
                    >
                      <option value="">Pilih promo tersedia...</option>
                      {availablePromos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.code ? ` (${p.code})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleApplyPromoById}
                    disabled={promoLoading || !selectedPromoId || !order}
                    className="
                      px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white
                      rounded-lg text-xs font-medium transition-all duration-150
                      cursor-pointer active:scale-95
                      disabled:opacity-40 disabled:cursor-not-allowed
                    "
                  >
                    Terapkan
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {businessTaxRate > 0 && (
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Pajak ({businessTaxRate}%)</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              {businessServiceRate > 0 && (
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Service ({businessServiceRate}%)</span>
                  <span>{formatCurrency(order.serviceAmount)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-400 text-xs">
                  <span>Diskon</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-slate-600">
                <span className="text-slate-300 text-sm font-semibold">Total</span>
                <span className="text-xl font-bold text-slate-50">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </>
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
