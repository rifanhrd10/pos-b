"use client";

import { useState, useEffect } from "react";
import { Clock, RefreshCw, Wifi, WifiOff, LogOut, ChevronDown, User, Store } from "lucide-react";

interface KasirNavbarProps {
  kasirName: string;
  outletName: string;
  sessionOpenedAt: Date;
  activeTab: "pos" | "history";
  onTabChange: (tab: "pos" | "history") => void;
  onCloseShift: () => void;
}

export function KasirNavbar({
  kasirName,
  outletName,
  sessionOpenedAt,
  activeTab,
  onTabChange,
  onCloseShift,
}: KasirNavbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Elapsed shift time
  const elapsed = currentTime.getTime() - new Date(sessionOpenedAt).getTime();
  const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const elapsedStr = `${String(elapsedHours).padStart(2, "0")}:${String(elapsedMinutes).padStart(2, "0")}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-40 relative shadow-sm">
      {/* Left: Brand + Nav Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-100">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-wider text-slate-800 uppercase leading-none">
              {outletName}
            </h1>
            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest font-mono">
              POS Kasir
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Nav Tabs */}
        <nav className="flex gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange("pos")}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "pos"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            type="button"
          >
            Dashboard Kasir
          </button>
          <button
            onClick={() => onTabChange("history")}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            type="button"
          >
            Riwayat Transaksi
          </button>
        </nav>
      </div>

      {/* Right: Clock, Online, Profile */}
      <div className="flex items-center gap-5">
        {/* Realtime clock */}
        <div className="text-right flex flex-col justify-center border-r border-slate-200 pr-5 h-8">
          <div className="text-xs font-extrabold text-slate-800 font-mono flex items-center gap-1.5 justify-end">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {formattedTime}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">{formattedDate}</div>
        </div>

        {/* Online/Offline */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            isOnline
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-500" /> Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-500" /> Offline
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 px-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                {kasirName}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[9px] text-slate-400 font-semibold">Kasir</div>
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-150 p-4 z-50 space-y-4">
                <div className="flex gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{kasirName}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Kasir
                    </span>
                  </div>
                </div>

                {/* Shift info */}
                <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Shift Sedang Berjalan
                  </div>
                  <div className="text-xs font-medium text-slate-700 flex justify-between">
                    <span>Durasi:</span>
                    <span className="font-semibold font-mono text-slate-800">{elapsedStr}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 flex justify-between">
                    <span>Buka Sejak:</span>
                    <span className="font-semibold font-mono text-slate-800">
                      {new Date(sessionOpenedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Close shift */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onCloseShift();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5" /> Close Shift & Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
