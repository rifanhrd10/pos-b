import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { starterHighlights, lockedModules } from "@/lib/nav";
import { decimalToNumber, rupiah, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [categoryCount, productCount, transactionCount, transactionTotal, recentTransactions, activeCashiers] = await Promise.all([
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.transaction.aggregate({
      _sum: { grandTotal: true },
      where: { status: "PAID", deletedAt: null },
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cashier: true },
    }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
  ]);

  const summary = [
    { label: "Kategori aktif", value: String(categoryCount) },
    { label: "Produk aktif", value: String(productCount) },
    { label: "Transaksi", value: String(transactionCount) },
    { label: "Omzet", value: rupiah(decimalToNumber(transactionTotal._sum.grandTotal)) },
  ];
  const avgTransaction = transactionCount > 0 ? decimalToNumber(transactionTotal._sum.grandTotal) / transactionCount : 0;
  const quickLinks = [
    { href: "/kasir", label: "Kasir", description: "Buka transaksi baru" },
    { href: "/produk", label: "Produk", description: "Kelola menu dan harga" },
    { href: "/laporan", label: "Laporan", description: "Pantau penjualan harian" },
    { href: "/pengaturan", label: "Pengaturan", description: "Atur outlet dan struk" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Bayaro"
        description="Ringkasan operasional Bayaro POS dengan seluruh modul inti dan tambahan yang sudah aktif di aplikasi ini."
        breadcrumb="Beranda / Dashboard"
        actions={
          <Link href="/kasir">
            <Button>Buka Kasir</Button>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Highlight Sistem</h2>
              <p className="mt-2 text-sm text-slate-500">Modul inti dan tambahan Bayaro aktif untuk operasional harian.</p>
            </div>
            <Badge tone="success">Full Access</Badge>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {starterHighlights.map((item) => (
              <div key={item.label} className="rounded-[20px] bg-bayaro-soft p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[20px] border border-dashed border-slate-200 p-5">
            <p className="font-semibold text-slate-900">Alur data yang sudah siap</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kategori masuk ke produk, produk tampil di kasir, checkout membuat transaksi, dan snapshot item tersimpan untuk laporan dasar serta cetak struk.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition hover:border-bayaro-blue hover:bg-white"
              >
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Rata-rata transaksi</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{rupiah(avgTransaction)}</p>
              <p className="mt-2 text-sm text-slate-500">Nilai rata-rata dari seluruh transaksi yang tercatat.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Tim aktif</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{activeCashiers} akun</p>
              <p className="mt-2 text-sm text-slate-500">Akun owner, admin, dan kasir yang siap masuk ke sistem.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-[#071a49] p-5 text-white shadow-soft">
              <p className="text-sm text-blue-200">Aksi cepat</p>
              <p className="mt-2 text-xl font-semibold">Mulai transaksi baru</p>
              <p className="mt-2 text-sm leading-6 text-blue-100">Masuk ke kasir untuk checkout, topping, pembayaran, dan cetak struk.</p>
              <div className="mt-4">
                <Link href="/kasir">
                  <Button className="bg-white text-[#071a49] hover:bg-slate-100">Buka Kasir</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Transaksi terbaru</h2>
              <Link href="/transaksi">
                <Button variant="secondary">Lihat Semua</Button>
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {recentTransactions.length ? (
                recentTransactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    href={`/transaksi/${transaction.id}`}
                    className="block rounded-[20px] border border-slate-200 p-4 transition hover:border-bayaro-blue"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{transaction.transactionNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {transaction.cashier.name} • {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-bayaro-navy">{rupiah(decimalToNumber(transaction.grandTotal))}</p>
                        <Badge tone="success">{transaction.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[20px] bg-slate-50 p-4 text-sm text-slate-500">Belum ada transaksi.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Modul Tambahan Tersedia</h2>
            <p className="mt-2 text-sm text-slate-500">Seluruh modul tambahan Bayaro sudah masuk ke aplikasi ini dan dapat dipakai sesuai kebutuhan operasional.</p>
          </div>
          <Link href="/add-on-starter">
            <Button variant="secondary">Lihat Modul</Button>
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {lockedModules.map((item) => (
            <div key={item} className="rounded-[18px] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
