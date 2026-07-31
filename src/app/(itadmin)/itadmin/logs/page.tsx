import { getITAdminLogs, getAllBusinessesForFilter } from "@/app/actions/logs";
import { ActivityLogsPanel } from "./activity-logs-panel";

export const dynamic = "force-dynamic";

export default async function ITAdminLogsPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.businessId || null;
  const logs = await getITAdminLogs(filter);
  const businesses = await getAllBusinessesForFilter();

  const formattedLogs = logs.map(l => ({
    id: l.id,
    action: l.action,
    userName: l.userName,
    tenantName: l.business?.name || "System Admin",
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details,
    createdAt: l.createdAt.toISOString()
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <ActivityLogsPanel initialLogs={formattedLogs} businesses={businesses} currentFilter={filter} />
    </div>
  );
}
