"use client";

import { Clock, Search, Building2, UserCircle2, ArrowRight, Package, Trash2, CheckCircle2, CreditCard, AlertCircle, FileX, Info, Calendar, ChevronRight, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type Log = {
  id: string;
  action: string;
  userName: string | null;
  tenantName: string;
  entityType: string | null;
  entityId: string | null;
  details: any;
  createdAt: string;
};

type Business = {
  id: string;
  name: string;
};

export function ActivityLogsPanel({
  initialLogs,
  businesses,
  currentFilter,
}: {
  initialLogs: Log[];
  businesses: Business[];
  currentFilter: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    setIsOpen(false);
    setSearch("");
    startTransition(() => {
      if (val === "ALL") {
        router.push("/itadmin/logs");
      } else {
        router.push(`/itadmin/logs?businessId=${val}`);
      }
    });
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCurrentLabel = () => {
    if (!currentFilter || currentFilter === "ALL") return "Semua Tenant & Global";
    if (currentFilter === "SYSTEM") return "Hanya Internal IT Admin";
    return businesses.find(b => b.id === currentFilter)?.name || "Pilih Tenant...";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sistem Audit Trail
          </h1>
          <p className="text-sm text-slate-500">
            Lacak seluruh aktivitas tenant dan admin dalam satu panel monitoring.
          </p>
        </div>

        <div className="relative w-full sm:w-[320px]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isPending}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 size={16} className="text-slate-400 shrink-0" />
              <span className="truncate text-sm font-semibold text-slate-700">
                {getCurrentLabel()}
              </span>
            </div>
            {isPending ? (
              <Loader2 size={16} className="animate-spin text-slate-400 shrink-0" />
            ) : (
              <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
              <div className="mb-2 flex items-center rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari tenant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {search === "" && (
                  <>
                    <button
                      onClick={() => handleSelect("ALL")}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${(!currentFilter || currentFilter === "ALL") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      Semua Tenant & Global
                      {(!currentFilter || currentFilter === "ALL") && <Check size={14} className="text-blue-600" />}
                    </button>
                    <button
                      onClick={() => handleSelect("SYSTEM")}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${currentFilter === "SYSTEM" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      Hanya Internal IT Admin
                      {currentFilter === "SYSTEM" && <Check size={14} className="text-blue-600" />}
                    </button>
                    
                    {businesses.length > 0 && (
                      <div className="px-3 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Toko Spesifik
                      </div>
                    )}
                  </>
                )}

                {filteredBusinesses.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">
                    Tidak ada tenant yang cocok
                  </div>
                ) : (
                  filteredBusinesses.map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleSelect(b.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${currentFilter === b.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <span className="truncate">{b.name}</span>
                      {currentFilter === b.id && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="space-y-4">
        {initialLogs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Search size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Belum Ada Aktivitas</h3>
            <p className="mt-1 text-sm text-slate-500">Rekam jejak sistem masih kosong untuk filter ini.</p>
          </div>
        ) : (
          initialLogs.map((log) => {
            // Mapping Icons and Colors based on action type
            let Icon = Info;
            let color = "bg-slate-100 text-slate-600 border-slate-200";
            let label = log.action;

            if (log.action.includes("VOID") || log.action.includes("DELETE") || log.action.includes("REJECT")) {
              Icon = log.action.includes("PRODUCT") ? Trash2 : (log.action.includes("ORDER") ? FileX : AlertCircle);
              color = "bg-red-50 text-red-600 border-red-100";
              label = log.action === "VOID_ORDER" ? "Pesanan Dibatalkan" : 
                      log.action === "DELETE_PRODUCT" ? "Produk Dihapus" :
                      log.action === "DELETE_EMPLOYEE" ? "Karyawan Dihapus" :
                      log.action === "REJECT_PAYMENT" ? "Pembayaran Ditolak" : log.action;
            } else if (log.action.includes("APPROVE") || log.action.includes("SUCCESS")) {
              Icon = CheckCircle2;
              color = "bg-emerald-50 text-emerald-600 border-emerald-100";
              label = log.action === "APPROVE_PAYMENT" ? "Pembayaran Disetujui" : log.action;
            } else if (log.action.includes("STOCK")) {
              Icon = Package;
              color = "bg-amber-50 text-amber-600 border-amber-100";
              label = log.action === "ADJUST_STOCK" ? "Stok Diubah" : log.action;
            } else if (log.action.includes("PAYMENT") || log.action.includes("RENEWAL")) {
              Icon = CreditCard;
              color = "bg-blue-50 text-blue-600 border-blue-100";
              label = log.action === "REQUEST_RENEWAL" ? "Mengajukan Perpanjangan" : log.action;
            } else if (log.action.includes("EMPLOYEE") && log.action.includes("TOGGLE")) {
              Icon = UserCircle2;
              color = "bg-violet-50 text-violet-600 border-violet-100";
              label = "Status Karyawan Diubah";
            } else {
              label = log.action.replace(/_/g, ' ');
            }

            return (
              <div 
                key={log.id} 
                className="group relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Icon Box */}
                <div className={`hidden sm:flex shrink-0 h-14 w-14 items-center justify-center rounded-2xl border ${color}`}>
                  <Icon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex sm:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 truncate">
                          {label}
                        </h4>
                        {log.entityType && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                            <span>{log.entityType}</span>
                            {log.entityId && (
                              <>
                                <ArrowRight size={12} />
                                <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{log.entityId}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp for desktop */}
                    <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <Clock size={14} />
                      {format(new Date(log.createdAt), "dd MMM yyyyy, HH:mm", { locale: localeId })}
                    </div>
                  </div>

                  {/* Metadata payload */}
                  {log.details && (
                    <div className="mt-3 mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        {Object.entries(log.details).map(([key, value]) => {
                          if (key === "authorizedBy") return null; // Skip redundant raw IDs
                          const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          return (
                            <div key={key} className="flex flex-col">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{displayKey}</span>
                              <span className="text-sm font-medium text-slate-700 break-words">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Accordion */}
                  <div className="mb-4">
                    <details className="group">
                      <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors">
                        <Code2 size={14} className="text-slate-400" />
                        Lihat Data JSON Mentah
                        <ChevronRight size={14} className="text-slate-400 transition-transform group-open:rotate-90 ml-0.5" />
                      </summary>
                      <div className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 shadow-inner">
                        <pre className="text-[11px] leading-relaxed text-emerald-400 font-mono whitespace-pre-wrap break-all">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 group/tooltip relative">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserCircle2 size={14} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{log.userName || "System"}</span>
                      </div>
                      
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>

                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{log.tenantName}</span>
                      </div>
                    </div>

                    {/* Timestamp for mobile */}
                    <div className="sm:hidden flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock size={12} />
                      {format(new Date(log.createdAt), "dd MMM yyyyy, HH:mm", { locale: localeId })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
