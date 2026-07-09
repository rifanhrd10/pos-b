"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupOperations } from "@/actions/onboarding";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";

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
  const { operations, setOperations } = useOnboardingStore();
  
  const [openTime, setOpenTime] = useState(operations.openTime || "08:00");
  const [closeTime, setCloseTime] = useState(operations.closeTime || "22:00");
  const [hasShift, setHasShift] = useState<boolean | null>(null);
  const [shifts, setShifts] = useState<ShiftForm[]>(DEFAULT_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load from store on mount
  useEffect(() => {
    if (operations.openTime) setOpenTime(operations.openTime);
    if (operations.closeTime) setCloseTime(operations.closeTime);
  }, []);

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
    
    // Save to store
    setOperations({
      openTime,
      closeTime,
      taxRate: 0,
      serviceRate: 0,
      currency: 'IDR',
    });

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-10 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] bg-[#eff4ff] text-[#004ac6] font-display-lg font-bold text-[28px] border border-[#c2d3ff]">04</div>
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[32px] text-on-surface tracking-tight font-bold">Pengaturan Operasional</h1>
            <p className="text-primary font-label-md uppercase tracking-[0.1em] mt-1">Langkah Keempat: Waktu</p>
          </div>
        </div>
        <p className="font-body-md text-[15px] text-on-surface-variant max-w-4xl leading-relaxed mt-6">
          Atur jam buka dan sistem shift karyawan bisnis Anda. <span className="text-primary font-medium">Ini penting untuk pembukuan harian.</span>
        </p>
        <div className="mt-8 h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary w-4/5 transition-all duration-700 ease-out "></div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 md:p-8 relative z-10 space-y-10">
        
        {/* Jam Operasional */}
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20 mb-6">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Jam Operasional</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Jam Buka <span className="text-error">*</span></label>
              <div className="relative">
                <input
                  required
                  type="time"
                  className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Jam Tutup <span className="text-error">*</span></label>
              <div className="relative">
                <input
                  required
                  type="time"
                  className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mt-3">
            Jam operasional berlaku untuk semua outlet. Dapat diubah per-outlet melalui Pengaturan.
          </p>
        </div>

        {/* Shift Question */}
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20 mb-6">
            <span className="material-symbols-outlined text-primary">group</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Sistem Shift Karyawan</h2>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mb-4">
            Apakah bisnis Anda menggunakan sistem shift? Ini akan memengaruhi tutup kas dan laporan karyawan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setHasShift(false)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-6 text-center transition-all focus:outline-none",
                hasShift === false
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/30 hover:border-primary hover:bg-primary/5"
              )}
            >
              <p className="font-headline-sm text-headline-sm text-on-surface">Tidak</p>
              <p className="font-body-md text-sm text-on-surface-variant mt-0.5">Tutup kas 1x/hari</p>
            </button>
            <button
              type="button"
              onClick={() => setHasShift(true)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-6 text-center transition-all focus:outline-none",
                hasShift === true
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/30 hover:border-primary hover:bg-primary/5"
              )}
            >
              <p className="font-headline-sm text-headline-sm text-on-surface">Ya</p>
              <p className="font-body-md text-sm text-on-surface-variant mt-0.5">Tutup kas per shift</p>
            </button>
          </div>
        </div>

        {/* Shift Setup */}
        {hasShift === true && (
          <div className="space-y-6">
            <p className="font-body-md text-sm text-on-surface-variant">
              Definisikan shift-shift Anda. Dapat ditambah atau diubah kapan saja.
            </p>
            {shifts.map((shift, index) => (
              <div key={index} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">event_available</span>
                    Shift {index + 1}
                  </span>
                  {shifts.length > 1 && (
                    <button type="button" onClick={() => removeShift(index)} className="text-outline hover:text-error transition-colors flex items-center gap-1 font-label-sm text-sm">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Hapus
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">Nama Shift <span className="text-error">*</span></label>
                    <input
                      required
                      className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50"
                      placeholder="Contoh: Shift Pagi"
                      value={shift.name}
                      onChange={(e) => updateShift(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-2">Jam Mulai <span className="text-error">*</span></label>
                      <input
                        required
                        type="time"
                        className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest"
                        value={shift.startTime}
                        onChange={(e) => updateShift(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-2">Jam Selesai <span className="text-error">*</span></label>
                      <input
                        required
                        type="time"
                        className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest"
                        value={shift.endTime}
                        onChange={(e) => updateShift(index, "endTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addShift}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/40 p-4 text-sm font-label-md text-on-surface-variant hover:border-primary hover:text-primary bg-surface-container-lowest hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tambah Shift
            </button>
          </div>
        )}

        {hasShift === false && (
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 font-body-md text-sm text-on-surface-variant leading-relaxed flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">info</span>
            <p>
              Tutup kas akan dilakukan 1x per hari saat toko tutup pukul <strong className="text-on-surface">{closeTime}</strong>.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 mt-4 text-sm text-error bg-error-container rounded-lg">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        )}

        <div className="pt-6 border-t border-outline-variant/20 flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
          <button 
            className="w-full md:w-auto px-6 py-3 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2" 
            type="button" 
            onClick={() => router.push("/onboarding/outlet")}
            disabled={loading}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali
          </button>
          <button 
            className="w-full md:w-auto px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
            type="button" 
            onClick={handleSubmit}
            disabled={loading || hasShift === null}
          >
            {loading ? "Menyimpan..." : "Lanjut ke Selesai"}
            {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
