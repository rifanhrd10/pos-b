"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

const EVENTS = [
  { id: 1, date: "2024-07-03", title: "Meeting Tim Marketing", color: "bg-bayaro-blue", time: "09.00" },
  { id: 2, date: "2024-07-05", title: "Review Laporan Bulanan", color: "bg-emerald-500", time: "13.00" },
  { id: 3, date: "2024-07-08", title: "Presentasi Investor", color: "bg-amber-500", time: "10.00" },
  { id: 4, date: "2024-07-10", title: "Workshop UX Design", color: "bg-purple-500", time: "09.00" },
  { id: 5, date: "2024-07-12", title: "Deploy Update v2.3", color: "bg-rose-500", time: "14.00" },
  { id: 6, date: "2024-07-15", title: "Rapat Direksi Q3", color: "bg-bayaro-blue", time: "08.00" },
  { id: 7, date: "2024-07-17", title: "Pelatihan Kasir Baru", color: "bg-emerald-500", time: "11.00" },
  { id: 8, date: "2024-07-20", title: "Review Stok Gudang", color: "bg-amber-500", time: "15.00" },
  { id: 9, date: "2024-07-22", title: "Sprint Planning", color: "bg-purple-500", time: "09.00" },
  { id: 10, date: "2024-07-25", title: "Demo Produk ke Klien", color: "bg-bayaro-blue", time: "13.00" },
  { id: 11, date: "2024-07-28", title: "Evaluasi Kinerja Tim", color: "bg-rose-500", time: "10.00" },
  { id: 12, date: "2024-07-30", title: "Closing Bulan Juli", color: "bg-emerald-500", time: "16.00" },
];

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const BORDER_COLOR_MAP: Record<string, string> = {
  "bg-bayaro-blue": "border-l-[#135FEF]",
  "bg-emerald-500": "border-l-emerald-500",
  "bg-amber-500": "border-l-amber-500",
  "bg-purple-500": "border-l-purple-500",
  "bg-rose-500": "border-l-rose-500",
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getEventsForDate(dateStr: string) {
  return EVENTS.filter((e) => e.date === dateStr);
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday-based to Monday-based offset
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const sortedEvents = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  }

  const totalCells = offset + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Kalender"
        description="Jadwal dan agenda bulanan dalam tampilan kalender interaktif."
        breadcrumb="Pages / Calendar"
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* Calendar Grid */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          {/* Month Navigation */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: rows * 7 }).map((_, idx) => {
              const day = idx - offset + 1;
              const isValid = day >= 1 && day <= daysInMonth;
              const dateStr = isValid ? toDateStr(year, month, day) : "";
              const events = isValid ? getEventsForDate(dateStr) : [];
              // Today is July 15, 2024
              const isToday = year === 2024 && month === 6 && day === 15;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-2 min-h-[80px] ${isValid ? "hover:bg-slate-50 transition cursor-default" : ""}`}
                >
                  {isValid && (
                    <>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-2xl text-sm font-semibold ${
                          isToday
                            ? "bg-bayaro-navy text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {events.map((e) => (
                            <div
                              key={e.id}
                              className={`h-1.5 w-1.5 rounded-full ${e.color} mx-auto`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-base font-bold text-slate-900">Agenda Bulan Ini</h3>
          <div className="space-y-2">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-2xl border border-slate-100 border-l-4 p-3 ${BORDER_COLOR_MAP[event.color] ?? "border-l-slate-300"}`}
              >
                <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDate(event.date)} · {event.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
