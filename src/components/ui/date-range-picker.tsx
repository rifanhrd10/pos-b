"use client";

import * as React from "react";
import "litepicker/dist/css/litepicker.css";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onFromChange?: (date: string) => void;
  onToChange?: (date: string) => void;
  onRangeChange?: (from: string, to: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromName?: string;
  toName?: string;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(from?: string, to?: string) {
  if (from && to) return `${from} - ${to}`;
  if (from) return from;
  return "";
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  onRangeChange,
  placeholder = "Tanggal Mulai - Tanggal Selesai",
  disabled = false,
  className = "",
  fromName,
  toName,
}: DateRangePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pickerRef = React.useRef<{ destroy: () => void } | null>(null);
  const [displayValue, setDisplayValue] = React.useState(formatDisplay(from, to));

  React.useEffect(() => {
    setDisplayValue(formatDisplay(from, to));
  }, [from, to]);

  React.useEffect(() => {
    if (!inputRef.current || disabled) return;
    let disposed = false;

    async function initPicker() {
      const module = await import("litepicker");
      if (disposed || !inputRef.current) return;
      const Litepicker = module.default;

      pickerRef.current?.destroy();
      pickerRef.current = new Litepicker({
        element: inputRef.current,
        singleMode: false,
        numberOfMonths: 2,
        numberOfColumns: 2,
        format: "YYYY-MM-DD",
        lang: "id-ID",
        autoApply: true,
        startDate: from || undefined,
        endDate: to || undefined,
        setup: (picker: any) => {
          picker.on("selected", (startDate: any, endDate: any) => {
            const start = toDateInputValue(startDate.dateInstance);
            const end = toDateInputValue(endDate.dateInstance);
            setDisplayValue(formatDisplay(start, end));
            onRangeChange?.(start, end);
            onFromChange?.(start);
            onToChange?.(end);
          });
        },
      });
    }

    void initPicker();

    return () => {
      disposed = true;
      pickerRef.current?.destroy();
      pickerRef.current = null;
    };
  }, [disabled, from, onFromChange, onRangeChange, onToChange, to]);

  return (
    <div className="relative">
      {fromName && <input type="hidden" name={fromName} value={from || ""} />}
      {toName && <input type="hidden" name={toName} value={to || ""} />}
      <input
        ref={inputRef}
        value={displayValue}
        onChange={(event) => setDisplayValue(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`flex h-10 w-full min-w-[240px] items-center rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
