import Link from "next/link";
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, ArrowRight, BarChart2, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Pengguna", value: "2,840", change: "+12%", up: true },
  { label: "Transaksi Hari Ini", value: "148", change: "+8%", up: true },
  { label: "Produk Aktif", value: "634", change: "+3%", up: true },
  { label: "Omzet Bulan Ini", value: "Rp 48,2 jt", change: "-2%", up: false },
];

const recentActivity = [
  { id: "TRX-20240601", user: "Budi Santoso", amount: "Rp 245.000", status: "success", date: "2 menit lalu" },
  { id: "TRX-20240602", user: "Siti Rahma", amount: "Rp 120.000", status: "success", date: "8 menit lalu" },
  { id: "TRX-20240603", user: "Andi Wijaya", amount: "Rp 890.000", status: "warning", date: "15 menit lalu" },
  { id: "TRX-20240604", user: "Rina Kusuma", amount: "Rp 67.500", status: "success", date: "22 menit lalu" },
  { id: "TRX-20240605", user: "Doni Prasetyo", amount: "Rp 312.000", status: "danger", date: "1 jam lalu" },
];

const topProducts = [
  { name: "Kopi Susu Gula Aren", sold: 248, revenue: "Rp 3,7 jt", pct: 88 },
  { name: "Matcha Latte", sold: 190, revenue: "Rp 2,9 jt", pct: 72 },
  { name: "Americano", sold: 165, revenue: "Rp 1,8 jt", pct: 62 },
  { name: "Croissant Original", sold: 130, revenue: "Rp 1,3 jt", pct: 49 },
  { name: "Teh Tarik Spesial", sold: 112, revenue: "Rp 1,1 jt", pct: 42 },
];

const quickLinks = [
  { href: "/ui/tables", label: "Tables", description: "Lihat komponen tabel", icon: BarChart2 },
  { href: "/ui/forms", label: "Forms", description: "Elemen form input", icon: Package },
  { href: "/pages/calendar", label: "Calendar", description: "Halaman kalender", icon: ShoppingCart },
  { href: "/profile", label: "Profile", description: "Halaman profil pengguna", icon: Users },
];

const templateInfo = [
  { label: "Halaman", value: "17" },
  { label: "Komponen", value: "40+" },
  { label: "Framework", value: "Next.js 15" },
  { label: "Style", value: "Tailwind CSS" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Selamat datang di Bayaro Admin Template. Lihat ringkasan statistik dan navigasi ke komponen UI."
        breadcrumb="Beranda / Dashboard"
        actions={
          <Link href="/ui/tables">
            <Button>Jelajahi Komponen</Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
            <div className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${item.up ? "text-emerald-600" : "text-rose-500"}`}>
              {item.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{item.change} dari bulan lalu</span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Top Products */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Produk Terlaris</h2>
                <p className="mt-1 text-sm text-slate-500">Berdasarkan jumlah terjual bulan ini</p>
              </div>
              <Badge tone="info">Top 5</Badge>
            </div>
            <div className="mt-5 space-y-4">
              {topProducts.map((product) => (
                <div key={product.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{product.name}</span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{product.sold} terjual</span>
                      <span className="font-semibold text-slate-900">{product.revenue}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-bayaro-blue"
                      style={{ width: `${product.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Navigasi Cepat</h2>
            <p className="mt-1 text-sm text-slate-500">Akses halaman dan komponen dengan mudah</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition hover:border-bayaro-blue hover:bg-white"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-bayaro-soft text-bayaro-blue">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:text-bayaro-blue" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Template Info Card */}
          <div className="rounded-[24px] bg-[#071a49] p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-200">Template Info</p>
                <p className="text-lg font-semibold text-white">Bayaro Admin</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {templateInfo.map((item) => (
                <div key={item.label} className="rounded-[16px] bg-white/10 p-4">
                  <p className="text-xs text-blue-200">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Link href="/ui/tables">
                <Button className="w-full justify-center bg-white py-2.5 text-[#071a49] hover:bg-slate-100">
                  Jelajahi Komponen
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Aktivitas Terbaru</h2>
              <Badge tone="default">Live</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{activity.user}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{activity.id} • {activity.date}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-semibold text-slate-900">{activity.amount}</span>
                    <Badge tone={activity.status as "success" | "warning" | "danger"}>
                      {activity.status === "success" ? "Berhasil" : activity.status === "warning" ? "Pending" : "Gagal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
