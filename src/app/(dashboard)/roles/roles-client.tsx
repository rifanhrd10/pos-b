"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Shield, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteRole } from "@/actions/roles";
import { PERMISSIONS } from "@/lib/permissions";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: unknown;
  isSystem: boolean;
  _count: { employees: number };
};

const PERMISSION_CATEGORIES: Record<string, string[]> = {
  Dashboard: ["dashboard.view"],
  POS: ["pos.access", "pos.void", "pos.refund", "pos.discount"],
  Produk: ["products.view", "products.manage", "products.pricing"],
  Inventori: ["inventory.view", "inventory.manage"],
  Laporan: ["reports.view", "reports.export"],
  Karyawan: ["employees.view", "employees.manage"],
  Outlet: ["outlets.view", "outlets.manage"],
  Pengaturan: ["settings.manage", "settings.roles"],
  Pelanggan: ["customers.view", "customers.manage"],
  Promo: ["promos.view", "promos.manage"],
};

export function RolesClient({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteRole(deleteId);
      if (result.error) {
        alert(result.error);
      }
      setDeleteId(null);
      router.refresh();
    });
  }

  function getPermissionCount(role: Role): number {
    const perms = role.permissions as string[] | null;
    return perms?.length ?? 0;
  }

  function roleHasPermission(role: Role, perm: string): boolean {
    const perms = role.permissions as string[] | null;
    return perms?.includes(perm) ?? false;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Hak Akses"
        description="Kelola role dan permission untuk karyawan"
        breadcrumb="Operasional / Role & Akses"
        actions={
          <Link href="/roles/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Buat Role Baru
            </Button>
          </Link>
        }
      />

      {roles.length === 0 ? (
        <EmptyState title="Belum ada role" description="Buat role pertama untuk mengatur hak akses karyawan." />
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-[24px] border border-slate-200 bg-white shadow-soft">
              {/* Role Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Shield size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{role.name}</h3>
                      {role.isSystem && <Badge tone="info">Sistem</Badge>}
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-sm text-slate-500">{role.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-slate-500">{role._count.employees} karyawan</p>
                    <p className="text-slate-400">{getPermissionCount(role)} permission</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                      className="rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {expandedRole === role.id ? "Tutup" : "Lihat Akses"}
                    </button>
                    {!role.isSystem && (
                      <>
                        <Link href={`/roles/${role.id}/edit`}>
                          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <Pencil size={15} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(role.id)}
                          className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Matrix */}
              {expandedRole === role.id && (
                <div className="border-t border-slate-100 px-6 py-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 pr-4 font-semibold text-slate-600">Kategori</th>
                          <th className="pb-3 pr-4 font-semibold text-slate-600">Permission</th>
                          <th className="pb-3 text-center font-semibold text-slate-600">Akses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) =>
                          perms.map((perm, idx) => (
                            <tr key={perm} className="border-b border-slate-50 last:border-0">
                              {idx === 0 && (
                                <td rowSpan={perms.length} className="py-2 pr-4 align-top font-medium text-slate-700">
                                  {category}
                                </td>
                              )}
                              <td className="py-2 pr-4 text-slate-600">
                                {PERMISSIONS[perm as keyof typeof PERMISSIONS]}
                              </td>
                              <td className="py-2 text-center">
                                {roleHasPermission(role, perm) ? (
                                  <span className="inline-block h-4 w-4 rounded-full bg-emerald-500" />
                                ) : (
                                  <span className="inline-block h-4 w-4 rounded-full bg-slate-200" />
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Role">
        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus role ini? Pastikan tidak ada karyawan yang menggunakan role ini.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
