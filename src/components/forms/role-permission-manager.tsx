"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { emitToast } from "@/components/ui/toast-provider";

type RoleItem = {
  id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
};

type PermissionItem = {
  id: string;
  module: string;
  action: string;
  description: string | null;
};

export function RolePermissionManager({
  initialRoles,
  permissions,
}: {
  initialRoles: RoleItem[];
  permissions: PermissionItem[];
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [activeRoleId, setActiveRoleId] = useState(initialRoles[0]?.id || "");
  const [pending, startTransition] = useTransition();

  const activeRole = roles.find((role) => role.id === activeRoleId) || roles[0];

  const permissionGroups = useMemo(() => {
    const grouped = new Map<string, PermissionItem[]>();
    permissions.forEach((permission) => {
      grouped.set(permission.module, [...(grouped.get(permission.module) || []), permission]);
    });
    return Array.from(grouped.entries());
  }, [permissions]);

  function togglePermission(permissionId: string) {
    if (!activeRole) return;
    setRoles((prev) =>
      prev.map((role) =>
        role.id !== activeRole.id
          ? role
          : {
              ...role,
              permissionIds: role.permissionIds.includes(permissionId)
                ? role.permissionIds.filter((id) => id !== permissionId)
                : [...role.permissionIds, permissionId],
            },
      ),
    );
  }

  function save() {
    if (!activeRole) return;
    startTransition(async () => {
      const response = await fetch("/api/role-permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: activeRole.id,
          permissionIds: activeRole.permissionIds,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        emitToast({ tone: "error", title: "Gagal menyimpan role permission", description: result.message });
        return;
      }
      emitToast({ tone: "success", title: "Role permission diperbarui", description: result.message });
    });
  }

  if (!activeRole) {
    return <div className="rounded-[24px] bg-white p-6 text-sm text-slate-500 shadow-soft">Belum ada role yang tersedia.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[24px] bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
        <div className="mt-4 space-y-3">
          {roles.map((role) => {
            const active = role.id === activeRole.id;
            return (
              <button
                key={role.id}
                className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
                  active ? "border-bayaro-blue bg-bayaro-soft" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                onClick={() => setActiveRoleId(role.id)}
              >
                <p className="font-semibold text-slate-900">{role.name}</p>
                <p className="mt-2 text-sm text-slate-500">{role.description || "Role operasional Bayaro."}</p>
                <p className="mt-3 text-xs font-semibold text-bayaro-blue">{role.permissionIds.length} permission aktif</p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-[24px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-bayaro-blue">Hak Akses Role</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeRole.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Aktifkan atau nonaktifkan izin per modul untuk role ini. Perubahan disimpan ke tabel permission dan role permission Bayaro.
            </p>
          </div>
          <Button onClick={save} disabled={pending}>{pending ? "Menyimpan..." : "Simpan Hak Akses"}</Button>
        </div>

        <div className="mt-6 space-y-5">
          {permissionGroups.map(([module, items]) => (
            <div key={module} className="rounded-[20px] border border-slate-200 p-5">
              <div className="mb-4">
                <p className="text-lg font-semibold capitalize text-slate-900">{module.replace(/-/g, " ")}</p>
                <p className="mt-1 text-sm text-slate-500">Atur aksi yang boleh diakses pada modul ini.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((permission) => {
                  const checked = activeRole.permissionIds.includes(permission.id);
                  return (
                    <label key={permission.id} className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${checked ? "border-bayaro-blue bg-bayaro-soft" : "border-slate-200 bg-white"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-semibold capitalize text-slate-900">{permission.action}</span>
                        <span className="mt-1 block text-slate-500">{permission.description || `${module} - ${permission.action}`}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
