export const dynamic = "force-dynamic";

import { auth, getBusinessContext } from "@/lib/auth";
import { getTransfers } from "@/actions/transfers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type StatusTone = "warning" | "info" | "success" | "default" | "danger";

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "pending":
      return "warning";
    case "in_transit":
      return "info";
    case "received":
      return "success";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "in_transit":
      return "Dalam Pengiriman";
    case "received":
      return "Diterima";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
}

export default async function TransfersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const result = await getTransfers(ctx.businessId);
  const transfers = Array.isArray(result) ? result : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transfer Stok</h1>
          <p className="text-sm text-slate-500">Transfer stok antar outlet</p>
        </div>
        <Link href="/inventory/transfers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Transfer Baru
          </Button>
        </Link>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">ID</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Rute</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Items</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Belum ada transfer stok
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {transfer.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-medium">
                          {transfer.fromOutlet?.name ?? transfer.fromOutletId.slice(0, 8)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {transfer.toOutlet?.name ?? transfer.toOutletId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={getStatusTone(transfer.status)}>
                        {getStatusLabel(transfer.status)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {transfer.itemCount} item
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(transfer.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/inventory/transfers/${transfer.id}`}>
                        <Button variant="ghost">
                          Detail
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
