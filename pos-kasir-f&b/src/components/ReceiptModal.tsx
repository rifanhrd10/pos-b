/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, OrderItem } from '../types';
import { formatRupiah } from '../data';
import { CheckCircle2, Printer, RefreshCw, Send, Sparkles } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  activeTable: Table;
  cartItems: OrderItem[];
  orderId: string;
  paymentMethod: 'Cash' | 'QRIS';
  cashEntered?: number;
  changeAmount?: number;
  cashierName: string;
  onNewOrder: () => void;
  customerName?: string;
}

export default function ReceiptModal({
  isOpen,
  activeTable,
  cartItems,
  orderId,
  paymentMethod,
  cashEntered = 0,
  changeAmount = 0,
  cashierName,
  onNewOrder,
  customerName,
}: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printed, setPrinted] = useState<boolean>(false);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const serviceCharge = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax + serviceCharge;

  const currentDateTime = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setPrinted(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 font-sans flex flex-col justify-between"
          id="receipt-modal"
        >
          {/* Main Success Greeting */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center flex flex-col items-center flex-shrink-0">
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white mb-2" />
            </motion.div>
            <h3 className="text-lg font-bold tracking-tight">Pembayaran Sukses!</h3>
            <p className="text-xs text-blue-100 mt-1">
              Transaksi berhasil diproses & disimpan ke history lokal.
            </p>
          </div>

          {/* Thermal Receipt Paper representation */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-inner max-w-sm mx-auto font-mono text-[11px] text-slate-800 space-y-4 relative overflow-hidden">
              {/* Receipt zig-zag aesthetic borders */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              {/* Cafe Header */}
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                  Nusantara Culinary
                </h4>
                <p className="text-[10px] text-slate-400">
                  Kuningan Tower Lt. 12, Jakarta Selatan
                </p>
                <p className="text-[9px] text-slate-400">
                  Telp: 021-88992233
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Transaction Metadata */}
              <div className="space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="text-slate-800 font-semibold">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span className="text-slate-800">{currentDateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipe / Meja:</span>
                  <span className="text-slate-800 font-semibold uppercase">
                    {activeTable.id === 'TAKEAWAY' ? 'Takeaway (Tanpa Meja)' : activeTable.name}
                  </span>
                </div>
                {customerName && (
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="text-slate-800 font-semibold">{customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span className="text-slate-800">{cashierName}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Ordered Items List */}
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="space-y-0.5">
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span className="line-clamp-1">{item.name}</span>
                      <span className="font-semibold">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>{item.quantity} x {formatRupiah(item.price)}</span>
                      {item.notes && <span className="italic text-amber-700">({item.notes})</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Bill totals */}
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (11%):</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service (5%):</span>
                  <span>{formatRupiah(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-950 font-black border-t border-dotted border-slate-300 pt-1.5 text-xs">
                  <span>TOTAL AKHIR:</span>
                  <span className="text-emerald-700">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Payment Details */}
              <div className="space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Tipe Bayar:</span>
                  <span className="text-slate-800 font-bold">{paymentMethod}</span>
                </div>
                {paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Uang Masuk:</span>
                      <span className="text-slate-800">{formatRupiah(cashEntered)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Uang Kembalian:</span>
                      <span>{formatRupiah(changeAmount)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Footer Greet */}
              <div className="text-center text-[10px] text-slate-400 space-y-1">
                <p className="font-semibold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                <p className="text-[9px]">Silakan berkunjung kembali!</p>
              </div>
            </div>
          </div>

          {/* Actions at Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                printed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-700 active:scale-98'
              }`}
              type="button"
              id="print-receipt-btn"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              {isPrinting ? 'Sedang Mencetak Struk...' : printed ? 'Struk Berhasil Dicetak!' : 'Cetak Struk Transaksi'}
            </button>

            <button
              onClick={onNewOrder}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
              type="button"
              id="new-order-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Buat Transaksi Baru
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
