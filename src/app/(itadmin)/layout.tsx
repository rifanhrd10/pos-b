import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ITAdminShell } from "@/components/itadmin/itadmin-shell";

export const dynamic = "force-dynamic";

export default async function ITAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "itadmin") {
    redirect("/dashboard");
  }

  return (
    <ITAdminShell userName={session.user.name || "IT Admin"}>
      {children}
    </ITAdminShell>
  );
}
