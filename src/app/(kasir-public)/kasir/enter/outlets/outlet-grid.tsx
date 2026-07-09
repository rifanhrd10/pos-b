"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicOutlet } from "@/actions/kasir-public";

interface OutletGridProps {
  outlets: PublicOutlet[];
}

export function OutletGrid({ outlets }: OutletGridProps) {
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
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
          search
        </span>
        <input
          type="text"
          placeholder="Cari outlet atau bisnis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Tidak ada outlet yang cocok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() =>
                router.push(`/kasir/enter/pin?outletId=${outlet.id}`)
              }
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all duration-150 active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-50 text-lg leading-tight truncate group-hover:text-blue-400 transition-colors">
                    {outlet.name}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 truncate">
                    {outlet.businessName}
                  </p>
                  {(outlet.city || outlet.address) && (
                    <p className="text-slate-500 text-xs mt-2 truncate flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      {outlet.city ?? outlet.address}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-600 group-hover:text-blue-400 transition-colors text-2xl flex-shrink-0 mt-0.5">
                  arrow_forward_ios
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
