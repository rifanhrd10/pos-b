import { auth, getBusinessContext } from "@/lib/auth";
import { getPromos } from "@/actions/promo";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PromosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const promos = await getPromos(ctx.businessId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promo & Diskon</h1>
          <p className="text-sm text-slate-500">Kelola voucher, bundle, dan happy hour</p>
        </div>
        <Link href="/promos/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Promo
          </Button>
        </Link>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Nama</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tipe</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kode</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Diskon</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Periode</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Pakai</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Belum ada promo. Buat promo pertama Anda!
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      <Link href={`/promos/${promo.id}`} className="hover:text-bayaro-blue">
                        {promo.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge
                        tone={
                          promo.type === "VOUCHER"
                            ? "info"
                            : promo.type === "BUNDLE"
                            ? "default"
                            : "warning"
                        }
                      >
                        {promo.type === "VOUCHER" ? "Voucher" : promo.type === "BUNDLE" ? "Bundle" : "Happy Hour"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 font-mono text-xs">
                      {promo.code || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {promo.discountType === "PERCENTAGE"
                        ? `${promo.discountValue}%`
                        : `Rp ${Number(promo.discountValue).toLocaleString("id-ID")}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 text-xs">
                      {promo.startDate
                        ? new Date(promo.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}{" "}
                      -{" "}
                      {promo.endDate
                        ? new Date(promo.endDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {promo.usageCount}/{promo.usageLimit || "∞"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={promo.isActive ? "success" : "default"}>
                        {promo.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/promos/${promo.id}/edit`}>
                        <Button variant="ghost" className="text-xs">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
