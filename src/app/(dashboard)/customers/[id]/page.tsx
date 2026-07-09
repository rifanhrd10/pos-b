import { auth } from "@/lib/auth";
import { getCustomer } from "@/actions/customers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRp, formatDate, timeAgo } from "@/lib/format";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const customer = await getCustomer(id) as {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    totalVisits: number;
    totalSpent: number;
    lastVisit: Date | null;
    createdAt: Date;
    orders?: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      paidAt: Date | null;
      createdAt: Date;
      payment?: { method: string } | null;
    }>;
  } | null;

  if (!customer) notFound();

  const avgPerVisit = customer.totalVisits > 0
    ? customer.totalSpent / customer.totalVisits
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/customers" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">Detail pelanggan</p>
          </div>
        </div>
        <div className="sm:ml-auto">
          <Link href={`/customers/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Pelanggan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Kunjungan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{customer.totalVisits}x</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Belanja</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatRp(customer.totalSpent)}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rata-rata/Kunjungan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatRp(avgPerVisit)}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Terakhir Kunjung</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {customer.lastVisit ? timeAgo(new Date(customer.lastVisit)) : "-"}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-semibold text-slate-900">Informasi Pelanggan</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-slate-500">No. HP:</span>{" "}
            <span className="text-slate-900">{customer.phone || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>{" "}
            <span className="text-slate-900">{customer.email || "-"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500">Alamat:</span>{" "}
            <span className="text-slate-900">{customer.address || "-"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500">Catatan:</span>{" "}
            <span className="text-slate-900">{customer.notes || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500">Terdaftar:</span>{" "}
            <span className="text-slate-900">{formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-semibold text-slate-900">Riwayat Transaksi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">No. Order</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Total</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!customer.orders || customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                customer.orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {order.paidAt ? formatDate(order.paidAt) : formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatRp(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {order.payment?.method || "-"}
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
