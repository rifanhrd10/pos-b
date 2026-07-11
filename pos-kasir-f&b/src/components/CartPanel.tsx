/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Table, OrderItem } from '../types';
import { formatRupiah } from '../data';
import { ShoppingCart, Plus, Minus, Trash2, Edit3, Send, DollarSign, TableOfContents } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartPanelProps {
  activeTable: Table | null;
  cartItems: OrderItem[];
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onUpdateNotes: (menuItemId: string, notes: string) => void;
  onSaveAsDraft: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
  customerName?: string;
  onUpdateCustomerName?: (name: string) => void;
}

export default function CartPanel({
  activeTable,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onSaveAsDraft,
  onCheckout,
  onClearCart,
  customerName,
  onUpdateCustomerName,
}: CartPanelProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11); // 11% PPN
  const serviceCharge = Math.round(subtotal * 0.05); // 5% Service Charge
  const total = subtotal + tax + serviceCharge;

  const handleEditNoteClick = (item: OrderItem) => {
    setEditingNoteId(item.menuItemId);
    setTempNote(item.notes || '');
  };

  const handleSaveNote = (menuItemId: string) => {
    onUpdateNotes(menuItemId, tempNote);
    setEditingNoteId(null);
  };

  return (
    <div className="w-full h-full bg-white border-l border-slate-200 shadow-xl flex flex-col justify-between overflow-hidden font-sans" id="cart-panel">
      {/* Header Cart */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Pesanan Aktif</h2>
          {activeTable ? (
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
              {activeTable.id === 'TAKEAWAY' ? 'Takeaway (Tanpa Meja)' : `Meja: ${activeTable.name} • Dine In`}
            </p>
          ) : (
            <p className="text-xs text-slate-400">Pilih meja di sebelah kiri</p>
          )}
        </div>

        {activeTable && cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            type="button"
            id="clear-cart-btn"
            title="Kosongkan Keranjang"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {activeTable && (
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/60 flex flex-col gap-1 flex-shrink-0">
          <label htmlFor="customer-name-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nama Pelanggan
          </label>
          <input
            type="text"
            id="customer-name-input"
            value={customerName || ''}
            onChange={(e) => onUpdateCustomerName?.(e.target.value)}
            placeholder="Masukkan nama pelanggan..."
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
          />
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
        {!activeTable ? (
          // Case 1: No Table Selected
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <TableOfContents className="w-8 h-8 text-slate-300 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Meja Belum Dipilih</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
              Silakan pilih salah satu meja pada denah di samping kiri untuk mengelola pesanan.
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          // Case 2: Cart is Empty for selected Table
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-emerald-500/80 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{activeTable.name} Kosong</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
              Pilih menu makanan, minuman, atau dessert di katalog sebelah kiri untuk ditambahkan ke keranjang.
            </p>
            {activeTable.status === 'Terisi' && (
              <span className="mt-3 inline-block px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full uppercase border border-rose-100">
                Layanan Sedang Berlangsung
              </span>
            )}
          </div>
        ) : (
          // Case 3: Cart Items
          <div className="space-y-3.5" id="cart-items-list">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col gap-2 relative group"
                  id={`cart-item-row-${item.menuItemId}`}
                >
                  {/* Name and Basic Price */}
                  <div className="flex justify-between items-start">
                    <div className="pr-4">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatRupiah(item.price)} / pcs
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                        className="w-5.5 h-5.5 rounded-md hover:bg-white active:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                        type="button"
                        id={`btn-qty-minus-${item.menuItemId}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-800 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                        className="w-5.5 h-5.5 rounded-md hover:bg-white active:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                        type="button"
                        id={`btn-qty-plus-${item.menuItemId}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                    <div className="flex-1 mr-2">
                      {editingNoteId === item.menuItemId ? (
                        <div className="flex gap-1.5 items-center w-full">
                          <input
                            type="text"
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Contoh: ekstra pedas..."
                            className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] w-full outline-none focus:border-blue-500"
                            autoFocus
                            id={`notes-input-${item.menuItemId}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item.menuItemId)}
                            className="bg-blue-600 hover:bg-blue-750 text-white px-2 py-1 rounded font-semibold cursor-pointer text-[9px]"
                            id={`notes-save-${item.menuItemId}`}
                          >
                            Simpan
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          {item.notes ? (
                            <span className="text-amber-700 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              Catatan: {item.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400">Tidak ada catatan</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditNoteClick(item)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Edit Catatan"
                            id={`notes-edit-btn-${item.menuItemId}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Absolute delete button */}
                  <button
                    onClick={() => onRemoveItem(item.menuItemId)}
                    className="absolute -top-1 -right-1 p-1 bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-500 border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    type="button"
                    title="Hapus"
                    id={`cart-item-delete-${item.menuItemId}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Cart Summary & CTA Buttons */}
      {activeTable && (
        <div className="bg-white border-t border-slate-200 p-4 space-y-3.5 flex-shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
          {/* Prices Breakdown */}
          {cartItems.length > 0 && (
            <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-mono text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Pajak Restoran PPN (11%)</span>
                <span className="font-mono">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Service Charge (5%)</span>
                <span className="font-mono">{formatRupiah(serviceCharge)}</span>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Total Pembayaran</span>
            <span className="text-2xl font-black text-blue-600 font-mono">
              {formatRupiah(cartItems.length > 0 ? total : 0)}
            </span>
          </div>

          {/* Double Buttons Actions */}
          <div className="flex gap-2.5 pt-1">
            {/* Draft Order / Hold */}
            <button
              onClick={onSaveAsDraft}
              disabled={cartItems.length === 0}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                cartItems.length > 0
                  ? 'bg-slate-50 border-slate-250 text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-98'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              type="button"
              id="cart-save-draft-btn"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" /> Kirim Dapur / Simpan
            </button>

            {/* Pay Button */}
            <button
              onClick={onCheckout}
              disabled={cartItems.length === 0}
              className={`flex-1 py-3 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-xl ${
                cartItems.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              type="button"
              id="cart-checkout-btn"
            >
              <DollarSign className="w-3.5 h-3.5" /> Bayar Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
