import { auth, getBusinessContext } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { formatRp, formatDate } from "@/lib/format";
import { Clock, User, Store, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDuration(from: Date, to: Date | null): string {
  if (!to) return "Masih buka";
  const ms = to.getTime() - from.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}j ${m}m`;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function ShiftDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { id } = await params;

  const shift = await prisma.cashierSession.findUnique({
    where: { id },
    include: {
      employee: { select: { name: true } },
      outlet: { select: { name: true } },
      orders: {
        where: { status: "PAID" },
        include: {
          items: { include: { toppings: true } },
          payment: true,
        },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!shift || shift.businessId !== ctx.businessId) notFound();

  const paidOrders = shift.orders;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  let cashSales = 0;
  let qrisSales = 0;
  let otherSales = 0;

  for (const o of paidOrders) {
    if (!o.payment) continue;
    const m = o.payment.method.toUpperCase();
    if (m === "CASH") cashSales += o.totalAmount;
    else if (m === "QRIS") qrisSales += o.totalAmount;
    else otherSales += o.totalAmount;
  }

  const expectedCash = shift.expectedCash;
  const difference = shift.difference;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Shift"
        description={`${shift.employee.name} — ${shift.outlet.name}`}
        breadcrumb="Operasional / Shift Kasir / Detail"
        actions={
          <Link
            href="/shifts"
            className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-lg transition-colors"
          >
            Kembali
          </Link>
        }
      />

      {/* Shift header info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <User className="w-3.5 h-3.5" />
            Kasir
          </div>
          <div className="text-slate-800 font-semibold">{shift.employee.name}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Store className="w-3.5 h-3.5" />
            Outlet
          </div>
          <div className="text-slate-800 font-semibold">{shift.outlet.name}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Tanggal
          </div>
          <div className="text-slate-800 font-semibold">{formatDate(shift.openedAt)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Durasi
          </div>
          <div className="text-slate-800 font-semibold">
            {formatTime(shift.openedAt)}
            {shift.closedAt ? ` — ${formatTime(shift.closedAt)}` : " (buka)"}
          </div>
          <div className="text-slate-400 text-xs mt-0.5">
            {formatDuration(shift.openedAt, shift.closedAt)}
          </div>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Kas Awal"
          value={formatRp(shift.initialCash)}
          icon={<Clock className="w-5 h-5 text-slate-500" />}
        />
        <KpiCard
          label="Total Penjualan"
          value={formatRp(totalRevenue)}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Cash Sales"
          value={formatRp(cashSales)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          color="green"
        />
        <KpiCard
          label="QRIS Sales"
          value={formatRp(qrisSales)}
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          color="purple"
        />
        <KpiCard
          label="Expected Kas"
          value={expectedCash != null ? formatRp(expectedCash) : "-"}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          color="orange"
        />
        <KpiCard
          label="Selisih"
          value={
            difference == null
              ? "-"
              : difference > 0
              ? `+${formatRp(difference)}`
              : formatRp(difference)
          }
          icon={
            difference == null ? (
              <Minus className="w-5 h-5 text-slate-400" />
            ) : difference >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )
          }
          color={difference == null ? "blue" : difference >= 0 ? "green" : "blue"}
        />
      </div>

      {/* Payment breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Breakdown Pembayaran</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: "Cash", amount: cashSales, color: "text-emerald-600" },
            { label: "QRIS", amount: qrisSales, color: "text-purple-600" },
            { label: "Lainnya", amount: otherSales, color: "text-blue-600" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center px-6 py-3"
            >
              <span className="text-slate-600 text-sm">{row.label}</span>
              <span className={`text-sm font-medium ${row.color}`}>
                {formatRp(row.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center px-6 py-3 bg-slate-50">
            <span className="text-slate-800 font-semibold text-sm">Total</span>
            <span className="text-slate-800 font-bold text-sm">
              {formatRp(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            Daftar Transaksi ({paidOrders.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  No. Order
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Items
                </th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">
                  Total
                </th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">
                  Metode
                </th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paidOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                paidOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {order.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded"
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-block bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded">
                            +{order.items.length - 3} lagi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium whitespace-nowrap">
                      {formatRp(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {order.payment && (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment.method.toUpperCase() === "CASH"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.payment.method.toUpperCase() === "QRIS"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.payment.method}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">
                      {order.paidAt ? formatTime(order.paidAt) : "-"}
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
