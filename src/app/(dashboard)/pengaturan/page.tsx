import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const settingLinks = [
  {
    title: "Profil Outlet",
    description: "Atur nama outlet, alamat, pajak, service charge, dan footer default struk.",
    href: "/outlet",
    cta: "Buka Outlet",
  },
  {
    title: "Template Struk",
    description: "Sesuaikan header, footer, ukuran kertas, logo, dan informasi yang tampil saat cetak.",
    href: "/struk",
    cta: "Atur Struk",
  },
  {
    title: "Metode Pembayaran",
    description: "Kelola seluruh metode pembayaran Bayaro, termasuk channel premium yang sudah ikut aktif.",
    href: "/pembayaran",
    cta: "Kelola Pembayaran",
  },
  {
    title: "Karyawan & Shift",
    description: "Kelola akun kasir, admin, dan pembukaan shift agar operasional lebih rapi.",
    href: "/karyawan-shift",
    cta: "Kelola Tim",
  },
  {
    title: "Modul Tambahan",
    description: "Lihat modul premium yang sekarang sudah termasuk dan aktif di aplikasi Bayaro.",
    href: "/add-on-starter",
    cta: "Lihat Modul",
  },
];

export default async function SettingsPage() {
  const [outlet, receipt, paymentMethods, activeUsers, activeShift] = await Promise.all([
    prisma.outlet.findFirst({ where: { deletedAt: null } }),
    prisma.receiptSetting.findFirst(),
    prisma.paymentMethod.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.shift.findFirst({
      where: { status: "OPEN" },
      include: { user: true },
      orderBy: { openedAt: "desc" },
    }),
  ]);

  const activePaymentCount = paymentMethods.filter((item) => item.isActive).length;
  const inactivePaymentCount = paymentMethods.length - activePaymentCount;
  const taxRate = decimalToNumber(outlet?.taxRate);
  const serviceChargeRate = decimalToNumber(outlet?.serviceChargeRate);

  const setupChecklist = [
    {
      label: "Profil outlet",
      status: Boolean(outlet?.name && outlet?.address && outlet?.phone),
      description: outlet?.name ? `${outlet.name} sudah memiliki data kontak utama.` : "Lengkapi identitas outlet terlebih dahulu.",
      href: "/outlet",
    },
    {
      label: "Template struk",
      status: Boolean(receipt?.headerText || receipt?.footerText || receipt?.showLogo),
      description: receipt
        ? `Struk ${receipt.paperSize === "MM_58" ? "58 mm" : "80 mm"} siap dipakai untuk preview dan cetak.`
        : "Template struk masih memakai konfigurasi default outlet.",
      href: "/struk",
    },
    {
      label: "Metode pembayaran aktif",
      status: activePaymentCount > 0,
      description: `${activePaymentCount} metode aktif, ${inactivePaymentCount} metode bisa dinyalakan atau diatur ulang kapan saja.`,
      href: "/pembayaran",
    },
    {
      label: "Akses tim",
      status: activeUsers > 0,
      description: `${activeUsers} akun aktif siap login ke Bayaro POS.`,
      href: "/karyawan-shift",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Pusat konfigurasi Bayaro POS untuk mengecek kesiapan outlet, struk, pembayaran, dan akun operasional dari satu tempat."
        breadcrumb="Sistem / Pengaturan"
        actions={
          <Link href="/outlet">
            <Button>Perbarui Outlet</Button>
          </Link>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Outlet aktif</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{outlet?.name || "Bayaro POS"}</p>
          <p className="mt-2 text-sm text-slate-500">{outlet?.phone || "Nomor outlet belum diisi"}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Pajak & service</p>
          <p className="mt-3 text-2xl font-bold text-bayaro-navy">{taxRate}% + {serviceChargeRate}%</p>
          <p className="mt-2 text-sm text-slate-500">Dipakai otomatis saat checkout transaksi.</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Pembayaran aktif</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">{activePaymentCount} metode</p>
          <p className="mt-2 text-sm text-slate-500">{inactivePaymentCount} metode lain bisa dinyalakan kapan saja dari panel pembayaran.</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Shift berjalan</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeShift ? "Aktif" : "Belum ada"}</p>
          <p className="mt-2 text-sm text-slate-500">
            {activeShift ? `${activeShift.user.name} membuka shift terbaru.` : "Buka shift dari modul Karyawan & Shift saat operasional dimulai."}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Status konfigurasi</h2>
              <p className="mt-2 text-sm text-slate-500">Checklist cepat untuk memastikan Bayaro POS siap dipakai outlet.</p>
            </div>
            <Badge tone="success">Siap Demo</Badge>
          </div>

          <div className="mt-6 space-y-4">
            {setupChecklist.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <Badge tone={item.status ? "success" : "warning"}>{item.status ? "Siap" : "Perlu cek"}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                  <Link href={item.href} className="text-sm font-semibold text-bayaro-blue transition hover:text-bayaro-navy">
                    Buka
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Pusat pengaturan</h2>
          <p className="mt-2 text-sm text-slate-500">
            Shortcut ini mengarah ke halaman konfigurasi yang sudah aktif di Bayaro, jadi tim bisa langsung edit tanpa perlu mencari dari sidebar.
          </p>
          <div className="mt-6 grid gap-4">
            {settingLinks.map((item) => (
              <div key={item.title} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                  <Link href={item.href}>
                    <Button variant="secondary">{item.cta}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ringkasan operasional</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Outlet, struk, pembayaran, dan tim kini sudah terhubung dalam satu alur. Perubahan di area ini langsung memengaruhi pengalaman login, checkout, transaksi, dan laporan dasar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge tone="default">Next.js</Badge>
            <Badge tone="default">Prisma</Badge>
            <Badge tone="default">PostgreSQL</Badge>
            <Badge tone="default">Full Access</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
