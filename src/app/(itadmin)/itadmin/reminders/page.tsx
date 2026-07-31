import { AnnouncementManagementPanel } from "./reminder-management-panel"

export const dynamic = "force-dynamic"

export default function RemindersPage() {
  // Data simulasi awal (mock)
  const initialRules = [
    { 
      id: "1", 
      triggerType: "billing" as const,
      daysBefore: 7, 
      title: "Masa Aktif Hampir Habis", 
      message: "Toko Anda akan berakhir dalam {days} hari. Silakan lakukan transfer perpanjangan dan konfirmasi ke admin untuk menghindari penangguhan fitur.", 
      isActive: true, 
      type: "warning" as const,
      actionText: "Saya Sudah Transfer"
    },
    { 
      id: "2", 
      triggerType: "general_once" as const,
      title: "✨ Fitur Laporan AI Telah Rilis!", 
      message: "Kini Anda bisa menggunakan kecerdasan buatan untuk merangkum laporan harian toko Anda. Coba sekarang!", 
      isActive: true, 
      type: "success" as const,
      actionText: "Coba Fitur AI"
    },
    { 
      id: "3", 
      triggerType: "general_always" as const,
      title: "Peringatan Pemeliharaan Server", 
      message: "Sistem akan mengalami pemeliharaan rutin pada tengah malam ini. Pastikan semua transaksi sudah diselesaikan.", 
      isActive: false, 
      type: "danger" as const,
      actionText: "Saya Mengerti"
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <AnnouncementManagementPanel initialRules={initialRules} />
    </div>
  )
}
