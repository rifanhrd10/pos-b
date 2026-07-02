import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  FileText,
  Package,
  BarChart2,
  Settings,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";

const profileInfo = {
  initials: "AB",
  name: "Admin Bayaro",
  role: "Admin",
  joined: "Bergabung 1 Januari 2024",
  stats: [
    { label: "Transaksi Diproses", value: "1.284" },
    { label: "Produk Dikelola", value: "634" },
    { label: "Laporan Dibuat", value: "48" },
  ],
  personal: [
    { label: "Nama Lengkap", value: "Admin Bayaro" },
    { label: "Email", value: "admin@bayaro.id" },
    { label: "No. Telepon", value: "+62 812-3456-7890" },
    { label: "Jabatan", value: "Administrator Sistem" },
    { label: "Lokasi", value: "Jakarta, Indonesia" },
    { label: "Bahasa", value: "Bahasa Indonesia" },
  ],
  bio: "Administrator sistem dengan pengalaman lebih dari 5 tahun dalam pengelolaan platform POS dan operasional kafe berskala menengah hingga besar. Berfokus pada efisiensi operasional, akurasi data, dan peningkatan performa tim kasir.",
  skills: ["Manajemen Sistem", "Laporan Keuangan", "Operasional Outlet", "Pengelolaan Stok", "Analisis Data"],
  activities: [
    { icon: LogIn, text: "Login dari perangkat baru — Chrome / macOS", time: "2 menit lalu" },
    { icon: FileText, text: "Laporan bulanan Juni 2024 dibuat", time: "1 jam lalu" },
    { icon: Package, text: "Produk baru ditambahkan: Oat Milk Latte", time: "3 jam lalu" },
    { icon: BarChart2, text: "Ekspor data penjualan Q2 berhasil", time: "Kemarin" },
    { icon: Settings, text: "Pengaturan notifikasi diperbarui", time: "2 hari lalu" },
  ],
  social: [
    { platform: "LinkedIn", icon: Linkedin, url: "linkedin.com/in/adminbayaro" },
    { platform: "GitHub", icon: Github, url: "github.com/adminbayaro" },
    { platform: "Website", icon: Globe, url: "bayaro.id" },
  ],
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Informasi dan pengaturan akun pengguna Anda."
        breadcrumb="User / Profil"
      />

      {/* Profile Header Card */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-bayaro-navy text-white text-2xl font-bold flex items-center justify-center shrink-0">
            {profileInfo.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{profileInfo.name}</h2>
              <Badge tone="info">{profileInfo.role}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">{profileInfo.joined}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="primary">Edit Profil</Button>
            <Button variant="secondary">Ganti Password</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 mt-6 divide-x divide-slate-200 border-t border-slate-100 pt-6">
          {profileInfo.stats.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="text-2xl font-bold text-bayaro-navy">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Personal Info */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-5">Informasi Pribadi</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {profileInfo.personal.map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-slate-400 font-medium">{field.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-3">Bio</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{profileInfo.bio}</p>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium mb-3">Keahlian</p>
              <div className="flex flex-wrap gap-2">
                {profileInfo.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-bayaro-soft text-bayaro-navy text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Activity */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-5">Aktivitas Terbaru</h3>
            <ul className="space-y-4">
              {profileInfo.activities.map((activity, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-bayaro-soft text-bayaro-navy flex items-center justify-center shrink-0">
                    <activity.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-semibold text-slate-900 mb-5">Tautan Sosial</h3>
            <ul className="space-y-3">
              {profileInfo.social.map((item) => (
                <li key={item.platform} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{item.platform}</p>
                    <p className="text-sm font-medium text-bayaro-blue">{item.url}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
