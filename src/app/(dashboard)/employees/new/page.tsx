"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createEmployee } from "@/actions/employees";
import { getErrorMessage } from "@/lib/errors";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [outlets, setOutlets] = useState<{ id: string; name: string }[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/data/roles")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRoles(data); })
      .catch(() => {});
    fetch("/api/data/outlets")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOutlets(data); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);
    const form = new FormData(e.currentTarget);
    form.set("outletIds", JSON.stringify(selectedOutlets));

    try {
      const result = await createEmployee(form);
      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        router.push("/employees");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  function toggleOutlet(id: string) {
    setSelectedOutlets((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Karyawan"
        description="Daftarkan karyawan baru ke bisnis Anda"
        breadcrumb="Operasional / Karyawan / Tambah"
      />

      <div className="mx-auto max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap *</label>
            <Input name="name" required placeholder="Nama karyawan" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="email@contoh.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Telepon</label>
              <Input name="phone" type="tel" placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role *</label>
            <Select name="roleId" required>
              <option value="">Pilih role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">PIN (untuk kasir)</label>
            <Input name="pin" type="password" placeholder="4-6 digit PIN" maxLength={6} />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Penempatan Outlet *
            </label>
            <p className="mb-3 text-xs text-slate-500">Pilih satu atau lebih outlet tempat karyawan ini bekerja.</p>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              {outlets.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada outlet terdaftar.</p>
              ) : (
                outlets.map((outlet) => (
                  <label key={outlet.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedOutlets.includes(outlet.id)}
                      onChange={() => toggleOutlet(outlet.id)}
                      className="h-4 w-4 rounded border-slate-300 text-bayaro-navy focus:ring-bayaro-blue"
                    />
                    <span className="text-sm text-slate-700">{outlet.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Karyawan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
