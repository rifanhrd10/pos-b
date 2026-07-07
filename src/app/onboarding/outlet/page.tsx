"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOutlets } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OutletForm = {
  name: string;
  address: string;
  city: string;
  phone: string;
};

const emptyOutlet = (): OutletForm => ({ name: "", address: "", city: "", phone: "" });

export default function OutletPage() {
  const router = useRouter();
  const [hasMultiOutlet, setHasMultiOutlet] = useState<boolean | null>(null);
  const [outlets, setOutlets] = useState<OutletForm[]>([emptyOutlet()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateOutlet(index: number, field: keyof OutletForm, value: string) {
    setOutlets((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  }

  function addOutlet() {
    setOutlets((prev) => [...prev, emptyOutlet()]);
  }

  function removeOutlet(index: number) {
    if (outlets.length <= 1) return;
    setOutlets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("hasMultiOutlet", hasMultiOutlet ? "true" : "false");

    if (hasMultiOutlet) {
      outlets.forEach((outlet, i) => {
        formData.append(`outlets[${i}][name]`, outlet.name);
        if (outlet.address) formData.append(`outlets[${i}][address]`, outlet.address);
        if (outlet.city) formData.append(`outlets[${i}][city]`, outlet.city);
        if (outlet.phone) formData.append(`outlets[${i}][phone]`, outlet.phone);
      });
    }

    const result = await createOutlets(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/operations");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Setup Outlet</h1>
        <p className="text-slate-500">Tentukan lokasi operasional bisnis Anda.</p>
      </div>

      {/* Question: punya cabang? */}
      {hasMultiOutlet === null && (
        <div className="space-y-4">
          <p className="font-medium text-slate-800">Apakah bisnis Anda memiliki lebih dari 1 lokasi / cabang?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasMultiOutlet(false)}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-all"
            >
              <Store className="h-8 w-8 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-900">Tidak</p>
                <p className="text-xs text-slate-500 mt-0.5">Hanya 1 toko saja</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setHasMultiOutlet(true)}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 p-6 text-center hover:border-cyan-400 hover:bg-cyan-50 transition-all"
            >
              <div className="flex gap-1">
                <Store className="h-7 w-7 text-slate-400" />
                <Store className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ya</p>
                <p className="text-xs text-slate-500 mt-0.5">Punya 2 atau lebih lokasi</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tidak punya cabang → konfirmasi auto-create */}
      {hasMultiOutlet === false && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Store className="h-5 w-5 text-cyan-500" />
              <span className="font-semibold">Outlet Utama</span>
            </div>
            <p className="text-sm text-slate-500">
              Outlet akan dibuat otomatis menggunakan nama dan alamat bisnis Anda.
              Anda dapat mengubah detail outlet kapan saja melalui halaman Pengaturan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasMultiOutlet(null)}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Ubah pilihan
          </button>
        </div>
      )}

      {/* Punya cabang → form multi-outlet */}
      {hasMultiOutlet === true && (
        <div className="space-y-5">
          {outlets.map((outlet, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Outlet {index + 1}</h3>
                {outlets.length > 1 && (
                  <button type="button" onClick={() => removeOutlet(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nama Outlet *</label>
                  <Input
                    placeholder="Contoh: Cabang Pusat"
                    value={outlet.name}
                    onChange={(e) => updateOutlet(index, "name", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Kota</label>
                    <Input
                      placeholder="Jakarta"
                      value={outlet.city}
                      onChange={(e) => updateOutlet(index, "city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telepon</label>
                    <Input
                      placeholder="021-xxxxxxxx"
                      value={outlet.phone}
                      onChange={(e) => updateOutlet(index, "phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Alamat</label>
                  <Input
                    placeholder="Jl. Contoh No. 1"
                    value={outlet.address}
                    onChange={(e) => updateOutlet(index, "address", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addOutlet}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Outlet Lagi
          </button>

          <button
            type="button"
            onClick={() => setHasMultiOutlet(null)}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Ubah pilihan
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {hasMultiOutlet !== null && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/plan")} disabled={loading}>
            Kembali
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (hasMultiOutlet === true && outlets.every((o) => !o.name.trim()))}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
          >
            {loading ? "Menyimpan..." : "Lanjut"}
          </Button>
        </div>
      )}
    </div>
  );
}
