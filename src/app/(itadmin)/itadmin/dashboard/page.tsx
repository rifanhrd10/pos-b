import {
  getITAdminDashboardStats,
  getSystemStats,
  getTenantManagementDashboard
} from "@/actions/itadmin";
import { getITAdminLogs } from "@/app/actions/logs";
import { OverviewPanel } from "./overview-panel";

export const dynamic = "force-dynamic";

export default async function ITAdminDashboard() {
  const [stats, systemStats, tenantDashboard, allLogs] = await Promise.all([
    getITAdminDashboardStats(),
    getSystemStats(),
    getTenantManagementDashboard(),
    getITAdminLogs("SYSTEM") // Only fetch IT admin (SYSTEM) logs
  ]);

  if (!stats || !systemStats || !tenantDashboard) {
    return <p className="text-red-500">Unauthorized</p>;
  }

  // Format the logs nicely for the dashboard overview
  const recentLogs = allLogs.slice(0, 5).map(l => ({
    id: l.id,
    action: l.action,
    userName: l.userName,
    tenantName: l.business?.name || "System Admin",
    entityType: l.entityType,
    createdAt: l.createdAt.toISOString()
  }));

  return (
    <OverviewPanel
      stats={stats}
      systemStats={systemStats}
      actionQueue={tenantDashboard.actionQueue}
      recentLogs={recentLogs}
    />
  );
}
