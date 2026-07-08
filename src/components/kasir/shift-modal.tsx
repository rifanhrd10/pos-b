"use client";

import { useState, useTransition } from "react";
import { X, DollarSign } from "lucide-react";
import { openSession, closeSession, type ShiftSummary } from "@/actions/kasir";

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
  const [error, setError] = useState<string | null>(null);

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

  const handleCloseShift = () => {
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

  const quickAmounts = [0, 100000, 200000, 500000];

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
              disabled={isPending}
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
                  value={initialCash === 0 ? "" : formatCurrency(initialCash).replace(/[^\d]/g, "")}
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
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setInitialCash(amount)}
                  className="
                    px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300
                    rounded-lg text-xs font-medium transition-all duration-150
                    cursor-pointer active:scale-95
                  "
                  disabled={isPending}
                >
                  {amount === 0 ? "Rp 0" : `Rp ${(amount / 1000).toFixed(0)}k`}
                </button>
              ))}
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
        ) : (
          <>
            {/* Close mode */}
            {summary && (
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Transaksi</span>
                  <span className="text-slate-50 font-medium">{summary.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Omset</span>
                  <span className="text-slate-50 font-medium">{formatCurrency(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cash</span>
                  <span className="text-slate-50 font-medium">{formatCurrency(summary.cashRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">QRIS</span>
                  <span className="text-slate-50 font-medium">{formatCurrency(summary.qrisRevenue)}</span>
                </div>
                <div className="h-px bg-slate-700 my-3" />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-3">
                Kas Akhir (aktual)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={closingCash === 0 ? "" : formatCurrency(closingCash).replace(/[^\d]/g, "")}
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
                  disabled={isPending}
                />
              </div>
              <div className="mt-3 text-slate-300 text-sm font-medium">
                {formatCurrency(closingCash)}
              </div>
            </div>

            <button
              onClick={handleCloseShift}
              disabled={isPending}
              className="
                w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold
                rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? "Menutup..." : "Tutup Shift"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
