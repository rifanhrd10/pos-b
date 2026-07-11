/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, OrderItem } from '../types';
import { formatRupiah } from '../data';
import { Wallet, Smartphone, Landmark, CheckCircle, ArrowLeft, Coins, QrCode } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  activeTable: Table;
  cartItems: OrderItem[];
  onCancel: () => void;
  onPaymentSuccess: (method: 'Cash' | 'QRIS', enteredAmount?: number, changeAmount?: number) => void;
  customerName?: string;
}

export default function PaymentModal({
  isOpen,
  activeTable,
  cartItems,
  onCancel,
  onPaymentSuccess,
  customerName,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [cashEntered, setCashEntered] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [qrisSimulated, setQrisSimulated] = useState<boolean>(false);
  const [qrisScanning, setQrisScanning] = useState<boolean>(false);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const serviceCharge = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax + serviceCharge;

  useEffect(() => {
    if (paymentMethod === 'Cash') {
      const entered = parseFloat(cashEntered) || 0;
      setChangeAmount(entered - grandTotal);
    }
  }, [cashEntered, grandTotal, paymentMethod]);

  if (!isOpen) return null;

  // Handle number pad inputs
  const handleNumPress = (val: string) => {
    setCashEntered((prev) => {
      // Avoid duplicate leading zeros
      if (prev === '' && val === '0') return prev;
      return prev + val;
    });
  };

  const handleNumDelete = () => {
    setCashEntered((prev) => prev.slice(0, -1));
  };

  const handleNumClear = () => {
    setCashEntered('');
  };

  const handleShortcutCash = (amount: number) => {
    setCashEntered(amount.toString());
  };

  const handleExactAmount = () => {
    setCashEntered(grandTotal.toString());
  };

  const handleSubmitPayment = () => {
    if (paymentMethod === 'Cash') {
      const entered = parseFloat(cashEntered) || 0;
      if (entered < grandTotal) return;
      onPaymentSuccess('Cash', entered, changeAmount);
    } else {
      onPaymentSuccess('QRIS');
    }
  };

  const handleSimulateQRISScan = () => {
    setQrisScanning(true);
    setTimeout(() => {
      setQrisScanning(false);
      setQrisSimulated(true);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 font-sans grid grid-cols-1 md:grid-cols-12 h-[550px]"
          id="payment-modal"
        >
          {/* Left Column: Transaction Summary (md:col-span-5) */}
          <div className="md:col-span-4 bg-slate-50 p-6 border-r border-slate-150 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  id="payment-back-btn"
                >
                  <ArrowLeft className="w-4 h-4" /> Batal & Kembali
                </button>
                <h3 className="text-lg font-bold text-slate-800 mt-2">Ringkasan Tagihan</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase font-mono tracking-wider">
                  {activeTable.id === 'TAKEAWAY' ? 'Takeaway (Tanpa Meja)' : `Meja: ${activeTable.name}`}
                </p>
                {customerName && (
                  <p className="text-xs text-blue-600 font-bold mt-1.5 bg-blue-50/50 border border-blue-100 rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                    <span className="text-slate-400 font-normal">Pelanggan:</span>
                    <span>{customerName}</span>
                  </p>
                )}
              </div>

              {/* Items Scroller inside summary */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-xs py-1 border-b border-slate-200/50">
                    <span className="text-slate-600 line-clamp-1 flex-1 pr-2">
                      {item.name} <strong className="text-slate-800">x{item.quantity}</strong>
                    </span>
                    <span className="font-mono text-slate-700 font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (11%)</span>
                  <span className="font-mono">{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service (5%)</span>
                  <span className="font-mono">{formatRupiah(serviceCharge)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl">
                <span className="text-xs font-bold text-blue-800">Total Tagihan</span>
                <span className="text-lg font-black text-blue-600 font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Keyboard & Options (md:col-span-8) */}
          <div className="md:col-span-8 p-6 flex flex-col justify-between bg-white">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all cursor-pointer ${
                  paymentMethod === 'Cash'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                    : 'border-slate-100 bg-slate-50 hover:border-blue-200 text-slate-500'
                }`}
                id="pay-method-cash-btn"
              >
                <Wallet className={`w-6 h-6 mb-1 ${paymentMethod === 'Cash' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-[11px] tracking-wide">TUNAI / CASH</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                    : 'border-slate-100 bg-slate-50 hover:border-blue-200 text-slate-500'
                }`}
                id="pay-method-qris-btn"
              >
                <Smartphone className={`w-6 h-6 mb-1 ${paymentMethod === 'QRIS' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-[11px] tracking-wide">QRIS / SCAN</span>
              </button>
            </div>

            {paymentMethod === 'Cash' ? (
              // CASH PANEL
              <div className="grid grid-cols-12 gap-5 my-3 flex-1 items-center">
                {/* Inputs & Shortcuts (Left 5 cols) */}
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
                        value={cashEntered ? parseInt(cashEntered).toLocaleString('id-ID') : '0'}
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 text-xl font-black text-slate-900 pl-12 pr-4 py-3 rounded-xl outline-none select-none text-right font-mono focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
                        id="payment-cash-display"
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
                          ? 'bg-blue-50 border-blue-100 text-blue-600'
                          : 'bg-rose-50/50 border-rose-100 text-rose-800'
                      }`}
                    >
                      <Coins className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-black font-mono text-right flex-1">
                        {changeAmount >= 0 ? formatRupiah(changeAmount) : `Kurang ${formatRupiah(Math.abs(changeAmount))}`}
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
                        className="py-2 px-2.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer transition-all text-center truncate"
                        id="shortcut-exact-cash"
                      >
                        Uang Pas
                      </button>
                      {[50000, 100000, 150000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleShortcutCash(amt)}
                          className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-all text-center"
                          id={`shortcut-pay-${amt}`}
                        >
                          {formatRupiah(amt)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keypad Pad (Right 6 cols) */}
                <div className="col-span-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumPress(num)}
                        className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                        type="button"
                        id={`paypad-btn-${num}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={handleNumClear}
                      className="h-11 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                      type="button"
                      id="paypad-btn-c"
                    >
                      CLEAR
                    </button>
                    <button
                      onClick={() => handleNumPress('0')}
                      className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                      type="button"
                      id="paypad-btn-0"
                    >
                      0
                    </button>
                    <button
                      onClick={handleNumDelete}
                      className="h-11 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold transition-colors border border-slate-200/70 rounded-lg flex items-center justify-center cursor-pointer"
                      type="button"
                      id="paypad-btn-del"
                    >
                      DEL
                    </button>
                  </div>
                  {/* Extra triple zero */}
                  <button
                    onClick={() => handleNumPress('000')}
                    className="w-full h-9 mt-2 bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center"
                    type="button"
                    id="paypad-btn-000"
                  >
                    +000 (Ribu)
                  </button>
                </div>
              </div>
            ) : (
              // QRIS PANEL
              <div className="my-3 flex-1 flex items-center justify-center gap-8">
                {/* QR Code Layout */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-center shadow-inner relative">
                    <QrCode className="w-36 h-36 text-slate-800" />
                    {qrisSimulated && (
                      <div className="absolute inset-0 bg-emerald-500/90 rounded-xl flex flex-col items-center justify-center text-white p-3">
                        <CheckCircle className="w-10 h-10 mb-1" />
                        <span className="text-[11px] font-bold text-center">SCAN BERHASIL</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 mt-2 font-mono uppercase tracking-wider">
                    QRIS ID: RESTO-POS-7948
                  </span>
                </div>

                {/* Instructions & Simulation */}
                <div className="max-w-[280px] space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-600" /> Scan QRIS Pelanggan
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Tunjukkan kode QR kepada pelanggan untuk di-scan dengan e-wallet (Gopay, OVO, Dana, ShopeePay) atau M-Banking.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSimulateQRISScan}
                      disabled={qrisScanning || qrisSimulated}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                        qrisSimulated
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : qrisScanning
                          ? 'bg-slate-50 text-slate-400 border-slate-200 animate-pulse'
                          : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 cursor-pointer active:scale-98'
                      }`}
                      type="button"
                      id="simulate-qris-scan-btn"
                    >
                      {qrisSimulated ? (
                        <>Telah Scan Berhasil</>
                      ) : qrisScanning ? (
                        <>Memverifikasi Pembayaran...</>
                      ) : (
                        <>Simulasikan Scan Berhasil</>
                      )}
                    </button>
                    <p className="text-[9px] text-slate-400 leading-normal text-center italic">
                      Lakukan simulasi di atas untuk memverifikasi QRIS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex gap-3.5 border-t border-slate-100 pt-4 flex-shrink-0">
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                type="button"
                id="btn-payment-cancel"
              >
                Kembali
              </button>

              <button
                onClick={handleSubmitPayment}
                disabled={
                  paymentMethod === 'Cash'
                    ? (parseFloat(cashEntered) || 0) < grandTotal
                    : !qrisSimulated
                }
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xl ${
                  (paymentMethod === 'Cash' && (parseFloat(cashEntered) || 0) >= grandTotal) ||
                  (paymentMethod === 'QRIS' && qrisSimulated)
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                }`}
                type="button"
                id="btn-payment-complete"
              >
                Konfirmasi Pembayaran Lunas
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
