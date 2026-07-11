"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, DollarSign, LogOut, Info, Sparkles } from "lucide-react";
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

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
  const [initialCash, setInitialCash] = useState(200000);
  const [closingCash, setClosingCash] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReconciliationPreview | null>(null);
  const [showReconciliation, setShowReconciliation] = useState(false);

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

  const handleShortcutAmount = (amount: number) => {
    if (mode === "open") {
      setInitialCash(amount);
    } else {
      setClosingCash(amount);
    }
  };

  const difference = preview ? closingCash - preview.expectedCash : 0;
  const isPositive = difference >= 0;
  const isZero = difference === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-950 p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </span>
              <h3 className="text-lg font-bold tracking-tight">
                {mode === "open" ? "Sesi Shift Baru (Open Shift)" : "Tutup Sesi Kasir (Close Shift)"}
              </h3>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400 font-bold">
            SYSTEM
          </span>
        </div>

        <div className="p-6 space-y-5">
          {mode === "open" ? (
            /* ═══ OPEN SHIFT ═══ */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-relaxed">
                  <p className="font-semibold">Buka Laci Uang (Drawer Balance)</p>
                  <p className="mt-0.5 text-blue-700/90">
                    Silakan masukkan modal laci awal Anda sebelum memulai shift hari ini.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  MODAL SALDO AWAL (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={initialCash || ""}
                    onChange={(e) => setInitialCash(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xl font-bold text-slate-800 pl-11 pr-4 py-3 rounded-xl transition-all outline-none"
                    autoFocus
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 block font-medium">Rekomendasi Nominal:</span>
                <div className="flex flex-wrap gap-2">
                  {[100000, 150000, 200000, 300000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleShortcutAmount(amount)}
                      disabled={isPending}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        initialCash === amount
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : showReconciliation && preview ? (
            /* ═══ RECONCILIATION ═══ */
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-slate-700 font-semibold text-sm">Ringkasan Shift</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-slate-500 text-sm">Kas Awal</span>
                    <span className="text-slate-800 text-sm font-medium font-mono">
                      {formatCurrency(preview.initialCash)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-slate-500 text-sm">Penjualan Cash</span>
                    <span className="text-slate-800 text-sm font-medium font-mono">
                      {formatCurrency(preview.cashSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
                    <span className="text-slate-700 text-sm font-semibold">Expected di Laci</span>
                    <span className="text-slate-900 text-sm font-bold font-mono">
                      {formatCurrency(preview.expectedCash)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-slate-500 text-sm">Kas Aktual (input)</span>
                    <span className="text-slate-800 text-sm font-medium font-mono">
                      {formatCurrency(closingCash)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
                    <span className="text-slate-700 text-sm font-semibold">Selisih</span>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono ${
                          isZero ? "text-slate-600" : isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive && !isZero ? "+" : ""}
                        {formatCurrency(difference)}
                      </div>
                      <div
                        className={`text-xs ${
                          isZero ? "text-slate-400" : isPositive ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isZero ? "Seimbang" : isPositive ? "Surplus" : "Defisit"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═══ CLOSE SHIFT — INPUT ═══ */
            <div className="space-y-4">
              {summary && (
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block">Total Transaksi</span>
                    <span className="font-semibold text-slate-800">{summary.totalOrders} Transaksi</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block">Omset Shift</span>
                    <span className="font-bold text-blue-600 font-mono">{formatCurrency(summary.totalRevenue)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  MASUKKAN UANG FISIK DI LACI (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={closingCash || ""}
                    onChange={(e) => setClosingCash(parseInt(e.target.value) || 0)}
                    placeholder="Masukkan total uang fisik di laci"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 text-xl font-bold text-slate-800 pl-11 pr-4 py-3 rounded-xl transition-all outline-none"
                    autoFocus
                    disabled={isPending || isLoadingPreview}
                  />
                </div>
                <div className="mt-2 text-slate-500 text-sm font-medium font-mono">
                  {formatCurrency(closingCash)}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            {mode === "open" ? (
              <button
                type="button"
                onClick={handleOpenShift}
                disabled={isPending}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {isPending ? "Membuka..." : "Mulai Bekerja (Open Shift)"}
              </button>
            ) : showReconciliation ? (
              <>
                <button
                  type="button"
                  onClick={handleBackToInput}
                  disabled={isPending}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  disabled={isPending}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" /> {isPending ? "Menutup..." : "Tutup Shift & Logout"}
                </button>
              </>
            ) : (
              <>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isPending || isLoadingPreview}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePreviewClose}
                  disabled={isPending || isLoadingPreview}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" /> {isLoadingPreview ? "Memuat..." : "Tutup Shift"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
