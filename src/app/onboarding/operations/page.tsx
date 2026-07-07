"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupOperations } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";

type ShiftForm = {
  name: string;
  startTime: string;
  endTime: string;
};

const DEFAULT_SHIFTS: ShiftForm[] = [
  { name: "Shift Pagi", startTime: "08:00", endTime: "15:00" },
  { name: "Shift Sore", startTime: "15:00", endTime: "22:00" },
];

const emptyShift = (): ShiftForm => ({ name: "", startTime: "08:00", endTime: "17:00" });

export default function OperationsPage() {
  const router = useRouter();
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [hasShift, setHasShift] = useState<boolean | null>(null);
  const [shifts, setShifts] = useState<ShiftForm[]>(DEFAULT_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateShift(index: number, field: keyof ShiftForm, value: string) {
    setShifts((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addShift() {
    setShifts((prev) => [...prev, emptyShift()]);
  }

  function removeShift(index: number) {
    if (shifts.length <= 1) return;
    setShifts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (hasShift === null) {
      setError("Pilih apakah bisnis Anda menggunakan shift karyawan");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("openTime", openTime);
    formData.append("closeTime", closeTime);
    formData.append("hasShift", hasShift ? "true" : "false");

    if (hasShift) {
      shifts.forEach((shift, i) => {
        formData.append(`shifts[${i}][name]`, shift.name);
        formData.append(`shifts[${i}][startTime]`, shift.startTime);
        formData.append(`shifts[${i}][endTime]`, shift.endTime);
      });
    }

    const result = await setupOperations(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/complete");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Pengaturan Operasional</h1>
        <p className="text-slate-500">Atur jam buka dan sistem shift karyawan bisnis Anda.</p>
      </div>

      {/* Jam Operasional */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-500" />
          Jam Operasional
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam Buka</label>
            <Input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Jam Tutup</label>
            <Input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Jam operasional berlaku untuk semua outlet. Dapat diubah per-outlet melalui Pengaturan.
        </p>
      </div>

      {/* Shift Question */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-800">Sistem Shift Karyawan</h2>
        <p className="text-sm text-slate-500">
          Apakah bisnis Anda menggunakan sistem shift? Ini akan memengaruhi tutup kas dan laporan karyawan.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHasShift(false)}
            className={`rounded-2xl border-2 p-4 text-center transition-all ${
              hasShift === false
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">Tidak</p>
            <p className="text-xs text-slate-500 mt-0.5">Tutup kas 1x/hari</p>
          </button>
          <button
            type="button"
            onClick={() => setHasShift(true)}
            className={`rounded-2xl border-2 p-4 text-center transition-all ${
              hasShift === true
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">Ya</p>
            <p className="text-xs text-slate-500 mt-0.5">Tutup kas per shift</p>
          </button>
        </div>
      </div>

      {/* Shift Setup */}
      {hasShift === true && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Definisikan shift-shift Anda. Dapat ditambah atau diubah kapan saja.
          </p>
          {shifts.map((shift, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Shift {index + 1}</span>
                {shifts.length > 1 && (
                  <button type="button" onClick={() => removeShift(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Shift</label>
                <Input
                  placeholder="Contoh: Shift Pagi"
                  value={shift.name}
                  onChange={(e) => updateShift(index, "name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Jam Mulai</label>
                  <Input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => updateShift(index, "startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Jam Selesai</label>
                  <Input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => updateShift(index, "endTime", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addShift}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-3 text-sm font-medium text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Shift
          </button>
        </div>
      )}

      {hasShift === false && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-cyan-500 inline mr-2" />
          Tutup kas akan dilakukan 1x per hari saat toko tutup pukul <strong>{closeTime}</strong>.
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/onboarding/outlet")} disabled={loading}>
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || hasShift === null}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600"
        >
          {loading ? "Menyimpan..." : "Lanjut"}
        </Button>
      </div>
    </div>
  );
}
