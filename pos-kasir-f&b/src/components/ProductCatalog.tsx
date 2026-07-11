/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem, Table } from '../types';
import { INITIAL_MENU, formatRupiah } from '../data';
import { Search, ChevronLeft, Layers, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCatalogProps {
  activeTable: Table;
  onAddToCart: (item: MenuItem) => void;
  onBackToTables: () => void;
}

export default function ProductCatalog({
  activeTable,
  onAddToCart,
  onBackToTables,
}: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Makanan' | 'Minuman' | 'Cemilan' | 'Dessert'>('Semua');

  // Filter products
  const filteredProducts = INITIAL_MENU.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Dessert'] as const;

  return (
    <div className="space-y-4 h-full flex flex-col font-sans">
      {/* Top action row */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <button
          onClick={onBackToTables}
          className="p-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold text-xs"
          title="Kembali ke Denah Meja"
          id="btn-back-to-tables"
        >
          <ChevronLeft className="w-4 h-4" /> Denah Meja
        </button>

        {/* Separator line */}
        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Active Table Status Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Melayani: <span className="text-emerald-600 font-extrabold font-mono">{activeTable.name}</span>
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari menu makanan atau minuman..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl transition-all outline-none"
            id="search-menu-input"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0 custom-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-250'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            type="button"
            id={`category-btn-${category}`}
          >
            {category === 'Semua' && <Layers className="w-3.5 h-3.5" />}
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
        <div className="grid grid-cols-3 gap-3.5" id="product-grid">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddToCart(product)}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-56"
              id={`product-card-${product.id}`}
            >
              {/* Product Image */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Product Content */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    {formatRupiah(product.price)}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 mt-2">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">Menu "{searchTerm}" tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
