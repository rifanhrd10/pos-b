import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TourGuide } from "@/components/shared/tour-guide";
import { auth, getBusinessContext } from "@/lib/auth";
import { ALL_PERMISSIONS, getCurrentEmployeePermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOutletId } from "@/lib/outlet-context";
import { Toaster } from "sonner";

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
  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id, businessId, isActive: true },
    include: { role: true },
  });
  const employeePermissions = (employee?.role?.permissions as string[]) ?? [];
  const userRole = employee?.role?.name || "Admin";
  const isOwner = userRole.toLowerCase() === "owner";
  // Owner adalah administrator tertinggi di dalam bisnisnya sendiri. Paket tetap
  // mengatur limit/fitur berbayar, tetapi tidak menyembunyikan menu administrasi.
  const permissions = isOwner
    ? ALL_PERMISSIONS
    : employeePermissions.length > 0
      ? employeePermissions
      : ALL_PERMISSIONS;
  const hasCompletedTour = session?.user?.hasCompletedTour ?? true;

  const outlets = await prisma.outlet.findMany({
    where: { businessId, isActive: true },
    select: { id: true, name: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  const activeOutletId = await getActiveOutletId();
  const outletName = outlets.find((o) => o.id === activeOutletId)?.name || ctx.businessName;

  // Fetch subscription/plan info
  const subscription = await prisma.subscription.findUnique({
    where: { businessId },
    include: { plan: true },
  });
  const plan = subscription
    ? { name: subscription.plan.name, displayName: subscription.plan.displayName, status: subscription.status }
    : null;
  const planFeatures = (subscription?.plan.features as string[]) || [];
  const visiblePlanFeatures = isOwner ? [] : planFeatures;

  return (
    <>
      <DashboardShell
        userName={userName}
        userRole={userRole}
        businessName={ctx.businessName}
        outletName={outletName}
        permissions={permissions}
        planFeatures={visiblePlanFeatures}
        outlets={outlets}
        activeOutletId={activeOutletId}
        plan={plan}
      >
        {children}
      </DashboardShell>
      <TourGuide hasCompletedTour={hasCompletedTour} />
      <Toaster position="top-right" />
    </>
  );
}
