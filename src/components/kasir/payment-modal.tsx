"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Wallet, Smartphone, ArrowLeft, Coins, QrCode, X, Loader2, CheckCircle } from "lucide-react";
import { processPayment, confirmQrisPayment, checkPaymentStatus } from "@/actions/kasir";

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

interface PaymentModalProps {
  order: OrderWithItems;
  paymentMethods: Array<{
    id: string;
    type: string;
    name: string;
    qrisImage?: string | null;
    qrisNote?: string | null;
  }>;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
  employeeId: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export function PaymentModal({
  order,
  paymentMethods,
  onSuccess,
  onClose,
  employeeId,
}: PaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // QRIS state
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isDynamicQris, setIsDynamicQris] = useState(false);
  const [qrisSimulated, setQrisSimulated] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (expireTimeoutRef.current) clearTimeout(expireTimeoutRef.current);
    };
  }, []);

  // Methods
  const cashMethod = { id: "CASH", type: "CASH", name: "Tunai", qrisImage: null as string | null, qrisNote: null as string | null };
  const otherMethods = paymentMethods.filter((m) => m.type !== "CASH");
  const allMethods = [cashMethod, ...otherMethods];

  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [cashEntered, setCashEntered] = useState<string>("");

  const grandTotal = order.totalAmount;
  const cashAmount = parseFloat(cashEntered) || 0;
  const changeAmount = cashAmount - grandTotal;

  // Numpad handlers
  const handleNumPress = (val: string) => {
    setCashEntered((prev) => {
      if (prev === "" && val === "0") return prev;
      return prev + val;
    });
  };
  const handleNumDelete = () => setCashEntered((prev) => prev.slice(0, -1));
  const handleNumClear = () => setCashEntered("");
  const handleExactAmount = () => setCashEntered(grandTotal.toString());
  const handleShortcutCash = (amount: number) => setCashEntered(amount.toString());

  const handleTabChange = (tab: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (expireTimeoutRef.current) clearTimeout(expireTimeoutRef.current);
    setQrUrl(null);
    setPendingPaymentId(null);
    setIsPolling(false);
    setIsDynamicQris(false);
    setQrisSimulated(false);
    setError(null);
    setPaymentMethod(tab);
  };

  const handleProcessPayment = () => {
    setError(null);
    startTransition(async () => {
      const activeMethod = allMethods.find((m) => m.type === paymentMethod);

      const paymentData: {
        orderId: string;
        employeeId: string;
        method: "CASH" | "QRIS" | "BANK_TRANSFER";
        cashEntered?: number;
        referenceNo?: string;
        paymentMethodId?: string;
      } = {
        orderId: order.id,
        employeeId,
        method: paymentMethod as "CASH" | "QRIS" | "BANK_TRANSFER",
      };

      if (paymentMethod === "CASH") {
        paymentData.cashEntered = cashAmount;
      }

      if (paymentMethod === "QRIS" && activeMethod && activeMethod.id !== "CASH") {
        paymentData.paymentMethodId = activeMethod.id;
      }

      const result = await processPayment(paymentData);

      if (result.error) {
        setError(result.error);
        return;
      }

      const paymentId = (result.payment as { id: string }).id;

      if (result.qrUrl) {
        setQrUrl(result.qrUrl);
        setPendingPaymentId(paymentId);

        const dynamic = !!result.externalId;
        setIsDynamicQris(dynamic);

        if (dynamic) {
          setIsPolling(true);
          const interval = setInterval(async () => {
            const statusResult = await checkPaymentStatus(paymentId);
            if (statusResult.status === "PAID") {
              clearInterval(interval);
              pollingIntervalRef.current = null;
              setIsPolling(false);
              onSuccess(paymentId);
            }
          }, 3000);
          pollingIntervalRef.current = interval;

          const expireTimeout = setTimeout(() => {
            clearInterval(interval);
            pollingIntervalRef.current = null;
            setIsPolling(false);
            setError("Waktu pembayaran habis. Silakan coba lagi.");
          }, 5 * 60 * 1000);
          expireTimeoutRef.current = expireTimeout;
        }
        return;
      }

      onSuccess(paymentId);
    });
  };

  const handleConfirmStaticQris = () => {
    if (!pendingPaymentId) return;
    startTransition(async () => {
      const result = await confirmQrisPayment(pendingPaymentId, employeeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess(pendingPaymentId);
    });
  };

  const activeMethod = allMethods.find((m) => m.type === paymentMethod);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-12 h-[550px]">
        {/* Left Column: Transaction Summary */}
        <div className="md:col-span-4 bg-slate-50 p-6 border-r border-slate-150 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Batal & Kembali
              </button>
              <h3 className="text-lg font-bold text-slate-800 mt-2">Ringkasan Tagihan</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase font-mono tracking-wider">
                {order.orderType === "TAKEAWAY"
                  ? "Takeaway (Tanpa Meja)"
                  : order.tableName
                  ? `Meja: ${order.tableName}`
                  : `Order #${order.orderNumber}`}
              </p>
            </div>

            {/* Items */}
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs py-1 border-b border-slate-200/50">
                  <span className="text-slate-600 line-clamp-1 flex-1 pr-2">
                    {item.name}
                    {item.variantName ? ` (${item.variantName})` : ""}{" "}
                    <strong className="text-slate-800">x{item.quantity}</strong>
                  </span>
                  <span className="font-mono text-slate-700 font-medium">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              {order.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service</span>
                  <span className="font-mono">{formatCurrency(order.serviceAmount)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon</span>
                  <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl">
              <span className="text-xs font-bold text-blue-800">Total Tagihan</span>
              <span className="text-lg font-black text-blue-600 font-mono">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Methods */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between bg-white">
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange("CASH")}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all cursor-pointer ${
                paymentMethod === "CASH"
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                  : "border-slate-100 bg-slate-50 hover:border-blue-200 text-slate-500"
              }`}
            >
              <Wallet className={`w-6 h-6 mb-1 ${paymentMethod === "CASH" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="font-bold text-[11px] tracking-wide">TUNAI / CASH</span>
            </button>
            {otherMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleTabChange(method.type)}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all cursor-pointer ${
                  paymentMethod === method.type
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-blue-200 text-slate-500"
                }`}
              >
                <Smartphone className={`w-6 h-6 mb-1 ${paymentMethod === method.type ? "text-blue-600" : "text-slate-400"}`} />
                <span className="font-bold text-[11px] tracking-wide">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Content */}
          {paymentMethod === "CASH" ? (
            <div className="grid grid-cols-12 gap-5 my-3 flex-1 items-center">
              {/* Left: Input & Shortcuts */}
              <div className="col-span-6 space-y-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Nominal Uang Masuk
                  </span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={cashEntered ? parseInt(cashEntered).toLocaleString("id-ID") : "0"}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 text-xl font-black text-slate-900 pl-12 pr-4 py-3 rounded-xl outline-none select-none text-right font-mono focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Kembalian Kasir
                  </span>
                  <div
                    className={`p-3.5 rounded-xl border flex justify-between items-center ${
                      changeAmount >= 0
                        ? "bg-blue-50 border-blue-100 text-blue-600"
                        : "bg-rose-50/50 border-rose-100 text-rose-800"
                    }`}
                  >
                    <Coins className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-black font-mono text-right flex-1">
                      {changeAmount >= 0
                        ? formatCurrency(changeAmount)
                        : `Kurang ${formatCurrency(Math.abs(changeAmount))}`}
                    </span>
                  </div>
                </div>

                {/* Shortcuts */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Uang Pas & Pintasan
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExactAmount}
                      className="py-2 px-2.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer transition-all text-center"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleShortcutCash(amt)}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-all text-center"
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Numpad */}
              <div className="col-span-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumPress(num)}
                      className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                      type="button"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleNumClear}
                    className="h-11 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    CLEAR
                  </button>
                  <button
                    onClick={() => handleNumPress("0")}
                    className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    0
                  </button>
                  <button
                    onClick={handleNumDelete}
                    className="h-11 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    DEL
                  </button>
                </div>
                <button
                  onClick={() => handleNumPress("000")}
                  className="w-full h-9 mt-2 bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center"
                  type="button"
                >
                  +000 (Ribu)
                </button>
              </div>
            </div>
          ) : (
            /* QRIS / Other payment */
            <div className="my-3 flex-1 flex items-center justify-center gap-8">
              {qrUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-inner relative">
                    <img src={qrUrl} alt="QR Code" className="w-36 h-36 object-contain rounded-xl" />
                    {qrisSimulated && (
                      <div className="absolute inset-0 bg-emerald-500/90 rounded-xl flex flex-col items-center justify-center text-white p-3">
                        <CheckCircle className="w-10 h-10 mb-1" />
                        <span className="text-[11px] font-bold text-center">SCAN BERHASIL</span>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(grandTotal)}</p>

                  {isDynamicQris ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Menunggu pembayaran...</span>
                      </div>
                      <p className="text-slate-400 text-xs">Batas waktu: 5 menit</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmStaticQris}
                      disabled={isPending}
                      className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        "Konfirmasi Pembayaran Diterima"
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  {activeMethod?.qrisImage ? (
                    <img
                      src={activeMethod.qrisImage}
                      alt="QRIS Code"
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-center shadow-inner">
                        <QrCode className="w-36 h-36 text-slate-800" />
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 mt-2 font-mono uppercase tracking-wider">
                        QRIS POS
                      </span>
                    </div>
                  )}
                  <p className="text-slate-600 mt-4 text-sm font-medium">
                    Scan untuk membayar
                  </p>
                  <p className="text-slate-900 font-bold text-2xl mt-1 font-mono">
                    {formatCurrency(grandTotal)}
                  </p>
                  {activeMethod?.qrisNote && (
                    <p className="text-slate-400 text-xs mt-2 text-center italic">
                      {activeMethod.qrisNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Bottom Actions */}
          {!(paymentMethod !== "CASH" && qrUrl) && (
            <div className="flex gap-3.5 border-t border-slate-100 pt-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                type="button"
              >
                Kembali
              </button>

              <button
                onClick={handleProcessPayment}
                disabled={isPending || (paymentMethod === "CASH" && cashAmount < grandTotal)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xl ${
                  (paymentMethod === "CASH" && cashAmount >= grandTotal) ||
                  paymentMethod !== "CASH"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 cursor-pointer active:scale-95"
                    : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                }`}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Konfirmasi Pembayaran Lunas"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
