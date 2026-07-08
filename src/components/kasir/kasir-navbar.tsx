"use client";

import { BarChart2, LogOut, Clock, Store, User } from "lucide-react";
import { useEffect, useState } from "react";

interface KasirNavbarProps {
  kasirName: string;
  outletName: string;
  sessionOpenedAt: Date;
  onLaporan: () => void;
  onCloseShift: () => void;
  activeTab: "pos" | "laporan";
}

export function KasirNavbar({
  kasirName,
  outletName,
  sessionOpenedAt,
  onLaporan,
  onCloseShift,
  activeTab,
}: KasirNavbarProps) {
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diff = now.getTime() - new Date(sessionOpenedAt).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTime(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [sessionOpenedAt]);

  return (
    <nav className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-50">
          <Store className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">{outletName}</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <User className="w-4 h-4" />
          <span>{kasirName}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Clock className="w-4 h-4" />
          <span>Buka: {elapsedTime}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLaporan}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
            cursor-pointer hover:bg-slate-700 active:scale-95
            ${activeTab === "laporan" ? "bg-slate-700 text-slate-50" : "border border-slate-600 text-slate-300"}
          `}
        >
          <BarChart2 className="w-4 h-4 inline-block mr-2" />
          Laporan
        </button>
        <button
          onClick={onCloseShift}
          className="
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
            bg-red-600 text-white hover:bg-red-500 cursor-pointer active:scale-95
          "
        >
          <LogOut className="w-4 h-4 inline-block mr-2" />
          Tutup Shift
        </button>
      </div>
    </nav>
  );
}
