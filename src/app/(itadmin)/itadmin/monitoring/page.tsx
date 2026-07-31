import { getTenantManagementDashboard } from "@/actions/itadmin"
import { TenantHealthClient } from "./monitoring-client"

export default async function MonitoringPage() {
  const data = await getTenantManagementDashboard()
  if (!data) return <p className="text-red-500">Unauthorized</p>

  return <TenantHealthClient tenants={data.tenants} actionQueue={data.actionQueue} />
}
