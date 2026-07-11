export const dynamic = "force-dynamic";

import { auth, getBusinessContext } from "@/lib/auth";
import { getTransfer, approveTransfer, receiveTransfer, cancelTransfer } from "@/actions/transfers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
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
    case "pending":    return "warning";
    case "in_transit": return "info";
    case "received":   return "success";
    case "cancelled":  return "default";
    default:           return "default";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":    return "Menunggu";
    case "in_transit": return "Dalam Pengiriman";
    case "received":   return "Diterima";
    case "cancelled":  return "Dibatalkan";
    default:           return status;
  }
}

// Server actions must be defined at module scope (not inside async component)
// to avoid TS issues with closures over params in Next.js 15.
async function approve(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await approveTransfer(id);
  redirect(`/inventory/transfers/${id}`);
}

async function receive(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const receivedBy = formData.get("receivedBy") as string;
  await receiveTransfer(id, receivedBy);
  redirect(`/inventory/transfers/${id}`);
}

async function cancel(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await cancelTransfer(id);
  redirect(`/inventory/transfers/${id}`);
}

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const result = await getTransfer(id);

  if (!result || "error" in result) {
    notFound();
  }

  const transfer = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventory/transfers">
            <Button variant="ghost">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detail Transfer #{id.slice(0, 8)}
            </h1>
            <p className="text-sm text-slate-500">Transfer stok antar outlet</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {transfer.status === "pending" && (
            <>
              <form action={approve}>
                <input type="hidden" name="id" value={id} />
                <Button type="submit">Proses Transfer</Button>
              </form>
              <form action={cancel}>
                <input type="hidden" name="id" value={id} />
                <Button type="submit" variant="outline">Batalkan</Button>
              </form>
            </>
          )}
          {transfer.status === "in_transit" && (
            <>
              <form action={receive}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="receivedBy" value={session.user.id} />
                <Button type="submit">Terima Transfer</Button>
              </form>
              <form action={cancel}>
                <input type="hidden" name="id" value={id} />
                <Button type="submit" variant="outline">Batalkan</Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Rute</p>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <span>{transfer.fromOutlet?.name ?? transfer.fromOutletId.slice(0, 8)}</span>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{transfer.toOutlet?.name ?? transfer.toOutletId.slice(0, 8)}</span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <Badge tone={getStatusTone(transfer.status)}>
              {getStatusLabel(transfer.status)}
            </Badge>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Tanggal Dibuat</p>
            <p className="text-slate-700">{formatDate(transfer.createdAt)}</p>
          </div>

          {transfer.completedAt && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Tanggal Selesai</p>
              <p className="text-slate-700">{formatDate(transfer.completedAt)}</p>
            </div>
          )}

          {transfer.note && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</p>
              <p className="text-slate-700">{transfer.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Item Transfer</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Produk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Varian</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfer.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada item
                  </td>
                </tr>
              ) : (
                transfer.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      {item.product?.name ?? item.productId.slice(0, 8)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {item.variant?.name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 font-medium">
                      {item.quantity}
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
