import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const ctx = await getBusinessContext(session.user.id!);
  const userName = session.user.name || "User";
  const outletName = ctx?.outletName || ctx?.businessName || "Bayaro";

  // If no business, redirect to onboarding
  if (!ctx) {
    redirect("/onboarding/business");
  }

  return (
    <DashboardShell userName={userName} outletName={outletName}>
      {children}
    </DashboardShell>
  );
}
