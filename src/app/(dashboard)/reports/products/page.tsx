import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProductsReport } from "@/actions/reports";
import { getCategories } from "@/actions/categories";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import { ProductsBarChart } from "@/components/charts/products-bar-chart";
import { formatRp, formatDateYYYYMMDD } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; categoryId?: string }>;
}

export default async function ProductsReportPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/login");

  const params = await searchParams;

  const now = new Date();
  const defaultEnd = formatDateYYYYMMDD(now);
  const defaultStart = formatDateYYYYMMDD(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  const startStr = params.start ?? defaultStart;
  const endStr = params.end ?? defaultEnd;
  const categoryId = params.categoryId;

  const startDate = new Date(startStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endStr);
  endDate.setHours(23, 59, 59, 999);

  const [products, categories] = await Promise.all([
    getProductsReport(ctx.businessId, startDate, endDate, categoryId),
    getCategories(ctx.businessId),
  ]);

  const top20 = products.slice(0, 20);

  const exportData = products.map((row) => ({
    rank: row.rank,
    name: row.name,
    category: row.category,
    qty: row.qty,
    revenue: row.revenue,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk Terlaris"
        description="Laporan produk terlaris berdasarkan periode"
        breadcrumb="Laporan / Produk Terlaris"
        actions={
          <ExportExcelButton
            data={exportData}
            filename={`produk-terlaris-${startStr}-${endStr}`}
            columns={[
              { key: "rank", label: "Rank" },
              { key: "name", label: "Produk" },
              { key: "category", label: "Kategori" },
              { key: "qty", label: "Qty Terjual" },
              { key: "revenue", label: "Revenue" },
            ]}
          />
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker startDate={startStr} endDate={endStr} />

        <form method="GET">
          <input type="hidden" name="start" value={startStr} />
          <input type="hidden" name="end" value={endStr} />
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-soft"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Bar chart */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-sans text-base font-semibold text-slate-900">
          Top 20 Produk by Pendapatan
        </h2>
        {top20.length > 0 ? (
          <ProductsBarChart data={top20} />
        ) : (
          <div className="flex h-[400px] items-center justify-center text-sm text-slate-400">
            Tidak ada data untuk periode ini
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-soft">
        <div className="p-6">
          <h2 className="font-sans text-base font-semibold text-slate-900">
            Daftar Produk
          </h2>
        </div>
        {products.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Tidak ada data produk untuk periode ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">
                    #
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Qty Terjual
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-400">
                      {row.rank}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{row.category}</td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {row.qty.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      {formatRp(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
