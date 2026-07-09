import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PinEntryClient } from "./pin-entry-client";

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
      business: { select: { name: true } },
    },
  });

  if (!outlet) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-sm mx-auto flex items-center gap-4">
          <a
            href="/kasir/enter/outlets"
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Kembali ke daftar outlet"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </a>
          <div>
            <h1 className="text-lg font-bold text-slate-50 font-['Sora',sans-serif]">
              {outlet.name}
            </h1>
            <p className="text-slate-400 text-xs">{outlet.business.name}</p>
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
