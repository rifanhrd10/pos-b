import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEmployeeByUserId } from "@/actions/kasir";
import { PinScreen } from "./pin-screen";

export const dynamic = "force-dynamic";

export default async function PinPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await getEmployeeByUserId(session.user.id as string);

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="text-red-400 font-medium">
            Akun ini tidak terdaftar sebagai karyawan
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Hubungi administrator untuk mengatur akses kasir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PinScreen
      employeeId={employee.id}
      employeeName={employee.name}
    />
  );
}
