"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/kasir/pin-pad";
import { verifyKasirEntryPin } from "@/actions/kasir-public";

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
        router.push("/kasir/pos");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-50 font-['Sora',sans-serif]">
          Masukkan PIN
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Masukkan PIN 4 digit Anda untuk masuk ke{" "}
          <span className="text-slate-300 font-medium">{outletName}</span>
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
