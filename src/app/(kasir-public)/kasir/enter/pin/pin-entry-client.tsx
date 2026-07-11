"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/kasir/pin-pad";
import { verifyKasirEntryPin } from "@/actions/kasir-public";
import { Lock } from "lucide-react";

interface PinEntryClientProps {
  outletId: string;
  outletName: string;
}

export function PinEntryClient({ outletId, outletName }: PinEntryClientProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (pin: string) => {
    startTransition(async () => {
      setError(undefined);
      const result = await verifyKasirEntryPin(outletId, pin);
      if (!result.ok) {
        setError(result.error ?? "PIN tidak valid");
      } else {
        router.push("/pos");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Masukkan PIN
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Masukkan PIN 4 digit Anda untuk masuk ke{" "}
          <span className="text-slate-700 font-medium">{outletName}</span>
        </p>
      </div>

      {/* PIN Pad */}
      <PinPad onSubmit={handleSubmit} error={error} loading={isPending} />

      {isPending && (
        <p className="text-slate-400 text-sm animate-pulse">Memverifikasi PIN...</p>
      )}
    </div>
  );
}
