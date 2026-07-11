"use client";
import { useState, useEffect } from "react";
import { Delete, Check } from "lucide-react";

interface PinPadProps {
  onSubmit: (pin: string) => void | Promise<void>;
  error?: string;
  loading?: boolean;
}

export function PinPad({ onSubmit, error, loading }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (error) {
      setShaking(true);
      setPin("");
      const t = setTimeout(() => setShaking(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleKey = (key: string) => {
    if (loading) return;
    if (key === "backspace") {
      setPin((p) => p.slice(0, -1));
    } else if (key === "submit") {
      if (pin.length > 0) onSubmit(pin);
    } else if (pin.length < 4) {
      setPin((p) => p + key);
    }
  };

  const keys = ["1","2","3","4","5","6","7","8","9","backspace","0","submit"];

  return (
    <div className={`flex flex-col items-center gap-8 ${shaking ? "animate-shake" : ""}`}>
      {/* PIN dots */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              i < pin.length
                ? "bg-blue-500 scale-110"
                : "border-2 border-slate-600"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            disabled={loading}
            className="w-16 h-16 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all duration-150 flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {key === "backspace" ? (
              <Delete className="w-5 h-5 text-slate-300" />
            ) : key === "submit" ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <span className="text-2xl font-bold text-slate-50">{key}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
