import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { formatRp, formatDate } from "@/lib/format";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ShiftsFilters } from "./shifts-filters";

interface PageProps {
  searchParams: Promise<{
    employee?: string;
    outlet?: string;
    start?: string;
    end?: string;
  }>;
}

export default async function ShiftsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { employee, outlet, start, end } = await searchParams;

  // Fetch all sessions for this business
  const sessions = await prisma.cashierSession.findMany({
    where: {
      businessId: ctx.businessId,
      ...(employee ? { employeeId: employee } : {}),
      ...(outlet ? { outletId: outlet } : {}),
      ...(start || end
        ? {
            openedAt: {
              ...(start ? { gte: new Date(start) } : {}),
              ...(end
                ? { lte: new Date(new Date(end).setHours(23, 59, 59, 999)) }
                : {}),
            },
          }
        : {}),
    },
    include: {
      employee: { select: { id: true, name: true } },
      outlet: { select: { id: true, name: true } },
      orders: {
        where: { status: "PAID" },
        select: { totalAmount: true },
      },
    },
    orderBy: { openedAt: "desc" },
  });

  // For filter dropdowns
  const employees = await prisma.employee.findMany({
    where: { businessId: ctx.businessId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const outlets = await prisma.outlet.findMany({
    where: { businessId: ctx.businessId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Kasir"
        description="Riwayat dan rekonsiliasi shift kasir"
        breadcrumb="Operasional / Shift Kasir"
      />

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <ShiftsFilters
          employees={employees}
          outlets={outlets}
          defaultEmployee={employee}
          defaultOutlet={outlet}
          defaultStart={start}
          defaultEnd={end}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Tanggal
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Kasir
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Outlet
                </th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">
                  Kas Awal
                </th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">
                  Total Penjualan
                </th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">
                  Selisih
                </th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Belum ada data shift
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const totalSales = s.orders.reduce(
                    (sum, o) => sum + o.totalAmount,
                    0
                  );
                  const diff = s.difference;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {formatDate(s.openedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                        {s.employee.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {s.outlet.name}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                        {formatRp(s.initialCash)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                        {formatRp(totalSales)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {diff == null ? (
                          <span className="text-slate-400">-</span>
                        ) : diff > 0 ? (
                          <span className="text-emerald-600 font-medium">
                            +{formatRp(diff)}
                          </span>
                        ) : diff < 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatRp(diff)}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {formatRp(0)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {s.isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Buka
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Tutup
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/shifts/${s.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
