import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const outlet = session.outletId
    ? await prisma.outlet.findUnique({ where: { id: session.outletId } })
    : null;

  return (
    <DashboardShell userName={session.name} outletName={outlet?.name || "Bayaro POS"}>
      {children}
    </DashboardShell>
  );
}
