export const dynamic = "force-dynamic";

import { auth, getBusinessContext } from "@/lib/auth";
import { getRecentMovements } from "@/actions/stock";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StockMovementType } from "@prisma/client";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type BadgeTone = "success" | "danger" | "info" | "default" | "warning";

function getTypeBadgeTone(type: StockMovementType): BadgeTone {
  switch (type) {
    case "IN":
      return "success";
    case "OUT":
      return "danger";
    case "ADJUSTMENT":
      return "info";
    case "TRANSFER":
      return "info";
    case "OPNAME":
      return "default";
    default:
      return "default";
  }
}

function getTypeLabel(type: StockMovementType): string {
  switch (type) {
    case "IN":
      return "Masuk";
    case "OUT":
      return "Keluar";
    case "ADJUSTMENT":
      return "Penyesuaian";
    case "TRANSFER":
      return "Transfer";
    case "OPNAME":
      return "Opname";
    default:
      return type;
  }
}

export default async function AdjustmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const result = await getRecentMovements(ctx.businessId, 100);

  // Handle error case
  const movements = Array.isArray(result) ? result : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Penyesuaian</h1>
          <p className="text-sm text-slate-500">Log pergerakan stok</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Produk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Outlet</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tipe</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Jumlah</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Catatan</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Referensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Belum ada riwayat penyesuaian stok
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{movement.productName}</div>
                      {movement.productSku && (
                        <div className="text-xs text-slate-400">{movement.productSku}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {movement.outletName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={getTypeBadgeTone(movement.type)}>
                        {getTypeLabel(movement.type)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {movement.quantity > 0 ? (
                        <span className="text-emerald-600">+{movement.quantity}</span>
                      ) : (
                        <span className="text-red-500">{movement.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.note ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.reference ?? <span className="text-slate-300">—</span>}
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
