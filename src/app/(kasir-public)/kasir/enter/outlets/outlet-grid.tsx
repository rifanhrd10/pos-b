"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronRight } from "lucide-react";
import type { PublicOutlet } from "@/actions/kasir-public";

interface OutletGridProps {
  outlets: PublicOutlet[];
  businessId?: string;
}

export function OutletGrid({ outlets, businessId }: OutletGridProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = outlets.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (o.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari outlet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 font-medium">Tidak ada outlet yang cocok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() =>
                router.push(`/kasir/enter/pin?outletId=${outlet.id}`)
              }
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-6 text-left transition-all duration-150 active:scale-[0.98] group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {outlet.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 truncate">
                    {outlet.businessName}
                  </p>
                  {(outlet.city || outlet.address) && (
                    <p className="text-slate-400 text-xs mt-2 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {outlet.city ?? outlet.address}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
