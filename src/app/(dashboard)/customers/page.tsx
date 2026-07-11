import { auth, getBusinessContext } from "@/lib/auth";
import { getCustomers } from "@/actions/customers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRp, formatDate, timeAgo } from "@/lib/format";
import { ExportExcelButton } from "@/components/shared/export-excel-button";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { search, sort, page } = await searchParams;
  const result = await getCustomers(ctx.businessId, {
    search,
    sortBy: sort,
    page: page ? Number(page) : 1,
  });

  const customers = result.customers as Array<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    totalVisits: number;
    totalSpent: number;
    lastVisit: Date | null;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pelanggan</h1>
          <p className="text-sm text-slate-500">Kelola data pelanggan Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton
            data={customers.map((c) => ({
              name: c.name,
              phone: c.phone ?? "-",
              email: c.email ?? "-",
              totalVisits: c.totalVisits,
              totalSpent: c.totalSpent,
            }))}
            filename="pelanggan"
            columns={[
              { key: "name", label: "Nama" },
              { key: "phone", label: "No. HP" },
              { key: "email", label: "Email" },
              { key: "totalVisits", label: "Total Kunjungan" },
              { key: "totalSpent", label: "Total Belanja" },
            ]}
          />
          <Link href="/customers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <form method="GET">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari nama, HP, atau email..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Nama</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">No. HP</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Kunjungan</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Total Belanja</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Terakhir</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    {search ? (
                      <>Tidak ada pelanggan yang cocok dengan &quot;{search}&quot;</>
                    ) : (
                      <>Belum ada pelanggan. Tambah pelanggan pertama Anda!</>
                    )}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      <Link href={`/customers/${customer.id}`} className="hover:text-indigo-600">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {customer.phone || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {customer.email || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {customer.totalVisits}x
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatRp(customer.totalSpent)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 text-xs">
                      {customer.lastVisit ? timeAgo(new Date(customer.lastVisit)) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <Link href={`/customers/${customer.id}/edit`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                          <Pencil size={15} />
                        </Link>
                      </div>
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
