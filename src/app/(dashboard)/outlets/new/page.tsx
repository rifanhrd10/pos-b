"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Store } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOutlet } from "@/actions/outlets";
import { getErrorMessage } from "@/lib/errors";

export default function NewOutletPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setLogoUrl(data.url);
    } catch {
      setError("Gagal mengunggah logo");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);
    const form = new FormData(e.currentTarget);
    if (logoUrl) form.set("logo", logoUrl);

    try {
      const result = await createOutlet(form);
      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        router.push("/outlets");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Outlet"
        description="Daftarkan cabang baru ke bisnis Anda"
        breadcrumb="Operasional / Outlet / Tambah"
      />

      <div className="mx-auto max-w-2xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          {/* Logo Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo Outlet</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <Store size={24} className="text-slate-400" />
                )}
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                  <Upload size={14} />
                  Unggah Logo
                </span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Outlet *</label>
            <Input name="name" required placeholder="Nama outlet / cabang" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
            <Input name="address" placeholder="Jl. Contoh No. 123" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kota</label>
              <Input name="city" placeholder="Jakarta" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Telepon</label>
              <Input name="phone" type="tel" placeholder="021-xxxxxxxx" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Buka</label>
              <Input name="openTime" type="time" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Tutup</label>
              <Input name="closeTime" type="time" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Outlet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
