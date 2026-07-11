"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { User, X, Search, ChevronDown } from "lucide-react";
import { searchCustomers, assignCustomerToOrder } from "@/actions/customers";

interface CustomerSelectorProps {
  businessId: string;
  orderId: string;
  currentCustomer?: { id: string; name: string; phone: string | null } | null;
  onCustomerChange: () => void;
}

type CustomerResult = { id: string; name: string; phone: string | null };

export function CustomerSelector({
  businessId,
  orderId,
  currentCustomer,
  onCustomerChange,
}: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const data = await searchCustomers(businessId, q);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [businessId]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, doSearch]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      doSearch("");
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen, doSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (customerId: string | null) => {
    setIsOpen(false);
    await assignCustomerToOrder(orderId, customerId);
    onCustomerChange();
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await assignCustomerToOrder(orderId, null);
    onCustomerChange();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      {currentCustomer ? (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-slate-800 text-xs font-semibold truncate block">
              {currentCustomer.name}
            </span>
            {currentCustomer.phone && (
              <span className="text-slate-500 text-[10px] truncate block">
                {currentCustomer.phone}
              </span>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Hapus pelanggan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="
            w-full flex items-center gap-2 bg-white hover:bg-slate-50
            border border-slate-200 hover:border-slate-300
            rounded-lg px-3 py-2 text-left transition-all duration-150 cursor-pointer shadow-sm
          "
        >
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-slate-500 text-xs font-medium">Pilih Pelanggan</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute left-0 right-0 top-full mt-1.5 z-50
          bg-white border border-slate-200 rounded-xl shadow-xl
          overflow-hidden
        ">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / telepon..."
              className="
                flex-1 bg-transparent text-slate-800 text-xs placeholder-slate-400
                outline-none
              "
            />
            {loading && (
              <div className="w-3 h-3 border border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            )}
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto py-1">
            {/* Tamu option */}
            <button
              onClick={() => handleSelect(null)}
              className="
                w-full flex items-center gap-2 px-3 py-2
                hover:bg-slate-50 text-left transition-colors cursor-pointer
              "
            >
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700 text-xs font-medium">Tamu</span>
            </button>

            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="
                  w-full flex items-center gap-2 px-3 py-2
                  hover:bg-slate-50 text-left transition-colors cursor-pointer
                "
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-800 text-xs font-semibold block truncate">
                    {c.name}
                  </span>
                  {c.phone && (
                    <span className="text-slate-500 text-[10px] font-medium block truncate">{c.phone}</span>
                  )}
                </div>
              </button>
            ))}

            {!loading && results.length === 0 && query.length > 0 && (
              <div className="px-3 py-3 text-slate-500 text-xs text-center">
                Pelanggan tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
