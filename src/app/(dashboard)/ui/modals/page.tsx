"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function ModalsPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [largeOpen, setLargeOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modals & Dialogs"
        description="Berbagai jenis modal dan dialog untuk konfirmasi, form, dan notifikasi."
        breadcrumb="UI Elements / Modals"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Modal Dasar */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-900">Modal Dasar</h3>
          <p className="mb-4 text-sm text-slate-500">
            Modal standar dengan header dan tombol tutup.
          </p>
          <Button onClick={() => setBasicOpen(true)}>Buka Modal Dasar</Button>
        </div>

        {/* Dialog Konfirmasi */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-900">Dialog Konfirmasi</h3>
          <p className="mb-4 text-sm text-slate-500">
            Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan.
          </p>
          <Button onClick={() => setConfirmOpen(true)}>Buka Konfirmasi</Button>
        </div>

        {/* Modal Form */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-900">Modal Form</h3>
          <p className="mb-4 text-sm text-slate-500">
            Modal yang berisi form input data pengguna.
          </p>
          <Button onClick={() => setFormOpen(true)}>Buka Form Modal</Button>
        </div>

        {/* Modal Besar */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-900">Modal Besar</h3>
          <p className="mb-4 text-sm text-slate-500">
            Modal ukuran besar untuk konten yang lebih kompleks.
          </p>
          <Button onClick={() => setLargeOpen(true)}>Buka Modal Besar</Button>
        </div>

        {/* Dialog Bahaya */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-900">Dialog Bahaya</h3>
          <p className="mb-4 text-sm text-slate-500">
            Dialog peringatan merah untuk aksi destruktif.
          </p>
          <Button variant="danger" onClick={() => setDangerOpen(true)}>
            Buka Dialog Bahaya
          </Button>
        </div>
      </div>

      {/* Modal Dasar */}
      <Modal open={basicOpen} onClose={() => setBasicOpen(false)} title="Modal Dasar">
        <p className="text-sm text-slate-600">
          Ini adalah contoh modal dasar dengan header bertajuk dan tombol tutup di pojok kanan atas.
          Modal ini dapat digunakan untuk menampilkan informasi tambahan, detail konten, atau pesan
          notifikasi kepada pengguna. Klik di luar area modal atau tombol X untuk menutupnya.
        </p>
      </Modal>

      {/* Dialog Konfirmasi */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Konfirmasi Aksi"
        size="sm"
      >
        <p className="mb-5 text-sm text-slate-600">
          Apakah Anda yakin ingin melanjutkan aksi ini? Tindakan yang telah dilakukan tidak dapat
          dibatalkan dan akan berdampak permanen pada data Anda.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Batal
          </Button>
          <Button onClick={() => setConfirmOpen(false)}>Konfirmasi</Button>
        </div>
      </Modal>

      {/* Modal Form */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Tambah Pengguna Baru"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <Input placeholder="Masukkan nama lengkap" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Alamat Email
            </label>
            <Input type="email" placeholder="nama@contoh.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <Input placeholder="Contoh: Admin, Kasir, Manajer" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => setFormOpen(false)}>Simpan Pengguna</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Besar */}
      <Modal
        open={largeOpen}
        onClose={() => setLargeOpen(false)}
        title="Detail Laporan Penjualan"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left font-semibold text-slate-700">Produk</th>
                <th className="pb-3 text-left font-semibold text-slate-700">Kategori</th>
                <th className="pb-3 text-right font-semibold text-slate-700">Terjual</th>
                <th className="pb-3 text-right font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-slate-800">Kopi Arabica Premium</td>
                <td className="py-3 text-slate-500">Minuman</td>
                <td className="py-3 text-right text-slate-800">142</td>
                <td className="py-3 text-right text-slate-800">Rp 2.840.000</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-800">Croissant Butter</td>
                <td className="py-3 text-slate-500">Makanan</td>
                <td className="py-3 text-right text-slate-800">98</td>
                <td className="py-3 text-right text-slate-800">Rp 1.960.000</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-800">Teh Tarik Special</td>
                <td className="py-3 text-slate-500">Minuman</td>
                <td className="py-3 text-right text-slate-800">76</td>
                <td className="py-3 text-right text-slate-800">Rp 912.000</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-800">Sandwich Tuna</td>
                <td className="py-3 text-slate-500">Makanan</td>
                <td className="py-3 text-right text-slate-800">55</td>
                <td className="py-3 text-right text-slate-800">Rp 1.375.000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td colSpan={2} className="pt-3 font-semibold text-slate-900">
                  Total Keseluruhan
                </td>
                <td className="pt-3 text-right font-semibold text-slate-900">371</td>
                <td className="pt-3 text-right font-semibold text-slate-900">Rp 7.087.000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Modal>

      {/* Dialog Bahaya */}
      <Modal
        open={dangerOpen}
        onClose={() => setDangerOpen(false)}
        title="Hapus Data Permanen"
        size="sm"
      >
        <div className="space-y-4">
          <Alert tone="danger" title="Tindakan Ini Tidak Bisa Dibatalkan">
            Semua data yang terkait akan dihapus secara permanen dari sistem dan tidak dapat
            dipulihkan kembali.
          </Alert>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDangerOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => setDangerOpen(false)}>
              Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
