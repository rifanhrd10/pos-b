import { auth } from "@/lib/auth";
import { getEmployee } from "@/actions/employees";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const employee = await getEmployee(id);
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <button className="inline-flex items-center justify-center rounded-2xl bg-transparent p-2.5 text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        <Badge tone={employee.isActive ? "success" : "warning"}>
          {employee.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-slate-900">Informasi Karyawan</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Email</span>
              <span className="col-span-2 font-medium text-slate-900">{employee.email || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Telepon</span>
              <span className="col-span-2 font-medium text-slate-900">{employee.phone || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Role</span>
              <span className="col-span-2 font-medium text-slate-900">{employee.role?.name || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">PIN</span>
              <span className="col-span-2 font-medium text-slate-900">{employee.pin ? "••••" : "Belum diset"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Bergabung</span>
              <span className="col-span-2 font-medium text-slate-900">
                {new Date(employee.startDate).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-slate-900">Penugasan Outlet</h2>
          {employee.outlets && employee.outlets.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {employee.outlets.map((eo) => (
                <li key={eo.outletId} className="flex items-center gap-2 font-medium text-slate-900">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  {eo.outlet?.name || "Unknown"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Belum ditugaskan ke outlet</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Link href={`/employees/${employee.id}/edit`}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>
    </div>
  );
}
