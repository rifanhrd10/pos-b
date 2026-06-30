"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emitToast } from "@/components/ui/toast-provider";
import { formatDate, rupiah } from "@/lib/utils";

type UserOption = { id: string; name: string; role: string; isActive: boolean };
type ShiftItem = {
  id: string;
  userName: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  cashDifference: number | null;
  status: "OPEN" | "CLOSED";
};

export function ShiftManager({
  users,
  shifts,
  outletId,
}: {
  users: UserOption[];
  shifts: ShiftItem[];
  outletId: string;
}) {
  const [open, setOpen] = useState(false);
  const [closeShiftId, setCloseShiftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openShift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      userId: String(formData.get("userId") || ""),
      outletId,
      openingCash: Number(formData.get("openingCash") || 0),
      note: String(formData.get("note") || ""),
    };

    startTransition(async () => {
      const response = await fetch("/api/shifts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal membuka shift.");
        emitToast({ tone: "error", title: "Shift gagal dibuka", description: result.message });
        return;
      }
      emitToast({ tone: "success", title: "Shift berhasil dibuka" });
      window.location.reload();
    });
  }

  function closeShift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!closeShiftId) return;
    const formData = new FormData(event.currentTarget);
    const payload = {
      closingCash: Number(formData.get("closingCash") || 0),
      note: String(formData.get("note") || ""),
    };

    startTransition(async () => {
      const response = await fetch(`/api/shifts/${closeShiftId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menutup shift.");
        emitToast({ tone: "error", title: "Shift gagal ditutup", description: result.message });
        return;
      }
      emitToast({ tone: "success", title: "Shift berhasil ditutup" });
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>Buka Shift</Button>
      </div>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        {shifts.map((shift) => (
          <div key={shift.id} className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.1fr_1fr_1fr_1fr_0.9fr] md:items-center">
            <div>
              <p className="font-semibold text-slate-900">{shift.userName}</p>
              <p className="mt-1 text-sm text-slate-500">Buka: {formatDate(shift.openedAt)}</p>
              {shift.closedAt ? <p className="text-sm text-slate-500">Tutup: {formatDate(shift.closedAt)}</p> : null}
            </div>
            <div className="text-sm text-slate-700">{rupiah(shift.openingCash)}</div>
            <div className="text-sm text-slate-700">{shift.expectedCash !== null ? rupiah(shift.expectedCash) : "-"}</div>
            <div className="text-sm text-slate-700">{shift.cashDifference !== null ? rupiah(shift.cashDifference) : "-"}</div>
            <div className="flex items-center gap-3">
              <Badge tone={shift.status === "OPEN" ? "success" : "default"}>{shift.status}</Badge>
              {shift.status === "OPEN" ? <Button variant="secondary" onClick={() => setCloseShiftId(shift.id)}>Tutup Shift</Button> : null}
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Buka Shift</h2>
              <form className="mt-6 space-y-4" onSubmit={openShift}>
                <select name="userId" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" defaultValue="">
                  <option value="" disabled>Pilih kasir</option>
                  {users.filter((user) => user.isActive).map((user) => <option key={user.id} value={user.id}>{user.name} • {user.role}</option>)}
                </select>
                <Input name="openingCash" type="number" placeholder="Modal awal" required />
                <Input name="note" placeholder="Catatan shift" />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Membuka..." : "Buka Shift"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {closeShiftId ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Tutup Shift</h2>
              <form className="mt-6 space-y-4" onSubmit={closeShift}>
                <Input name="closingCash" type="number" placeholder="Kas akhir aktual" required />
                <Input name="note" placeholder="Catatan penutupan" />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setCloseShiftId(null)}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menutup..." : "Tutup Shift"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
