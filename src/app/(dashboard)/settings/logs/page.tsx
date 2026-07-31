import { getTenantLogs } from "@/app/actions/logs";
import { getBusinessContext, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TenantLogsPanel } from "./tenant-logs-panel";

export const dynamic = "force-dynamic";

export default async function TenantLogsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/onboarding/business");

  const logs = await getTenantLogs(ctx.businessId);

  const formattedLogs = logs.map(l => ({
    id: l.id,
    action: l.action,
    userName: l.userName,
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details,
    createdAt: l.createdAt.toISOString()
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Riwayat Aktivitas</h2>
        <p className="text-sm text-slate-500">
          Pantau seluruh aktivitas karyawan dan perubahan sistem di dalam toko Anda.
        </p>
      </div>

      <TenantLogsPanel initialLogs={formattedLogs} />
    </div>
  );
}
