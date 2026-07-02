import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const products = [
  { name: "Kopi Susu", category: "Minuman", price: "Rp 28.000" },
  { name: "Croissant", category: "Makanan", price: "Rp 32.000" },
  { name: "Matcha Latte", category: "Minuman", price: "Rp 35.000" },
  { name: "Teh Tarik", category: "Minuman", price: "Rp 22.000" },
];

const categoryTone: Record<string, "info" | "warning"> = {
  Minuman: "info",
  Makanan: "warning",
};

export default function CardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Cards"
        description="Berbagai variasi card untuk dashboard, produk, profil, dan pricing."
        breadcrumb="UI Elements / Cards"
      />

      {/* Stat Cards */}
      <section>
        <h2 className="font-sora mb-4 text-lg font-semibold text-slate-900">Stat Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Total Penjualan */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Penjualan</p>
            <p className="mt-2 font-sora text-2xl font-bold text-slate-900">Rp 48,2 jt</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                ▲ 12%
              </span>
              <span className="text-xs text-slate-400">vs bulan lalu</span>
            </div>
          </div>

          {/* Pengguna Aktif */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pengguna Aktif</p>
            <p className="mt-2 font-sora text-2xl font-bold text-slate-900">2.840</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                ▲ 8%
              </span>
              <span className="text-xs text-slate-400">vs bulan lalu</span>
            </div>
          </div>

          {/* Produk */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Produk</p>
            <p className="mt-2 font-sora text-2xl font-bold text-slate-900">634</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                ▲ 3%
              </span>
              <span className="text-xs text-slate-400">vs bulan lalu</span>
            </div>
          </div>

          {/* Transaksi */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Transaksi</p>
            <p className="mt-2 font-sora text-2xl font-bold text-slate-900">148</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                ▼ 2%
              </span>
              <span className="text-xs text-slate-400">vs bulan lalu</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Cards */}
      <section>
        <h2 className="font-sora mb-4 text-lg font-semibold text-slate-900">Content Cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Laporan Bulanan */}
          <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-sora font-semibold text-slate-900">Laporan Bulanan</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Ringkasan performa penjualan bulan ini. Total transaksi meningkat dibanding periode sebelumnya.
            </p>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Button variant="secondary" className="w-full">
                Lihat Detail
              </Button>
            </div>
          </div>

          {/* Notifikasi Sistem */}
          <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <h3 className="font-sora font-semibold text-slate-900">Notifikasi Sistem</h3>
              <Badge tone="info">Baru</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Ada 3 pembaruan sistem yang perlu diperhatikan. Segera tinjau sebelum tenggat waktu.
            </p>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
              <Badge tone="warning">3 Tertunda</Badge>
              <Badge tone="success">12 Selesai</Badge>
            </div>
          </div>

          {/* Pengaturan Outlet */}
          <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-sora font-semibold text-slate-900">Pengaturan Outlet</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Konfigurasi outlet belum lengkap. Lengkapi data jam operasional dan alamat outlet Anda.
            </p>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Button variant="secondary" className="w-full">
                Edit
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark / Colored Cards */}
      <section>
        <h2 className="font-sora mb-4 text-lg font-semibold text-slate-900">Dark / Colored Cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Navy */}
          <div className="rounded-[28px] bg-[#071a49] p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">Paket Premium</p>
            <p className="font-sora mt-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-2xl font-bold text-transparent">
              Bayaro Pro
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Akses penuh ke semua fitur dan laporan analitik lanjutan.
            </p>
            <button className="mt-5 w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#071a49] transition hover:bg-slate-100">
              Upgrade Sekarang
            </button>
          </div>

          {/* Blue */}
          <div className="rounded-[28px] bg-bayaro-blue p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">Informasi</p>
            <p className="font-sora mt-2 text-2xl font-bold">Promo Hari Ini</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Diskon 20% untuk semua transaksi menggunakan metode transfer bank.
            </p>
            <button className="mt-5 w-full rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/30">
              Pelajari Lebih Lanjut
            </button>
          </div>

          {/* Soft */}
          <div className="rounded-[28px] border border-slate-200 bg-bayaro-soft p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-bayaro-blue">Tips</p>
            <p className="font-sora mt-2 text-2xl font-bold text-slate-900">Optimalkan Outlet</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Lengkapi profil outlet Anda untuk meningkatkan kepercayaan pelanggan dan performa toko.
            </p>
            <button className="mt-5 w-full rounded-2xl bg-bayaro-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102864]">
              Mulai Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Glassmorphism Card */}
      <section>
        <h2 className="font-sora mb-4 text-lg font-semibold text-slate-900">Glassmorphism Card</h2>
        <div className="rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wide text-bayaro-blue">Ringkasan Performa</p>
          <p className="font-sora mt-2 text-2xl font-bold text-slate-900">Dashboard Overview</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Pantau semua metrik penting bisnis Anda dalam satu tampilan. Data diperbarui secara real-time
            setiap 5 menit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-semibold text-slate-700">Penjualan Hari Ini</span>
              <span className="text-sm font-bold text-slate-900">Rp 4,2 jt</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-bayaro-blue"></span>
              <span className="text-sm font-semibold text-slate-700">Transaksi Aktif</span>
              <span className="text-sm font-bold text-slate-900">24</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product / Image Cards */}
      <section>
        <h2 className="font-sora mb-4 text-lg font-semibold text-slate-900">Product Cards</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft"
            >
              <div className="flex h-40 items-center justify-center bg-bayaro-soft text-4xl font-bold text-slate-300">
                {product.name.charAt(0)}
              </div>
              <div className="p-4">
                <h3 className="font-sora font-semibold text-slate-900">{product.name}</h3>
                <div className="mt-1.5">
                  <Badge tone={categoryTone[product.category] ?? "default"}>{product.category}</Badge>
                </div>
                <p className="mt-2 text-base font-bold text-bayaro-navy">{product.price}</p>
                <a
                  href="#"
                  className="mt-3 block text-center text-xs font-semibold text-bayaro-blue hover:underline"
                >
                  Lihat Detail
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
