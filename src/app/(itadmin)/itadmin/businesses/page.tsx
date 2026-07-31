import { getTenantManagementDashboard } from "@/actions/itadmin"
import { TenantManagementPanel } from "./tenant-management-panel"

export default async function ITAdminDashboard() {
  const data = await getTenantManagementDashboard()
  if (!data) return <p className="text-red-500">Unauthorized</p>

  return (
    <TenantManagementPanel
      tenants={data.tenants}
      plans={data.plans}
      stats={data.stats}
      title="Daftar Toko"
      description="Kelola seluruh tenant, status trial, paket langganan, dan masa aktif mereka."
    />
  )
}
