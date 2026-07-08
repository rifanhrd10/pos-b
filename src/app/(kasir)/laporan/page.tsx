import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getKasirEmployeeId, getKasirOutletId } from "@/lib/outlet-context";
import { getActiveSession, getEmployeeByUserId } from "@/actions/kasir";
import { getBusinessContext } from "@/lib/auth";
import { LaporanPanel } from "@/components/kasir/laporan-panel";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employeeId = await getKasirEmployeeId();
  const outletId = await getKasirOutletId();
  if (!employeeId || !outletId) redirect("/kasir/pin");

  const ctx = await getBusinessContext(session.user.id!);
  if (!ctx) redirect("/onboarding/business");

  // get active session
  const activeSession = await getActiveSession(employeeId, outletId);
  if (!activeSession) redirect("/kasir/pos");

  const employee = await getEmployeeByUserId(session.user.id!);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* simple header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-slate-50 font-bold">Laporan Shift</h1>
        <a
          href="/kasir/pos"
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          ← Kembali ke POS
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <LaporanPanel
          sessionId={activeSession.id}
          kasirName={employee?.name ?? "Kasir"}
          outletName={ctx.outletName ?? "Outlet"}
        />
      </div>
    </div>
  );
}
