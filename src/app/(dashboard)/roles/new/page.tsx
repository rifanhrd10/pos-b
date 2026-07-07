"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRole } from "@/actions/roles";
import { PERMISSIONS } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";

const PERMISSION_CATEGORIES: Record<string, Permission[]> = {
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

export default function NewRolePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  function togglePermission(perm: string) {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function toggleCategory(perms: string[]) {
    const allSelected = perms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !perms.includes(p)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...perms])]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);
    const form = new FormData(e.currentTarget);
    form.set("permissions", JSON.stringify(selectedPermissions));

    try {
      const result = await createRole(form);
      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        router.push("/roles");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Role Baru"
        description="Tentukan hak akses untuk role karyawan"
        breadcrumb="Operasional / Role & Akses / Buat Baru"
      />

      <div className="mx-auto max-w-3xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Role *</label>
              <Input name="name" required placeholder="cth: Supervisor" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</label>
              <Input name="description" placeholder="Deskripsi singkat role ini" />
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Hak Akses ({selectedPermissions.length} dipilih)
            </label>
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => {
                const allSelected = perms.every((p) => selectedPermissions.includes(p));
                const someSelected = perms.some((p) => selectedPermissions.includes(p));

                return (
                  <div key={category} className="rounded-xl border border-slate-100 p-4">
                    {/* Category Header */}
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={() => toggleCategory(perms)}
                        className="h-4 w-4 rounded border-slate-300 text-bayaro-navy focus:ring-bayaro-blue"
                      />
                      <span className="text-sm font-semibold text-slate-800">{category}</span>
                    </label>

                    {/* Permissions */}
                    <div className="ml-7 mt-2 space-y-1.5">
                      {perms.map((perm) => (
                        <label key={perm} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm)}
                            onChange={() => togglePermission(perm)}
                            className="h-4 w-4 rounded border-slate-300 text-bayaro-navy focus:ring-bayaro-blue"
                          />
                          <span className="text-sm text-slate-600">{PERMISSIONS[perm]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
