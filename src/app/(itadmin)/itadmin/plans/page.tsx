import { getPlansList } from "@/actions/itadmin"
import { PlansClient } from "./plans-client"

// All available feature keys
const ALL_FEATURE_KEYS = [
  { key: "dashboard.view", label: "Dashboard" },
  { key: "pos.access", label: "POS Kasir" },
  { key: "products.view", label: "Lihat Produk" },
  { key: "products.manage", label: "Kelola Produk" },
  { key: "inventory.view", label: "Lihat Inventori" },
  { key: "inventory.manage", label: "Kelola Inventori" },
  { key: "employees.view", label: "Lihat Karyawan" },
  { key: "employees.manage", label: "Kelola Karyawan" },
  { key: "reports.view", label: "Laporan" },
  { key: "settings.manage", label: "Pengaturan" },
  { key: "promos.view", label: "Lihat Promo" },
  { key: "promos.manage", label: "Kelola Promo" },
  { key: "customers.view", label: "Lihat Pelanggan" },
  { key: "customers.manage", label: "Kelola Pelanggan" },
  { key: "shift.access", label: "Shift Management" },
  { key: "multi_outlet", label: "Multi Outlet" },
  { key: "export", label: "Export Data" },
  { key: "advanced_reports", label: "Laporan Advanced" },
  { key: "api", label: "API Access" },
  { key: "priority_support", label: "Priority Support" },
]

export default async function PlansPage() {
  const plans = await getPlansList()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paket & Harga</h1>
        <p className="text-sm text-slate-400">Atur plan, harga, dan fitur yang bisa diakses per paket</p>
      </div>
      <PlansClient plans={plans} featureKeys={ALL_FEATURE_KEYS} />
    </div>
  )
}
