"use client";

import { useState, useTransition } from "react";
import { X, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { openSession, closeSession, previewShiftClose, type ShiftSummary } from "@/actions/kasir";

interface ShiftModalProps {
  mode: "open" | "close";
  employeeId: string;
  outletId: string;
  businessId: string;
  sessionId?: string;
  summary?: ShiftSummary;
  onSuccess: (sessionId?: string) => void;
  onCancel?: () => void;
}

interface ReconciliationPreview {
  initialCash: number;
  cashSales: number;
  expectedCash: number;
}

export function ShiftModal({
  mode,
  employeeId,
  outletId,
  businessId,
  sessionId,
  summary,
  onSuccess,
  onCancel,
}: ShiftModalProps) {
  const [initialCash, setInitialCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReconciliationPreview | null>(null);
  const [showReconciliation, setShowReconciliation] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleOpenShift = () => {
    setError(null);
    startTransition(async () => {
      const result = await openSession({
        employeeId,
        outletId,
        businessId,
        initialCash,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.session) {
        onSuccess((result.session as { id: string }).id);
      }
    });
  };

  const handlePreviewClose = () => {
    if (!sessionId) return;
    setError(null);
    startPreviewTransition(async () => {
      const result = await previewShiftClose(sessionId);
      if (!result.ok) {
        setError(result.error || "Gagal memuat preview");
        return;
      }
      setPreview({
        initialCash: result.initialCash ?? 0,
        cashSales: result.cashSales ?? 0,
        expectedCash: result.expectedCash ?? 0,
      });
      setShowReconciliation(true);
    });
  };

  const handleConfirmClose = () => {
    if (!sessionId) return;
    setError(null);
    startTransition(async () => {
      const result = await closeSession(sessionId, { closingCash });
      if (!result.ok) {
        setError(result.error || "Gagal menutup shift");
      } else {
        onSuccess();
      }
    });
  };

  const handleBackToInput = () => {
    setShowReconciliation(false);
    setPreview(null);
  };

  const quickAmounts = [0, 100000, 200000, 500000];

  const difference = preview ? closingCash - preview.expectedCash : 0;
  const isPositive = difference >= 0;
  const isZero = difference === 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-50">
            {mode === "open" ? "Buka Shift" : "Tutup Shift"}
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-50 transition-colors"
              disabled={isPending || isLoadingPreview}
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {mode === "open" ? (
          <>
            {/* Open mode */}
            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-3">
                Modal Awal Kas
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={initialCash === 0 ? "" : initialCash.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setInitialCash(val ? parseInt(val, 10) : 0);
                  }}
                  placeholder="0"
                  className="
                    w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600
                    rounded-xl text-slate-50 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                  disabled={isPending}
                />
              </div>
              <div className="mt-3 text-slate-300 text-sm font-medium">
                {formatCurrency(initialCash)}
              </div>
              <div className="mt-3 flex gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setInitialCash(amount)}
                    disabled={isPending}
                    className="
                      flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300
                      text-xs rounded-lg transition-colors cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {amount === 0 ? "Rp 0" : `${amount / 1000}rb`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenShift}
              disabled={isPending}
              className="
                w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold
                rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? "Membuka..." : "Buka Shift"}
            </button>
          </>
        ) : showReconciliation && preview ? (
          <>
            {/* Reconciliation summary */}
            <div className="mb-6 rounded-xl border border-slate-600 overflow-hidden">
              <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-600">
                <h3 className="text-slate-200 font-semibold text-sm">Ringkasan Shift</h3>
              </div>
              <div className="divide-y divide-slate-700">
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-400 text-sm">Kas Awal</span>
                  <span className="text-slate-200 text-sm font-medium">
                    {formatCurrency(preview.initialCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-400 text-sm">Penjualan Cash</span>
                  <span className="text-slate-200 text-sm font-medium">
                    {formatCurrency(preview.cashSales)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-slate-700/30">
                  <span className="text-slate-300 text-sm font-semibold">Expected di Laci</span>
                  <span className="text-slate-50 text-sm font-bold">
                    {formatCurrency(preview.expectedCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-400 text-sm">Kas Aktual (input)</span>
                  <span className="text-slate-200 text-sm font-medium">
                    {formatCurrency(closingCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-slate-700/30">
                  <span className="text-slate-300 text-sm font-semibold">Selisih</span>
                  <div className="flex items-center gap-2">
                    {isZero ? (
                      <Minus className="w-4 h-4 text-slate-400" />
                    ) : isPositive ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          isZero
                            ? "text-slate-300"
                            : isPositive
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isPositive && !isZero ? "+" : ""}
                        {formatCurrency(difference)}
                      </div>
                      <div
                        className={`text-xs ${
                          isZero
                            ? "text-slate-500"
                            : isPositive
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {isZero ? "seimbang" : isPositive ? "surplus" : "deficit"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBackToInput}
                disabled={isPending}
                className="
                  flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold
                  rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClose}
                disabled={isPending}
                className="
                  flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold
                  rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isPending ? "Menutup..." : "Konfirmasi Tutup Shift"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Close mode — cash input */}
            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-3">
                Kas Aktual di Laci
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={closingCash === 0 ? "" : closingCash.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setClosingCash(val ? parseInt(val, 10) : 0);
                  }}
                  placeholder="0"
                  className="
                    w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600
                    rounded-xl text-slate-50 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                  disabled={isPending || isLoadingPreview}
                />
              </div>
              <div className="mt-3 text-slate-300 text-sm font-medium">
                {formatCurrency(closingCash)}
              </div>
            </div>

            <button
              onClick={handlePreviewClose}
              disabled={isPending || isLoadingPreview}
              className="
                w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold
                rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoadingPreview ? "Memuat..." : "Tutup Shift"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
