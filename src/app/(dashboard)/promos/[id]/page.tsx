import { auth } from "@/lib/auth";
import { getPromo } from "@/actions/promo";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PromoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const promo = await getPromo(id);

  if (!promo) notFound();

  const typeLabel =
    promo.type === "VOUCHER" ? "Voucher" : promo.type === "BUNDLE" ? "Bundle" : "Happy Hour";
  const typeTone = promo.type === "VOUCHER" ? "info" : promo.type === "BUNDLE" ? "default" : "warning";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/promos" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Tag className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{promo.name}</h1>
            <p className="text-sm text-slate-500">Detail promo</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Badge tone={typeTone as "info" | "default" | "warning"}>{typeLabel}</Badge>
          <Badge tone={promo.isActive ? "success" : "default"}>
            {promo.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-slate-900">Informasi Promo</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Deskripsi:</span> {promo.description || "-"}
            </div>
            <div>
              <span className="text-slate-500">Tipe Diskon:</span>{" "}
              {promo.discountType === "PERCENTAGE" ? "Persentase" : "Nominal"}
            </div>
            <div>
              <span className="text-slate-500">Nilai Diskon:</span>{" "}
              {promo.discountType === "PERCENTAGE"
                ? `${promo.discountValue}%`
                : `Rp ${Number(promo.discountValue).toLocaleString("id-ID")}`}
            </div>
            {promo.code && (
              <div>
                <span className="text-slate-500">Kode:</span>{" "}
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{promo.code}</span>
              </div>
            )}
            {promo.minOrderAmount && Number(promo.minOrderAmount) > 0 && (
              <div>
                <span className="text-slate-500">Minimal Order:</span> Rp{" "}
                {Number(promo.minOrderAmount).toLocaleString("id-ID")}
              </div>
            )}
            {promo.maxDiscount && Number(promo.maxDiscount) > 0 && (
              <div>
                <span className="text-slate-500">Maks Diskon:</span> Rp{" "}
                {Number(promo.maxDiscount).toLocaleString("id-ID")}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-slate-900">Periode & Statistik</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Mulai:</span>{" "}
              {promo.startDate
                ? new Date(promo.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </div>
            <div>
              <span className="text-slate-500">Selesai:</span>{" "}
              {promo.endDate
                ? new Date(promo.endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </div>
            {promo.type === "HAPPY_HOUR" && (
              <div>
                <span className="text-slate-500">Jam:</span>{" "}
                {String(promo.startHour ?? 0).padStart(2, "0")}:00 -{" "}
                {String(promo.endHour ?? 23).padStart(2, "0")}:00
              </div>
            )}
            <div>
              <span className="text-slate-500">Digunakan:</span> {promo.usageCount} kali
            </div>
            <div>
              <span className="text-slate-500">Batas Pakai:</span>{" "}
              {promo.usageLimit ?? "Tidak terbatas"}
            </div>
          </div>
        </div>

        {promo.type === "BUNDLE" && promo.bundleItems.length > 0 && (
          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft md:col-span-2">
            <h2 className="font-semibold text-slate-900">Paket Bundle</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-slate-600">Produk</th>
                    <th className="px-4 py-2 font-semibold text-slate-600">Beli</th>
                    <th className="px-4 py-2 font-semibold text-slate-600">Gratis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {promo.bundleItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-slate-700">{item.product.name}</td>
                      <td className="px-4 py-2 text-slate-700">{item.requiredQty}</td>
                      <td className="px-4 py-2 text-slate-700">{item.freeQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/promos/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Promo
          </Button>
        </Link>
        <Link href="/promos">
          <Button variant="ghost">Kembali</Button>
        </Link>
      </div>
    </div>
  );
}
