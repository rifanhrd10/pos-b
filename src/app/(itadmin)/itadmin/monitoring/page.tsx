import { getMonitoringData, getBusinessesList } from "@/actions/itadmin"
import { MonitoringClient } from "./monitoring-client"

export default async function MonitoringPage() {
  const [data, businesses] = await Promise.all([
    getMonitoringData(),
    getBusinessesList(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Monitoring</h1>
        <p className="text-sm text-slate-400">Monitoring transaksi dan performa per toko</p>
      </div>
      <MonitoringClient
        initialData={data}
        businesses={businesses.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  )
}
