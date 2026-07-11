import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PinEntryClient } from "./pin-entry-client";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ outletId?: string }>;
}

export default async function KasirEnterPinPage({ searchParams }: Props) {
  const { outletId } = await searchParams;

  if (!outletId) {
    notFound();
  }

  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId, isActive: true },
    select: {
      name: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!outlet) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="max-w-sm mx-auto flex items-center gap-4">
          <a
            href={`/kasir/enter/outlets?businessId=${outlet.businessId}`}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
            aria-label="Kembali ke daftar outlet"
          >
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {outlet.name}
            </h1>
            <p className="text-slate-500 text-xs">{outlet.business.name}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <PinEntryClient outletId={outletId} outletName={outlet.name} />
      </main>
    </div>
  );
}
