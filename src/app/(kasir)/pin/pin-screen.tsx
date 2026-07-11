"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/kasir/pin-pad";
import { submitPinAndGetRedirect } from "@/actions/kasir";

interface PinScreenProps {
  employeeId: string;
  employeeName: string;
}

export function PinScreen({ employeeId, employeeName }: PinScreenProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (pin: string) => {
    startTransition(async () => {
      setError(undefined);
      const result = await submitPinAndGetRedirect(employeeId, pin);
      if (!result.ok) {
        setError(result.error ?? "PIN salah");
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-50 font-['Sora',sans-serif]">
            Selamat datang, {employeeName}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Masukkan PIN 4 digit untuk melanjutkan
          </p>
        </div>

        {/* PIN Pad */}
        <PinPad
          onSubmit={handleSubmit}
          error={error}
          loading={isPending}
        />
      </div>
    </div>
  );
}
