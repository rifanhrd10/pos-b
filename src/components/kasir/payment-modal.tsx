"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { X, Loader2, QrCode } from "lucide-react";
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
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear polling timers on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (expireTimeoutRef.current) clearTimeout(expireTimeoutRef.current);
    };
  }, []);

  // Always show CASH first, then other methods
  const cashMethod: { id: string; type: string; name: string; qrisImage?: string | null; qrisNote?: string | null } = { id: "CASH", type: "CASH", name: "Tunai" };
  const otherMethods = paymentMethods.filter((m) => m.type !== "CASH");
  const allMethods = [cashMethod, ...otherMethods];

  const [activeTab, setActiveTab] = useState<string>("CASH");
  const [cashEntered, setCashEntered] = useState<number>(0);

  const changeAmount = cashEntered - order.totalAmount;
  const canProcessCash = cashEntered >= order.totalAmount;

  const handleQuickAmount = (amount: "pas" | number) => {
    if (amount === "pas") {
      setCashEntered(order.totalAmount);
    } else {
      setCashEntered((prev) => prev + amount);
    }
  };

  const handleTabChange = (tab: string) => {
    // Reset QRIS state when switching tabs
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (expireTimeoutRef.current) clearTimeout(expireTimeoutRef.current);
    setQrUrl(null);
    setPendingPaymentId(null);
    setIsPolling(false);
    setIsDynamicQris(false);
    setError(null);
    setActiveTab(tab);
  };

  const handleProcessPayment = () => {
    setError(null);
    startTransition(async () => {
      const activeMethod = allMethods.find((m) => m.type === activeTab);

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
        method: activeTab as "CASH" | "QRIS" | "BANK_TRANSFER",
      };

      if (activeTab === "CASH") {
        paymentData.cashEntered = cashEntered;
      }

      // Pass paymentMethodId for QRIS methods
      if (activeTab === "QRIS" && activeMethod && activeMethod.id !== "CASH") {
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

        // Dynamic QRIS: has externalId — poll for status
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

          // Auto-expire after 5 minutes
          const expireTimeout = setTimeout(() => {
            clearInterval(interval);
            pollingIntervalRef.current = null;
            setIsPolling(false);
            setError("Waktu pembayaran habis. Silakan coba lagi.");
          }, 5 * 60 * 1000);

          expireTimeoutRef.current = expireTimeout;
        }
        // Static QRIS: wait for manual confirm — do not call onSuccess yet
        return;
      }

      // CASH or immediate success
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

  const activeMethod = allMethods.find((m) => m.type === activeTab);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-2xl">Pembayaran</h2>
            <p className="text-slate-300 text-lg mt-1">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Method Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          {allMethods.map((method) => (
            <button
              key={method.type}
              onClick={() => handleTabChange(method.type)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer
                ${
                  activeTab === method.type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }
              `}
            >
              {method.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "CASH" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total</p>
                <p className="text-white font-bold text-3xl">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Uang Diterima
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleQuickAmount("pas")}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all cursor-pointer"
                  >
                    Pas
                  </button>
                  <button
                    onClick={() => handleQuickAmount(50000)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all cursor-pointer"
                  >
                    +50rb
                  </button>
                  <button
                    onClick={() => handleQuickAmount(100000)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all cursor-pointer"
                  >
                    +100rb
                  </button>
                  <button
                    onClick={() => handleQuickAmount(200000)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all cursor-pointer"
                  >
                    +200rb
                  </button>
                </div>
                <input
                  type="number"
                  value={cashEntered || ""}
                  onChange={(e) => setCashEntered(Number(e.target.value) || 0)}
                  placeholder="Masukkan jumlah uang"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm">Kembalian</p>
                <p
                  className={`font-bold text-2xl ${
                    changeAmount < 0
                      ? "text-red-500"
                      : changeAmount > 0
                      ? "text-green-500"
                      : "text-slate-500"
                  }`}
                >
                  {formatCurrency(Math.max(0, changeAmount))}
                </p>
              </div>
            </div>
          )}

          {activeTab === "QRIS" && (
            <div className="space-y-4">
              {qrUrl ? (
                /* QR code shown after processPayment returns qrUrl */
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  {isDynamicQris ? (
                    /* Dynamic QRIS: polling mode */
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menunggu pembayaran...</span>
                      </div>
                      <p className="text-slate-500 text-xs">Batas waktu: 5 menit</p>
                    </div>
                  ) : (
                    /* Static QRIS: manual confirm button */
                    <button
                      onClick={handleConfirmStaticQris}
                      disabled={isPending}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
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
                /* Pre-process: show static QR preview from settings if available */
                <div className="flex flex-col items-center justify-center py-6">
                  {activeMethod?.qrisImage ? (
                    <img
                      src={activeMethod.qrisImage}
                      alt="QRIS Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-700 rounded-lg flex flex-col items-center justify-center">
                      <QrCode className="w-16 h-16 text-slate-500 mb-2" />
                      <p className="text-slate-400 text-xs text-center px-4">
                        Upload QRIS di Settings
                      </p>
                    </div>
                  )}
                  <p className="text-slate-300 mt-4 text-sm">
                    Scan untuk membayar
                  </p>
                  <p className="text-white font-bold text-2xl mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  {activeMethod?.qrisNote && (
                    <p className="text-slate-400 text-xs mt-2 text-center">
                      {activeMethod.qrisNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab !== "CASH" && activeTab !== "QRIS" && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <p className="text-slate-300 text-sm">Total Pembayaran</p>
                <p className="text-white font-bold text-3xl mt-2">
                  {formatCurrency(order.totalAmount)}
                </p>
                <p className="text-slate-400 text-sm mt-4">
                  Metode: {activeMethod?.name}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Action Button — hide when dynamic QRIS is polling or static QRIS confirm is shown */}
          {!(activeTab === "QRIS" && qrUrl) && (
            <button
              onClick={handleProcessPayment}
              disabled={
                isPending || (activeTab === "CASH" && !canProcessCash)
              }
              className={`
                w-full mt-6 py-4 rounded-xl font-bold text-base transition-all duration-150 cursor-pointer active:scale-95
                flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  activeTab === "CASH"
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }
              `}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : activeTab === "CASH" ? (
                "PROSES PEMBAYARAN"
              ) : (
                "PROSES PEMBAYARAN"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
