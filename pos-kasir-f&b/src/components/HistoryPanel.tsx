/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../data';
import { Search, FileText, Ban, Calendar, DollarSign, Wallet, Smartphone, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryPanelProps {
  transactions: Transaction[];
}

export default function HistoryPanel({ transactions }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<'Semua' | 'Cash' | 'QRIS'>('Semua');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.customerName && tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = methodFilter === 'Semua' || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  // Calculate day totals
  const totalIncome = filteredTransactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalCashIncome = filteredTransactions
    .filter((tx) => tx.paymentMethod === 'Cash')
    .reduce((acc, tx) => acc + tx.total, 0);
  const totalQrisIncome = filteredTransactions
    .filter((tx) => tx.paymentMethod === 'QRIS')
    .reduce((acc, tx) => acc + tx.total, 0);

  return (
    <div className="space-y-4 h-full flex flex-col font-sans">
      {/* Top statistics section */}
      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Pendapatan Hari Ini
            </span>
            <p className="text-xl font-extrabold text-slate-800 font-mono">
              {formatRupiah(totalIncome)}
            </p>
            <span className="text-[10px] text-slate-400 block font-medium">
              Dari {filteredTransactions.length} transaksi
            </span>
          </div>
          <span className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Pendapatan Tunai (Cash)
            </span>
            <p className="text-xl font-extrabold text-slate-800 font-mono">
              {formatRupiah(totalCashIncome)}
            </p>
            <span className="text-[10px] text-slate-400 block font-medium">
              Uang kas laci fisik
            </span>
          </div>
          <span className="p-3 bg-blue-50 rounded-xl text-blue-500">
            <Wallet className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Pendapatan Non-Tunai (QRIS)
            </span>
            <p className="text-xl font-extrabold text-slate-800 font-mono">
              {formatRupiah(totalQrisIncome)}
            </p>
            <span className="text-[10px] text-slate-400 block font-medium">
              Masuk rekening bank
            </span>
          </div>
          <span className="p-3 bg-purple-50 rounded-xl text-purple-500">
            <Smartphone className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Filter and Search actions */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex-shrink-0 gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID transaksi atau nama meja..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl transition-all outline-none"
            id="search-history-input"
          />
        </div>

        {/* Method filter */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['Semua', 'Cash', 'QRIS'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                methodFilter === method
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              type="button"
              id={`filter-history-${method}`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Main transactions history table */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse" id="history-transactions-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">ID Transaksi</th>
                  <th className="py-3 px-3">Meja</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-4">Menu Items</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-4 text-right">Total Transaksi</th>
                  <th className="py-3 px-4">Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-3 uppercase">
                      <div className="font-semibold text-slate-800">
                        {tx.tableId === 'TAKEAWAY' ? 'Takeaway' : tx.tableName}
                      </div>
                      {tx.customerName && (
                        <div className="text-[10px] text-indigo-600 font-bold capitalize mt-0.5">
                          {tx.customerName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-500">
                      {new Date(tx.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[220px] truncate" title={tx.items.map((it) => `${it.name} x${it.quantity}`).join(', ')}>
                      {tx.items.map((it) => `${it.name} x${it.quantity}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.paymentMethod === 'Cash'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}
                      >
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {tx.cashierName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Ban className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-medium">Tidak ada transaksi yang cocok.</p>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Riwayat Sesi Kerja Kasir Aktif</span>
          </div>
          <span>Daftar tersimpan dalam local storage</span>
        </div>
      </div>
    </div>
  );
}
