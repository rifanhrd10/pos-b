export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getKasirEmployeeId, getKasirOutletId } from "@/lib/outlet-context";

export default async function KasirLayout({ children }: { children: React.ReactNode }) {
  // Check kasir cookie (PIN-based flow)
  const kasirEmployeeId = await getKasirEmployeeId();
  const kasirOutletId = await getKasirOutletId();
  const isKasirMode = !!(kasirEmployeeId && kasirOutletId);

  // Check NextAuth session (owner/manager flow)
  const session = await auth();
  const isSessionMode = !!(session?.user);

  // Must be authenticated via either method
  if (!isKasirMode && !isSessionMode) {
    redirect("/kasir/enter");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {children}
    </div>
  );
}
