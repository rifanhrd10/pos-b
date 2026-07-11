import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/permissions";

const CATEGORY_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  pos: "POS / Kasir",
  products: "Produk",
  inventory: "Inventaris",
  reports: "Laporan",
  employees: "Karyawan",
  outlets: "Outlet",
  settings: "Pengaturan",
  customers: "Pelanggan",
  promos: "Promo",
};

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;
  const { id } = await params;

  const role = await prisma.role.findUnique({
    where: { id },
    include: { business: { select: { name: true } } },
  });
  if (!role) notFound();

  const perms = (role.permissions as string[] | undefined) ?? [];
  
  // Group permissions by their prefix (e.g. "pos.access" -> "pos")
  const grouped = perms.reduce<Record<string, string[]>>((acc, p) => {
    const [cat] = p.split(".");
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/roles">
          <button className="inline-flex items-center justify-center rounded-2xl bg-transparent p-2.5 text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Shield className="h-6 w-6 text-slate-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{role.name}</h1>
            {role.isSystem && (
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">
                Sistem
              </span>
            )}
          </div>
          {role.description && <p className="text-sm text-slate-500 mt-1">{role.description}</p>}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft space-y-5">
        <h2 className="font-semibold text-slate-900">Hak Akses (Permissions)</h2>
        
        {perms.length === 0 ? (
          <p className="text-sm text-slate-400">Tidak ada hak akses khusus.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, catPerms]) => (
              <div key={cat} className="space-y-2.5">
                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">
                  {CATEGORY_LABELS[cat] || cat}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catPerms.map((p) => (
                    <span key={p} className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {PERMISSIONS[p as keyof typeof PERMISSIONS] || p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!role.isSystem && (
        <div className="flex gap-2">
          <Link href={`/roles/${role.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Edit Role
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
