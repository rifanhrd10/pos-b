/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CASHIERS } from '../data';
import { Cashier } from '../types';
import { Lock, Delete, ArrowRight, UserCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (cashier: Cashier) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedCashier, setSelectedCashier] = useState<Cashier>(CASHIERS[0]);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setError('');
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === selectedCashier.pin) {
      onLoginSuccess(selectedCashier);
    } else {
      setError('PIN salah! Silakan coba lagi.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]"
        id="login-card"
      >
        {/* Left Side: Branding and Cashier Selector */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                <UserCheck className="w-6 h-6 text-white" />
              </span>
              <h1 className="text-xl font-bold tracking-tight">KASIR F&B POS</h1>
            </div>
            <p className="text-sm text-blue-50/80">
              Sistem kasir restoran modern & cepat dioptimalkan untuk tablet view.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              PILIH AKUN KASIR:
            </h3>
            <div className="space-y-2">
              {CASHIERS.map((cashier) => {
                const isSelected = selectedCashier.id === cashier.id;
                return (
                  <button
                    key={cashier.id}
                    onClick={() => {
                      setSelectedCashier(cashier);
                      setPin('');
                      setError('');
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-white text-indigo-950 shadow-md scale-102 font-medium'
                        : 'bg-blue-700/30 text-white hover:bg-blue-700/50'
                    }`}
                    type="button"
                    id={`cashier-select-${cashier.id}`}
                  >
                    <img
                      src={cashier.avatar}
                      alt={cashier.name}
                      className="w-10 h-10 rounded-full border border-white/20 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-semibold">{cashier.name}</div>
                      <div
                        className={`text-xs ${
                          isSelected ? 'text-blue-600' : 'text-blue-100'
                        }`}
                      >
                        {cashier.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-blue-100/60 font-medium">
            Versi 1.4.0 (Tablet Mode) • Powered by AI Studio
          </div>
        </div>

        {/* Right Side: Keypad Entry */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-white">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
            <p className="text-sm text-slate-500 mt-1">
              Silakan masukkan PIN 4 digit untuk kasir <span className="font-semibold text-slate-700">{selectedCashier.name}</span>
            </p>
          </div>

          <div className="my-6">
            {/* PIN Display */}
            <div className="flex flex-col items-center">
              <div className="flex justify-center gap-4 mb-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      pin.length > index
                        ? 'bg-blue-600 scale-125 shadow-sm shadow-blue-200'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {error ? (
                <p className="text-xs text-rose-500 font-medium animate-pulse">{error}</p>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> PIN Pengaman Aktif
                </p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mt-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xl font-semibold transition-colors border border-slate-100 flex items-center justify-center cursor-pointer"
                  type="button"
                  id={`pin-btn-${num}`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm font-medium transition-colors border border-slate-100 flex items-center justify-center cursor-pointer"
                type="button"
                id="pin-btn-clear"
              >
                C
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xl font-semibold transition-colors border border-slate-100 flex items-center justify-center cursor-pointer"
                type="button"
                id="pin-btn-0"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-slate-100 flex items-center justify-center cursor-pointer"
                type="button"
                id="pin-btn-del"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleLoginSubmit()}
              disabled={pin.length < 4}
              className={`w-full max-w-[280px] py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all ${
                pin.length === 4
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              type="button"
              id="login-submit-btn"
            >
              Masuk Aplikasi <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
