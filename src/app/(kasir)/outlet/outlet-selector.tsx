"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { selectKasirOutlet } from "@/actions/kasir";

interface Outlet {
  id: string;
  name: string;
  address: string | null;
}

interface OutletSelectorProps {
  employeeName: string;
  outlets: Outlet[];
}

export function OutletSelector({ employeeName, outlets }: OutletSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (outletId: string) => {
    setSelectedId(outletId);
    startTransition(async () => {
      const result = await selectKasirOutlet(outletId);
      if (result.ok && result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-50 font-['Sora',sans-serif]">
            Pilih Outlet
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Halo {employeeName}, pilih outlet yang akan Anda kelola
          </p>
        </div>

        {/* Outlet Grid */}
        <div className="grid grid-cols-1 gap-3 w-full sm:grid-cols-2">
          {outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => handleSelect(outlet.id)}
              disabled={isPending}
              className={`
                bg-slate-800 border rounded-xl p-5 text-left
                hover:bg-slate-700 hover:border-blue-500
                active:scale-95 transition-all duration-150
                disabled:opacity-50 cursor-pointer
                ${selectedId === outlet.id ? "border-blue-500 bg-slate-700" : "border-slate-700"}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-slate-700 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-50 truncate">{outlet.name}</p>
                  {outlet.address && (
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                      {outlet.address}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
