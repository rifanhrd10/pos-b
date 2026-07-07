import Link from "next/link";
import { ArrowLeft, Pencil, Store } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getOutlet, toggleOutletStatus } from "@/actions/outlets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";

export default async function OutletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const outlet = await getOutlet(id);

  if (!outlet) notFound();

  async function handleToggleStatus() {
    "use server";

    await toggleOutletStatus(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/outlets" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
            <Store className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{outlet.name}</h1>
            <p className="text-sm text-slate-500">Detail informasi outlet</p>
          </div>
        </div>
        <div className="sm:ml-auto">
          <Badge tone={outlet.isActive ? "success" : "warning"}>{outlet.isActive ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-slate-900">Informasi Outlet</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Alamat:</span> {outlet.address || "-"}
            </div>
            <div>
              <span className="text-slate-500">Kota:</span> {outlet.city || "-"}
            </div>
            <div>
              <span className="text-slate-500">Telepon:</span> {outlet.phone || "-"}
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-slate-900">Jam Operasional</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">Buka:</span> {outlet.openTime || "08:00"}
            </div>
            <div>
              <span className="text-slate-500">Tutup:</span> {outlet.closeTime || "22:00"}
            </div>
            <div>
              <span className="text-slate-500">Karyawan:</span> {outlet.employees.length} orang
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/outlets/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Outlet
          </Button>
        </Link>
        <form action={handleToggleStatus}>
          <Button type="submit" variant="secondary">
            {outlet.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </form>
        <Link href="/outlets">
          <Button variant="ghost">Kembali</Button>
        </Link>
      </div>
    </div>
  );
}
