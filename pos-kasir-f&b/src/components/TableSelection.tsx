/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Table } from '../types';
import { motion } from 'motion/react';
import { Coffee, Grid, CheckCircle2, AlertCircle, Ban, ShoppingBag } from 'lucide-react';

interface TableSelectionProps {
  tables: Table[];
  activeTableId: string | null;
  onSelectTable: (table: Table) => void;
  ordersCountByTable: Record<string, number>;
}

export default function TableSelection({
  tables,
  activeTableId,
  onSelectTable,
  ordersCountByTable,
}: TableSelectionProps) {
  const [filter, setFilter] = useState<'Semua' | 'Tersedia' | 'Terisi' | 'Menunggu Pembayaran'>('Semua');

  const filteredTables = tables.filter((t) => {
    if (filter === 'Semua') return true;
    return t.status === filter;
  });

  // Calculate stats
  const totalTables = tables.length;
  const availableCount = tables.filter((t) => t.status === 'Tersedia').length;
  const occupiedCount = tables.filter((t) => t.status === 'Terisi').length;
  const waitingCount = tables.filter((t) => t.status === 'Menunggu Pembayaran').length;

  return (
    <div className="space-y-5 h-full flex flex-col font-sans">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-800">Denah Layout Meja</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pilih meja aktif untuk melayani pesanan pelanggan.</p>
        </div>
        <div className="flex gap-2">
          {/* Quick Stats Grid */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-500 font-medium">Semua: <strong className="text-slate-800">{totalTables}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 font-medium">Tersedia: <strong className="text-emerald-900">{availableCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-rose-700 font-medium">Terisi: <strong className="text-rose-900">{occupiedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-700 font-medium">Menunggu: <strong className="text-amber-900">{waitingCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Takeaway Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['Semua', 'Tersedia', 'Terisi', 'Menunggu Pembayaran'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-150'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              type="button"
              id={`filter-table-${tab.replace(' ', '-')}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelectTable({ id: 'TAKEAWAY', name: 'Takeaway (Tanpa Meja)', status: 'Tersedia' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-150 cursor-pointer active:scale-95"
          type="button"
          id="takeaway-order-btn"
        >
          <ShoppingBag className="w-4 h-4" /> Pesanan Baru (Takeaway / Tanpa Meja)
        </button>
      </div>

      {/* Table Denah Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
        <div className="grid grid-cols-4 gap-4" id="table-grid-view">
          {filteredTables.map((table) => {
            const isActive = activeTableId === table.id;
            const itemsCount = ordersCountByTable[table.id] || 0;

            let statusColorClass = '';
            let statusBadge = null;

            switch (table.status) {
              case 'Tersedia':
                statusColorClass = isActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                  : 'border-emerald-200 bg-white hover:bg-emerald-50/30 text-slate-800 hover:border-emerald-300';
                statusBadge = (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Tersedia
                  </span>
                );
                break;
              case 'Terisi':
                statusColorClass = isActive
                  ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                  : 'border-rose-200 bg-white hover:bg-rose-50/20 text-slate-800 hover:border-rose-300';
                statusBadge = (
                  <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Coffee className="w-3 h-3" /> Terisi ({itemsCount} item)
                  </span>
                );
                break;
              case 'Menunggu Pembayaran':
                statusColorClass = isActive
                  ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                  : 'border-amber-200 bg-white hover:bg-amber-50/20 text-slate-800 hover:border-amber-300';
                statusBadge = (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Menunggu Pembayaran
                  </span>
                );
                break;
            }

            return (
              <motion.button
                key={table.id}
                whileActive={{ scale: 0.98 }}
                onClick={() => onSelectTable(table)}
                className={`h-32 rounded-2xl border flex flex-col justify-between p-4.5 transition-all text-left shadow-sm cursor-pointer ${statusColorClass}`}
                type="button"
                id={`table-card-${table.id}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-lg font-black tracking-tight">{table.name}</span>
                  {isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-4 ring-slate-100 animate-pulse"></span>
                  )}
                </div>

                <div className="space-y-1.5 w-full">
                  {statusBadge}
                  {table.status === 'Terisi' && itemsCount > 0 && (
                    <p className="text-[10px] font-mono text-slate-500">
                      Aktif memesan...
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 mt-2">
            <Ban className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">Tidak ada meja dengan status "{filter}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
