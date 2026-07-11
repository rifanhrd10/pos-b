"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Minus, Plus, Trash2, Edit3, Send, DollarSign, X, Tag, ChevronDown, User } from "lucide-react";
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
  const [promoMode, setPromoMode] = useState<"select" | "manual">("select");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const fetchActivePromos = useCallback(async () => {
    if (!businessId || !order) return;
    try {
      const promos = (await getActivePromos(businessId, order.subtotal)) as ActivePromo[];
      setActivePromos(promos);
    } catch {
      // silently ignore
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

  const handleApplyUnifiedPromo = async () => {
    if (promoMode === "manual") {
      await handleApplyVoucher();
    } else {
      await handleApplyPromoById();
    }
  };

  const appliedPromoIds = new Set((order?.promos ?? []).map((op) => op.promo.id));
  const availablePromos = activePromos.filter((p) => !appliedPromoIds.has(p.id));

  return (
    <div className="w-full h-full bg-white border-l border-slate-200 shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Pesanan Aktif</h2>
          {order ? (
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
              {order.orderType === "TAKEAWAY"
                ? "Takeaway (Tanpa Meja)"
                : order.tableName
                ? `Meja: ${order.tableName} • Dine In`
                : `Order #${order.orderNumber}`}
            </p>
          ) : (
            <p className="text-xs text-slate-400">Pilih meja di sebelah kiri</p>
          )}
        </div>
      </div>

      {/* Customer Selector */}
      {order && hasItems && (
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/60 flex-shrink-0">
          <CustomerSelector
            businessId={businessId}
            orderId={order.id}
            currentCustomer={order.customer}
            onCustomerChange={() => onRefreshOrder(order.id)}
          />
        </div>
      )}

      {/* Main Body — Items List */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {!order ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-300 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Meja Belum Dipilih</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
              Silakan pilih salah satu meja pada denah di samping kiri untuk mengelola pesanan.
            </p>
          </div>
        ) : !hasItems ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-emerald-500/80 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Keranjang Kosong</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
              Pilih menu makanan, minuman, atau dessert di katalog sebelah kiri untuk ditambahkan ke keranjang.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col gap-2 relative group"
              >
                {/* Name and Price */}
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[10px] text-blue-600 font-medium">{item.variantName}</span>
                    )}
                    {item.toppings.length > 0 && (
                      <div className="text-[10px] text-slate-400">
                        + {item.toppings.map((t) => t.name).join(", ")}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatCurrency(item.price)} / pcs
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      disabled={loading}
                      className="w-6 h-6 rounded-md hover:bg-white active:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono text-slate-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      disabled={loading}
                      className="w-6 h-6 rounded-md hover:bg-white active:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Notes & Subtotal */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                  <div className="flex-1 mr-2">
                    {item.notes ? (
                      <span className="text-amber-700 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Catatan: {item.notes}
                      </span>
                    ) : (
                      <span className="text-slate-400">Tidak ada catatan</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={loading}
                  className="absolute -top-1 -right-1 p-1 bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-500 border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  type="button"
                  title="Hapus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary & Actions */}
      {order && (
        <div className="bg-white border-t border-slate-200 p-4 space-y-3.5 flex-shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
          {hasItems && (
            <>
              {/* Promo Section */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide">
                    Promo & Diskon
                  </span>
                </div>

                {/* Applied promos */}
                {(order.promos ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {order.promos!.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1"
                      >
                        <span className="text-emerald-700 text-[10px] font-medium">{op.promo.name}</span>
                        <span className="text-emerald-600 text-[10px]">
                          -{formatCurrency(op.discountAmount)}
                        </span>
                        <button
                          onClick={() => handleRemovePromo(op.promo.id)}
                          disabled={promoLoading}
                          className="text-emerald-500 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Unified Promo input */}
                <div className="flex gap-1.5">
                  <div className="flex-1 relative">
                    {promoMode === "manual" || availablePromos.length === 0 ? (
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyUnifiedPromo()}
                          placeholder="Ketik kode voucher..."
                          disabled={promoLoading || !order}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-2.5 pr-8 py-1.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                        />
                        {availablePromos.length > 0 && (
                          <button
                            onClick={() => setPromoMode("select")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Kembali pilih promo"
                            type="button"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedPromoId}
                          onChange={(e) => {
                            if (e.target.value === "MANUAL") {
                              setPromoMode("manual");
                              setSelectedPromoId("");
                            } else {
                              setSelectedPromoId(e.target.value);
                            }
                          }}
                          disabled={promoLoading || !order}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 text-slate-800 text-xs appearance-none focus:outline-none focus:border-blue-400 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">Pilih promo tersedia...</option>
                          {availablePromos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                              {p.code ? ` (${p.code})` : ""}
                            </option>
                          ))}
                          <option value="MANUAL">+ Masukkan kode manual...</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleApplyUnifiedPromo}
                    disabled={
                      promoLoading ||
                      !order ||
                      (promoMode === "manual" && !voucherCode.trim()) ||
                      (promoMode === "select" && !selectedPromoId)
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    type="button"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Prices Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-700">{formatCurrency(order.subtotal)}</span>
                </div>
                {businessTaxRate > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Pajak ({businessTaxRate}%)</span>
                    <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                {businessServiceRate > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Service ({businessServiceRate}%)</span>
                    <span className="font-mono">{formatCurrency(order.serviceAmount)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-emerald-600">
                    <span>Diskon</span>
                    <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Total Pembayaran</span>
            <span className="text-2xl font-black text-blue-600 font-mono">
              {formatCurrency(hasItems ? order.totalAmount : 0)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onSaveBill}
              disabled={!hasItems || loading}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                hasItems
                  ? "bg-slate-50 border-slate-250 text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-95"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              type="button"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" /> Kirim / Simpan
            </button>

            <button
              onClick={onPay}
              disabled={!hasItems || loading}
              className={`flex-1 py-3 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-xl ${
                hasItems
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200 cursor-pointer active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              type="button"
            >
              <DollarSign className="w-3.5 h-3.5" /> Bayar Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
