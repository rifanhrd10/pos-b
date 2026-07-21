import { auth, getBusinessContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStockMovementReport } from "@/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateYYYYMMDD } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ start?: string; end?: string; start_date?: string; end_date?: string; type?: string; search?: string; page?: string }>;
}

function stockTypeLabel(type: string) {
  const labels: Record<string, string> = {
    IN: "Stock Masuk",
    OUT: "Stock Keluar",
    ADJUSTMENT: "Penyesuaian",
    TRANSFER: "Transfer",
    OPNAME: "Opname",
  };
  return labels[type] ?? type;
}

function stockTypeTone(type: string): "success" | "danger" | "info" | "warning" | "default" {
  if (type === "IN") return "success";
  if (type === "OUT") return "danger";
  if (type === "ADJUSTMENT") return "info";
  if (type === "TRANSFER") return "warning";
  return "default";
}

export default async function StockProductDetailPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { productId } = await params;
  const query = await searchParams;
  const product = await prisma.product.findFirst({
    where: { id: productId, businessId: ctx.businessId, trackStock: true },
    select: { id: true, name: true, sku: true, category: { select: { name: true } } },
  });
  if (!product) notFound();

  const now = new Date();
  const defaultEnd = formatDateYYYYMMDD(now);
  const defaultStart = formatDateYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const startStr = query.start_date ?? query.start ?? defaultStart;
  const endStr = query.end_date ?? query.end ?? defaultEnd;
  const startDate = new Date(startStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endStr);
  endDate.setHours(23, 59, 59, 999);

  const report = await getStockMovementReport(ctx.businessId, {
    productId,
    startDate,
    endDate,
    type: ["IN", "OUT", "ADJUSTMENT", "TRANSFER", "OPNAME"].includes(query.type ?? "") ? query.type as any : undefined,
    search: query.search,
    page: query.page ? Number(query.page) : 1,
    pageSize: 50,
  });
  const totalPages = Math.max(1, Math.ceil(report.total / report.pageSize));
  const baseParams = new URLSearchParams();
  baseParams.set("start_date", startStr);
  baseParams.set("end_date", endStr);
  if (query.type) baseParams.set("type", query.type);
  if (query.search) baseParams.set("search", query.search);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Detail Stock - ${product.name}`}
        description={`${product.category?.name ?? "Tanpa kategori"}${product.sku ? ` • ${product.sku}` : ""}`}
        breadcrumb="Laporan / Stock / Detail"
        actions={
          <Link href="/reports/inventory">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Laporan Stock
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker startDate={startStr} endDate={endStr} />
        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="start_date" value={startStr} />
          <input type="hidden" name="end_date" value={endStr} />
          <select
            name="type"
            defaultValue={query.type ?? ""}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Jenis</option>
            <option value="IN">Stock Masuk</option>
            <option value="OUT">Stock Keluar</option>
            <option value="ADJUSTMENT">Penyesuaian</option>
            <option value="TRANSFER">Transfer</option>
            <option value="OPNAME">Opname</option>
          </select>
          <input
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Cari jenis transaksi..."
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button type="submit" className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
            Filter
          </button>
        </form>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Riwayat Transaksional Stock</h2>
          <p className="text-sm text-slate-500">Periode aktif: {formatDate(startDate)} - {formatDate(endDate)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Jenis</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Masuk</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Keluar</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Sesudah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Belum ada transaksi stock untuk produk ini.</td>
                </tr>
              ) : (
                report.movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{movement.productName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(movement.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={stockTypeTone(movement.type)}>{stockTypeLabel(movement.type)}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-emerald-600">{movement.quantity > 0 ? movement.quantity : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-rose-600">{movement.quantity < 0 ? Math.abs(movement.quantity) : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{movement.stockAfter ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Halaman {report.page} dari {totalPages} · {report.total.toLocaleString("id-ID")} riwayat
          </p>
          <div className="flex gap-2">
            {report.page > 1 ? (
              <Link href={`/reports/inventory/${productId}?${new URLSearchParams({ ...Object.fromEntries(baseParams), page: String(report.page - 1) }).toString()}`}>
                <Button variant="outline">Sebelumnya</Button>
              </Link>
            ) : <Button variant="outline" disabled>Sebelumnya</Button>}
            {report.page < totalPages ? (
              <Link href={`/reports/inventory/${productId}?${new URLSearchParams({ ...Object.fromEntries(baseParams), page: String(report.page + 1) }).toString()}`}>
                <Button variant="outline">Berikutnya</Button>
              </Link>
            ) : <Button variant="outline" disabled>Berikutnya</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
