/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shift, Cashier } from '../types';
import { formatRupiah } from '../data';
import { ShieldCheck, Info, Sparkles, DollarSign, LogOut } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  type: 'open' | 'close';
  cashier: Cashier;
  currentShift: Shift | null;
  onOpenShift: (initialCash: number) => void;
  onCloseShift: (closingCash: number) => void;
  onCancelClose?: () => void;
}

export default function ShiftModal({
  isOpen,
  type,
  cashier,
  currentShift,
  onOpenShift,
  onCloseShift,
  onCancelClose,
}: ShiftModalProps) {
  const [cashInput, setCashInput] = useState<string>('200000'); // default Rp 200,000 for open shift
  const [closingCashInput, setClosingCashInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'open') {
      const amount = parseFloat(cashInput);
      if (isNaN(amount) || amount < 0) {
        setError('Saldo awal tidak valid.');
        return;
      }
      onOpenShift(amount);
    } else {
      const amount = parseFloat(closingCashInput);
      if (isNaN(amount) || amount < 0) {
        setError('Saldo akhir tidak valid. Harap masukkan nominal yang valid.');
        return;
      }
      onCloseShift(amount);
    }
  };

  const handleShortcutAmount = (amount: number) => {
    if (type === 'open') {
      setCashInput(amount.toString());
    } else {
      setClosingCashInput(amount.toString());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 font-sans"
          id="shift-modal"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-950 p-6 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </span>
                <h3 className="text-lg font-bold tracking-tight">
                  {type === 'open' ? 'Sesi Shift Baru (Open Shift)' : 'Tutup Sesi Kasir (Close Shift)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kasir Aktif: <span className="text-white font-medium">{cashier.name}</span> ({cashier.role})
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400 font-bold">
              SYSTEM LOCK
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {type === 'open' ? (
              // OPEN SHIFT INTERFACE
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-semibold">Buka Laci Uang (Drawer Balance)</p>
                    <p className="mt-0.5 text-blue-700/90">
                      Silakan masukkan modal laci awal Anda sebelum memulai shift hari ini untuk memudahkan kalkulasi kembalian pelanggan.
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
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xl font-bold text-slate-800 pl-11 pr-4 py-3 rounded-xl transition-all outline-none"
                      autoFocus
                      required
                      id="open-shift-cash-input"
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
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          parseInt(cashInput) === amount
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                        id={`shortcut-${amount}`}
                      >
                        {formatRupiah(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // CLOSE SHIFT INTERFACE
              <div className="space-y-4">
                {currentShift && (
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Waktu Mulai Shift</span>
                      <span className="font-medium text-slate-700">
                        {new Date(currentShift.startTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Saldo Awal Modal</span>
                      <span className="font-semibold text-slate-800">
                        {formatRupiah(currentShift.initialCash)}
                      </span>
                    </div>
                    <div className="space-y-2 border-t border-slate-200/60 pt-2">
                      <span className="text-xs text-slate-400 block">Total Transaksi</span>
                      <span className="font-semibold text-slate-800">
                        {currentShift.transactionsCount} Transaksi
                      </span>
                    </div>
                    <div className="space-y-2 border-t border-slate-200/60 pt-2">
                      <span className="text-xs text-slate-400 block">Omset Shift Terhitung</span>
                      <span className="font-bold text-blue-600">
                        {formatRupiah(currentShift.totalTransactionsAmount)}
                      </span>
                    </div>

                    <div className="col-span-2 border-t border-slate-200 pt-2.5 mt-1 flex justify-between items-center bg-slate-100/50 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Ekspektasi Kas Akhir Laci
                      </span>
                      <span className="text-base font-extrabold text-slate-800 font-mono">
                        {formatRupiah(currentShift.initialCash + currentShift.totalTransactionsAmount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      MASUKKAN UANG FISIK DI LACI (IDR)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Hitung uang fisik Anda</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={closingCashInput}
                      onChange={(e) => setClosingCashInput(e.target.value)}
                      placeholder="Masukkan total uang fisik di laci"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 text-xl font-bold text-slate-800 pl-11 pr-4 py-3 rounded-xl transition-all outline-none"
                      autoFocus
                      required
                      id="close-shift-cash-input"
                    />
                  </div>
                </div>

                {currentShift && closingCashInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-3 rounded-xl border text-xs flex gap-2 ${
                      parseFloat(closingCashInput) ===
                      currentShift.initialCash + currentShift.totalTransactionsAmount
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : Math.abs(
                            parseFloat(closingCashInput) -
                              (currentShift.initialCash + currentShift.totalTransactionsAmount)
                          ) < 50000
                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}
                  >
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Selisih Kas Laci Fisik & Sistem:</p>
                      <p className="mt-0.5 font-mono">
                        {formatRupiah(
                          parseFloat(closingCashInput) -
                            (currentShift.initialCash + currentShift.totalTransactionsAmount)
                        )}
                        {parseFloat(closingCashInput) ===
                        currentShift.initialCash + currentShift.totalTransactionsAmount
                          ? ' (Sempurna / Balance)'
                          : parseFloat(closingCashInput) >
                            currentShift.initialCash + currentShift.totalTransactionsAmount
                          ? ' (Surplus Laci)'
                          : ' (Defisit / Kurang)'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              {type === 'close' && onCancelClose && (
                <button
                  type="button"
                  onClick={onCancelClose}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors cursor-pointer text-center"
                  id="close-shift-cancel-btn"
                >
                  Kembali
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'open'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100'
                }`}
                id="shift-modal-submit-btn"
              >
                {type === 'open' ? (
                  <>Mulai Bekerja (Open Shift)</>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" /> Tutup Shift & Logout
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
