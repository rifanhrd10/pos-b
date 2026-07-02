import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Settings, Search } from "lucide-react";

export default function ButtonsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buttons & Badges"
        description="Variasi tombol, ukuran, status, dan badge untuk berbagai kebutuhan UI."
        breadcrumb="UI Elements / Buttons & Badges"
      />

      {/* Variasi Button */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Variasi Button</h3>
        <p className="mb-4 text-sm text-slate-500">
          Empat varian tombol tersedia: primary, secondary, ghost, dan danger.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Tombol Utama</Button>
          <Button variant="secondary">Tombol Sekunder</Button>
          <Button variant="ghost">Tombol Ghost</Button>
          <Button variant="danger">Tombol Bahaya</Button>
        </div>
      </div>

      {/* Ukuran Button */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Ukuran Button</h3>
        <p className="mb-4 text-sm text-slate-500">
          Tiga ukuran tombol untuk berbagai kebutuhan tampilan.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="px-3 py-1.5 text-xs rounded-xl">Ukuran S</Button>
          <Button>Ukuran M</Button>
          <Button className="px-6 py-3 text-base">Ukuran L</Button>
        </div>
      </div>

      {/* Button dengan Ikon */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Button dengan Ikon</h3>
        <p className="mb-4 text-sm text-slate-500">
          Tombol dilengkapi ikon untuk memperjelas konteks aksi.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus size={16} className="mr-2" />
            Tambah Data
          </Button>
          <Button variant="secondary">
            <Download size={16} className="mr-2" />
            Unduh
          </Button>
          <Button variant="ghost">
            <Settings size={16} className="mr-2" />
            Pengaturan
          </Button>
          <Button variant="secondary" className="h-10 w-10 p-0">
            <Search size={16} />
          </Button>
        </div>
      </div>

      {/* Status Button */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Status Button</h3>
        <p className="mb-4 text-sm text-slate-500">
          Kondisi nonaktif dan loading pada tombol.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Nonaktif</Button>
          <Button disabled className="opacity-70">
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Memproses...
          </Button>
          <Button variant="secondary" disabled>
            Nonaktif Sekunder
          </Button>
        </div>
      </div>

      {/* Badge Tones */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Badge Tones</h3>
        <p className="mb-4 text-sm text-slate-500">
          Lima variasi warna badge untuk berbagai status dan kategori.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge tone="success">Berhasil</Badge>
          <Badge tone="warning">Peringatan</Badge>
          <Badge tone="info">Informasi</Badge>
          <Badge tone="danger">Bahaya</Badge>
        </div>
      </div>

      {/* Badge di Konteks */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Badge di Konteks</h3>
        <p className="mb-4 text-sm text-slate-500">
          Contoh penggunaan badge dalam antarmuka nyata.
        </p>
        <div className="space-y-4">
          {/* Status pesanan */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Status pesanan:</span>
            <Badge tone="success">Selesai</Badge>
          </div>

          {/* Notifikasi */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span className="text-sm text-slate-700">Notifikasi Baru</span>
            </div>
            <Badge tone="info">3</Badge>
          </div>

          {/* Produk stok habis */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-700">Kopi Arabica Premium 250gr</span>
            <Badge tone="danger">Stok Habis</Badge>
          </div>

          {/* Role pengguna */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bayaro-navy text-xs font-semibold text-white">
                ZA
              </div>
              <span className="text-sm text-slate-700">Zaki Admin</span>
            </div>
            <Badge>Admin</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
