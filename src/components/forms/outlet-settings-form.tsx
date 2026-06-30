"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emitToast } from "@/components/ui/toast-provider";

type OutletSettings = {
  name: string;
  phone: string;
  email: string | null;
  address: string;
  taxRate: number;
  serviceChargeRate: number;
  receiptFooter: string | null;
};

export function OutletSettingsForm({ outlet }: { outlet: OutletSettings | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      taxRate: Number(formData.get("taxRate") || 0),
      serviceChargeRate: Number(formData.get("serviceChargeRate") || 0),
      receiptFooter: String(formData.get("receiptFooter") || ""),
    };

    startTransition(async () => {
      const response = await fetch("/api/outlet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        const message = result.message || "Gagal menyimpan outlet.";
        setError(message);
        emitToast({ tone: "error", title: "Outlet gagal diperbarui", description: message });
        return;
      }

      emitToast({ tone: "success", title: "Outlet diperbarui", description: "Profil outlet berhasil disimpan." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nama outlet</label>
            <Input name="name" defaultValue={outlet?.name} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nomor telepon</label>
            <Input name="phone" defaultValue={outlet?.phone} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <Input name="email" type="email" defaultValue={outlet?.email || ""} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Pajak (%)</label>
              <Input name="taxRate" type="number" defaultValue={String(outlet?.taxRate || 0)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Service charge (%)</label>
              <Input
                name="serviceChargeRate"
                type="number"
                defaultValue={String(outlet?.serviceChargeRate || 0)}
                required
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Alamat</label>
            <Textarea name="address" defaultValue={outlet?.address} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Footer struk outlet</label>
            <Textarea name="receiptFooter" defaultValue={outlet?.receiptFooter || ""} />
          </div>
        </div>
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Outlet"}
        </Button>
      </div>
    </form>
  );
}
