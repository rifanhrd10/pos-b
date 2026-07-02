"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function AlertsPage() {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    title: string;
    message: string;
    tone: "success" | "info" | "warning" | "danger";
  }>({ title: "", message: "", tone: "success" });

  const showToast = (
    title: string,
    message: string,
    tone: typeof toastMsg.tone,
  ) => {
    setToastMsg({ title, message, tone });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const allDismissed =
    dismissed["info-dismissible"] &&
    dismissed["warning-dismissible"] &&
    dismissed["danger-dismissible"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Toast"
        description="Komponen notifikasi: alert inline, alert dengan judul, dismissible, dan toast popup."
        breadcrumb="UI Elements / Alerts"
      />

      {/* Alert Dasar */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Alert Dasar</h3>
        <p className="mb-4 text-sm text-slate-500">
          Empat varian warna alert untuk berbagai jenis notifikasi.
        </p>
        <div className="space-y-3">
          <Alert tone="info">
            Informasi sistem telah diperbarui ke versi terbaru.
          </Alert>
          <Alert tone="success">
            Data berhasil disimpan ke database.
          </Alert>
          <Alert tone="warning">
            Stok produk hampir habis, segera lakukan pengisian.
          </Alert>
          <Alert tone="danger">
            Terjadi kesalahan saat memproses pembayaran.
          </Alert>
        </div>
      </div>

      {/* Alert dengan Judul */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Alert dengan Judul</h3>
        <p className="mb-4 text-sm text-slate-500">
          Alert dilengkapi judul untuk konteks yang lebih jelas.
        </p>
        <div className="space-y-3">
          <Alert tone="success" title="Berhasil!">
            Akun pengguna baru telah dibuat. Email konfirmasi telah dikirim.
          </Alert>
          <Alert tone="warning" title="Perhatian">
            Sesi Anda akan berakhir dalam 5 menit. Simpan pekerjaan Anda sekarang.
          </Alert>
        </div>
      </div>

      {/* Dismissible Alerts */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Alert Dismissible</h3>
        <p className="mb-4 text-sm text-slate-500">
          Alert yang dapat ditutup oleh pengguna dengan menekan tombol X.
        </p>
        {allDismissed ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Semua notifikasi telah ditutup.
          </p>
        ) : (
          <div className="space-y-3">
            {!dismissed["info-dismissible"] && (
              <div className="relative">
                <Alert tone="info" className="pr-10">
                  Pembaruan fitur baru tersedia. Silakan periksa riwayat perubahan.
                </Alert>
                <button
                  onClick={() =>
                    setDismissed((prev) => ({ ...prev, "info-dismissible": true }))
                  }
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-xl text-cyan-600 hover:bg-cyan-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {!dismissed["warning-dismissible"] && (
              <div className="relative">
                <Alert tone="warning" className="pr-10">
                  Batas penggunaan API mendekati limit bulanan Anda.
                </Alert>
                <button
                  onClick={() =>
                    setDismissed((prev) => ({ ...prev, "warning-dismissible": true }))
                  }
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-xl text-amber-600 hover:bg-amber-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {!dismissed["danger-dismissible"] && (
              <div className="relative">
                <Alert tone="danger" className="pr-10">
                  Backup otomatis gagal dilakukan. Periksa koneksi server Anda.
                </Alert>
                <button
                  onClick={() =>
                    setDismissed((prev) => ({ ...prev, "danger-dismissible": true }))
                  }
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Demo */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="mb-1 font-semibold text-slate-900">Toast Notifications</h3>
        <p className="mb-4 text-sm text-slate-500">
          Klik tombol di bawah untuk menampilkan toast notification sementara.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              showToast("Berhasil!", "Data berhasil disimpan.", "success")
            }
          >
            Toast Sukses
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              showToast(
                "Informasi",
                "Sistem akan maintenance pukul 02.00 WIB.",
                "info",
              )
            }
          >
            Toast Info
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              showToast("Peringatan", "Stok hampir habis.", "warning")
            }
          >
            Toast Peringatan
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              showToast("Gagal!", "Koneksi ke server terputus.", "danger")
            }
          >
            Toast Bahaya
          </Button>
        </div>
      </div>

      {/* Toast Overlay */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 w-80 animate-in">
          <Alert tone={toastMsg.tone} title={toastMsg.title} className="shadow-lg">
            {toastMsg.message}
          </Alert>
        </div>
      )}
    </div>
  );
}
