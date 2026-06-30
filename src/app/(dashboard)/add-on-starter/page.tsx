import { prisma } from "@/lib/prisma";
import { decimalToNumber, rupiah } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export default async function AddonStarterPage() {
  const addons = await prisma.addon.findMany({
    include: {
      outletAddons: { take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modul Tambahan"
        description="Seluruh modul tambahan Bayaro sekarang sudah termasuk di aplikasi ini. Status database juga disetel aktif agar bisa langsung dipakai."
        breadcrumb="Fitur / Modul Tambahan"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {addons.map((addon) => {
          const status = addon.outletAddons[0]?.status || "ACTIVE";
          return (
            <div key={addon.id} className="rounded-[28px] bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{addon.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{addon.description}</p>
                </div>
                <Badge tone="success">{status === "ACTIVE" ? "Aktif" : status}</Badge>
              </div>
              <div className="mt-5 rounded-3xl bg-bayaro-soft p-4">
                <p className="text-sm text-slate-500">Nilai modul</p>
                <p className="mt-2 text-xl font-semibold text-bayaro-navy">{rupiah(decimalToNumber(addon.price))}</p>
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Modul ini sudah termasuk dan siap dipakai di Bayaro POS.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
