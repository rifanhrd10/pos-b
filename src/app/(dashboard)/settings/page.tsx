"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotif: true,
    pushNotif: false,
    weeklyReport: true,
    monthlyReport: false,
    darkMode: false,
    compactMode: false,
    twoFactor: false,
    loginAlert: true,
    dataSharing: false,
    analytics: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi notifikasi, tampilan, keamanan, dan privasi akun Anda."
        breadcrumb="User / Pengaturan"
      />

      {/* Notifikasi */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="font-semibold text-slate-900 mb-1">Notifikasi</h3>
        <p className="text-sm text-slate-500 mb-6">Atur cara Anda menerima pemberitahuan.</p>
        <div className="space-y-5">
          <SwitchRow
            label="Notifikasi Email"
            description="Terima ringkasan harian via email"
            checked={settings.emailNotif}
            onChange={() => toggle("emailNotif")}
          />
          <SwitchRow
            label="Notifikasi Push"
            description="Notifikasi real-time di browser"
            checked={settings.pushNotif}
            onChange={() => toggle("pushNotif")}
          />
          <SwitchRow
            label="Laporan Mingguan"
            description="Ringkasan penjualan setiap Senin"
            checked={settings.weeklyReport}
            onChange={() => toggle("weeklyReport")}
          />
          <SwitchRow
            label="Laporan Bulanan"
            description="Ringkasan bulanan di akhir bulan"
            checked={settings.monthlyReport}
            onChange={() => toggle("monthlyReport")}
          />
        </div>
      </div>

      {/* Tampilan */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="font-semibold text-slate-900 mb-1">Tampilan</h3>
        <p className="text-sm text-slate-500 mb-6">Sesuaikan tampilan antarmuka Anda.</p>
        <div className="space-y-5">
          <SwitchRow
            label="Mode Gelap"
            description="Aktifkan tema gelap pada antarmuka"
            checked={settings.darkMode}
            onChange={() => toggle("darkMode")}
          />
          <SwitchRow
            label="Mode Kompak"
            description="Tampilkan lebih banyak konten dalam satu layar"
            checked={settings.compactMode}
            onChange={() => toggle("compactMode")}
          />
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Bahasa</label>
              <Select>
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Zona Waktu</label>
              <Select>
                <option value="wib">WIB — UTC+7</option>
                <option value="wita">WITA — UTC+8</option>
                <option value="wit">WIT — UTC+9</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Keamanan */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="font-semibold text-slate-900 mb-1">Keamanan</h3>
        <p className="text-sm text-slate-500 mb-6">Lindungi akun Anda dengan lapisan keamanan tambahan.</p>
        <div className="space-y-5">
          <SwitchRow
            label="Autentikasi Dua Faktor"
            description="Tambahkan verifikasi ekstra saat login"
            checked={settings.twoFactor}
            onChange={() => toggle("twoFactor")}
          />
          <SwitchRow
            label="Notifikasi Login dari Perangkat Baru"
            description="Kirim email jika ada login dari perangkat yang belum dikenal"
            checked={settings.loginAlert}
            onChange={() => toggle("loginAlert")}
          />
        </div>
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
          <Button variant="ghost">Lihat Sesi Aktif</Button>
          <Button variant="danger">Keluar Semua Perangkat</Button>
        </div>
      </div>

      {/* Privasi */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="font-semibold text-slate-900 mb-1">Privasi</h3>
        <p className="text-sm text-slate-500 mb-6">Kontrol data yang Anda bagikan kepada kami.</p>
        <div className="space-y-5">
          <SwitchRow
            label="Berbagi Data Anonim"
            description="Bantu kami meningkatkan produk"
            checked={settings.dataSharing}
            onChange={() => toggle("dataSharing")}
          />
          <SwitchRow
            label="Analitik Penggunaan"
            description="Izinkan pelacakan fitur yang sering digunakan"
            checked={settings.analytics}
            onChange={() => toggle("analytics")}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 -mb-6 px-6 py-4 rounded-b-[28px] flex items-center justify-between">
        <p className="text-sm text-slate-400">Pengaturan tersimpan otomatis</p>
        <Button variant="primary">Simpan Perubahan</Button>
      </div>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
