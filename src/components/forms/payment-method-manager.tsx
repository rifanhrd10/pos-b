"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { emitToast } from "@/components/ui/toast-provider";

type PaymentMethodItem = {
  id: string;
  name: string;
  type: string;
  isAddon: boolean;
  isActive: boolean;
};

export function PaymentMethodManager({ initialMethods }: { initialMethods: PaymentMethodItem[] }) {
  const [methods, setMethods] = useState(initialMethods);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleMethod(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "PATCH",
      });
      const result = await response.json();
      if (response.ok) {
        setMethods((prev) => prev.map((item) => (item.id === id ? result : item)));
        emitToast({
          tone: "success",
          title: result.isActive ? "Metode pembayaran aktif" : "Metode pembayaran nonaktif",
          description: result.name,
        });
      } else {
        emitToast({ tone: "error", title: "Aksi pembayaran gagal", description: result.message });
      }
      setPendingId(null);
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {methods.map((method) => (
        <div key={method.id} className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">{method.name}</p>
              <p className="mt-2 text-sm text-slate-500">{method.type}</p>
            </div>
            <div className="flex gap-2">
              {method.isAddon ? <Badge tone="info">Premium Included</Badge> : <Badge tone="success">Core</Badge>}
              <Badge tone={method.isActive ? "success" : "warning"}>{method.isActive ? "Aktif" : "Nonaktif"}</Badge>
            </div>
          </div>
          <Button
            className="mt-5 w-full"
            variant={method.isActive ? "secondary" : "primary"}
            onClick={() => toggleMethod(method.id)}
            disabled={pending && pendingId === method.id}
          >
            {pending && pendingId === method.id ? "Memproses..." : method.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      ))}
    </div>
  );
}
