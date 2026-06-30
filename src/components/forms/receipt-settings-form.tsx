"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emitToast } from "@/components/ui/toast-provider";

type ReceiptSettings = {
  headerText: string | null;
  footerText: string | null;
  paperSize: string;
  showLogo: boolean;
  showCashierName: boolean;
  showCustomerName: boolean;
  showTax: boolean;
  showServiceCharge: boolean;
};

export function ReceiptSettingsForm({ receipt }: { receipt: ReceiptSettings | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      headerText: String(formData.get("headerText") || ""),
      footerText: String(formData.get("footerText") || ""),
      paperSize: String(formData.get("paperSize") || "MM_80"),
      showLogo: formData.get("showLogo") === "on",
      showCashierName: formData.get("showCashierName") === "on",
      showCustomerName: formData.get("showCustomerName") === "on",
      showTax: formData.get("showTax") === "on",
      showServiceCharge: formData.get("showServiceCharge") === "on",
    };

    startTransition(async () => {
      const response = await fetch("/api/receipt-setting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        const message = result.message || "Gagal menyimpan template struk.";
        setError(message);
        emitToast({ tone: "error", title: "Template struk gagal diperbarui", description: message });
        return;
      }

      emitToast({ tone: "success", title: "Template struk diperbarui", description: "Pengaturan struk berhasil disimpan." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Header struk</label>
          <Input name="headerText" defaultValue={receipt?.headerText || ""} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Footer struk</label>
          <Textarea name="footerText" defaultValue={receipt?.footerText || ""} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Ukuran kertas</label>
          <select
            name="paperSize"
            defaultValue={receipt?.paperSize || "MM_80"}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
          >
            <option value="MM_58">58 mm</option>
            <option value="MM_80">80 mm</option>
          </select>
        </div>
        {[
          ["showLogo", "Tampilkan logo"],
          ["showCashierName", "Tampilkan kasir"],
          ["showCustomerName", "Tampilkan pelanggan"],
          ["showTax", "Tampilkan pajak"],
          ["showServiceCharge", "Tampilkan service charge"],
        ].map(([name, label]) => (
          <label key={name} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
            <input type="checkbox" name={name} defaultChecked={Boolean(receipt?.[name as keyof ReceiptSettings])} />
            {label}
          </label>
        ))}
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Template"}
        </Button>
      </div>
    </form>
  );
}
