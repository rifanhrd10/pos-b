"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateOutlet } from "@/actions/outlets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";

type OutletEditFormProps = {
  outlet: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    openTime: string | null;
    closeTime: string | null;
  };
};

export default function OutletEditForm({ outlet }: OutletEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateOutlet(outlet.id, formData);
      if (result.error) {
        setError(getErrorMessage(result.error));
        setLoading(false);
        return;
      }

      router.push(`/outlets/${outlet.id}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" type="button" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Outlet</h1>
          <p className="text-sm text-slate-500">Perbarui informasi outlet</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Outlet *</label>
            <Input name="name" placeholder="Nama Outlet" defaultValue={outlet.name} required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
            <Input name="address" placeholder="Alamat" defaultValue={outlet.address || ""} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kota</label>
              <Input name="city" placeholder="Kota" defaultValue={outlet.city || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Telepon</label>
              <Input name="phone" placeholder="Telepon" defaultValue={outlet.phone || ""} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Buka</label>
              <Input name="openTime" type="time" defaultValue={outlet.openTime || "08:00"} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Tutup</label>
              <Input name="closeTime" type="time" defaultValue={outlet.closeTime || "22:00"} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
