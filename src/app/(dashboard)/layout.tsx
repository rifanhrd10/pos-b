import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TourGuide } from "@/components/shared/tour-guide";
import { auth, getBusinessContext } from "@/lib/auth";
import { ALL_PERMISSIONS, getCurrentEmployeePermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOutletId } from "@/lib/outlet-context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const ctx = await getBusinessContext(session.user.id!);
  const userName = session.user.name || "User";

  // If no business, redirect to onboarding
  if (!ctx) {
    redirect("/onboarding/business");
  }

  const businessId = ctx.businessId;
  const employeePermissions = await getCurrentEmployeePermissions(session.user.id!, businessId);
  const permissions = employeePermissions.length > 0 ? employeePermissions : ALL_PERMISSIONS;
  const hasCompletedTour = session?.user?.hasCompletedTour ?? true;

  const outlets = await prisma.outlet.findMany({
    where: { businessId, isActive: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  const activeOutletId = await getActiveOutletId();
  const outletName = outlets.find((o) => o.id === activeOutletId)?.name || ctx.businessName;

  return (
    <>
      <DashboardShell
        userName={userName}
        outletName={outletName}
        permissions={permissions}
        outlets={outlets}
        activeOutletId={activeOutletId}
      >
        {children}
      </DashboardShell>
      <TourGuide hasCompletedTour={hasCompletedTour} />
    </>
  );
}
