/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cashier, Shift } from '../types';
import { Clock, RefreshCw, Wifi, WifiOff, LogOut, ChevronDown, User, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cashier: Cashier;
  currentShift: Shift | null;
  activeTab: 'pos' | 'history';
  onTabChange: (tab: 'pos' | 'history') => void;
  onLogoutClick: () => void;
  onSync: () => Promise<void>;
}

export default function Navbar({
  cashier,
  currentShift,
  activeTab,
  onTabChange,
  onLogoutClick,
  onSync,
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncClick = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncSuccess(false);

    // Call sync simulation promise
    await onSync();

    setSyncing(false);
    setSyncSuccess(true);

    // clear status success after 3 seconds
    setTimeout(() => {
      setSyncSuccess(false);
    }, 3000);
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between font-sans flex-shrink-0 z-40 relative shadow-sm">
      {/* Left side: Brand + Nav views */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-100">
            N
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-800 uppercase leading-none">
              Nusantara POS
            </h1>
            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest font-mono">
              F&B Tablet
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Nav Tabs */}
        {currentShift && (
          <nav className="flex gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onTabChange('pos')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
              id="nav-tab-pos"
            >
              Dashboard Kasir
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
              id="nav-tab-history"
            >
              Riwayat Transaksi
            </button>
          </nav>
        )}
      </div>

      {/* Right side: Sync, Clock, Cashier profile drop */}
      <div className="flex items-center gap-5">
        {/* Realtime clock */}
        <div className="text-right flex flex-col justify-center border-r border-slate-200 pr-5 h-8">
          <div className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5 justify-end">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {formattedTime}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {formattedDate}
          </div>
        </div>

        {/* Sync to Cloud Indicator & Trigger */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              isOnline
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
            id="network-status-badge"
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

          {/* Sync Button */}
          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              syncSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold text-xs px-3'
                : syncing
                ? 'bg-slate-50 border-slate-200 text-slate-400 text-xs px-3'
                : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-600 hover:text-slate-800'
            }`}
            title="Sinkronisasi ke Cloud"
            type="button"
            id="sync-to-cloud-btn"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncing ? 'animate-spin text-slate-400' : syncSuccess ? 'text-emerald-500' : 'text-slate-500'}`}
            />
            {syncing && <span className="text-[10px] font-bold">Sinkronisasi...</span>}
            {syncSuccess && <span className="text-[10px] font-bold">Tersinkronisasi!</span>}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 px-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            type="button"
            id="navbar-profile-dropdown"
          >
            <img
              src={cashier.avatar}
              alt={cashier.name}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                {cashier.name}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[9px] text-slate-400 font-semibold">{cashier.role}</div>
            </div>
          </button>

          {/* Dropdown Box */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Overlay closer */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-150 p-4 z-50 space-y-4"
                  id="profile-dropdown-content"
                >
                  <div className="flex gap-3 pb-3 border-b border-slate-100">
                    <img
                      src={cashier.avatar}
                      alt={cashier.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cashier.name}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {cashier.role}
                      </span>
                    </div>
                  </div>

                  {/* Shift details */}
                  {currentShift ? (
                    <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Shift Sedang Berjalan
                      </div>
                      <div className="text-xs font-medium text-slate-700 flex justify-between">
                        <span>Laci Awal:</span>
                        <span className="font-semibold font-mono text-slate-800">
                          Rp {currentShift.initialCash.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 flex justify-between">
                        <span>Buka Sejak:</span>
                        <span className="font-semibold font-mono text-slate-800">
                          {new Date(currentShift.startTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex gap-2 text-rose-700 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Belum ada sesi shift dibuka.</span>
                    </div>
                  )}

                  {/* Close shift button */}
                  {currentShift && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogoutClick();
                      }}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      type="button"
                      id="dropdown-close-shift-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Close Shift & Logout
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
