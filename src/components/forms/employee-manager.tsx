"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emitToast } from "@/components/ui/toast-provider";

type RoleOption = { id: string; name: string };
type EmployeeItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleId: string;
  roleName: string;
  outletId: string | null;
  isActive: boolean;
};

export function EmployeeManager({
  initialEmployees,
  roles,
  outletId,
}: {
  initialEmployees: EmployeeItem[];
  roles: RoleOption[];
  outletId: string;
}) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [editing, setEditing] = useState<EmployeeItem | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const roleOptions = useMemo(
    () => ["all", ...Array.from(new Set(initialEmployees.map((employee) => employee.roleName)))],
    [initialEmployees],
  );

  const filteredEmployees = useMemo(
    () =>
      employees.filter((user) => {
        const haystack = [user.name, user.email, user.phone, user.roleName].join(" ").toLowerCase();
        const matchQuery = haystack.includes(query.toLowerCase());
        const matchStatus = statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);
        const matchRole = roleFilter === "all" || user.roleName === roleFilter;
        return matchQuery && matchStatus && matchRole;
      }),
    [employees, query, statusFilter, roleFilter],
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      roleId: String(formData.get("roleId") || ""),
      outletId,
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan karyawan.");
        emitToast({ tone: "error", title: "Karyawan gagal disimpan", description: result.message });
        return;
      }

      setEmployees((prev) =>
        editing ? prev.map((item) => (item.id === editing.id ? result : item)) : [result, ...prev],
      );
      setOpen(false);
      setEditing(null);
      setError(null);
      emitToast({ tone: "success", title: editing ? "Karyawan diperbarui" : "Karyawan ditambahkan" });
    });
  }

  function deactivate(id: string) {
    const ok = window.confirm("Nonaktifkan karyawan ini? Akun tidak akan dihapus permanen.");
    if (!ok) return;

    startTransition(async () => {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menonaktifkan karyawan.");
        emitToast({ tone: "error", title: "Karyawan gagal dinonaktifkan", description: result.message });
        return;
      }

      setEmployees((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
      );
      setError(null);
      emitToast({ tone: "success", title: "Karyawan dinonaktifkan", description: result.message });
    });
  }

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Daftar Karyawan</h2>
            <p className="mt-2 text-sm text-slate-500">Tambah, edit, atau nonaktifkan akun operasional tanpa menghapus histori transaksi.</p>
          </div>
          <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus size={16} />
            Tambah Karyawan
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <Input placeholder="Cari nama, email, role, atau nomor HP..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role === "all" ? "Semua role" : role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filteredEmployees.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-3xl border border-slate-100 p-4">
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email} • {user.roleName}</p>
              {user.phone ? <p className="mt-1 text-xs text-slate-400">{user.phone}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={user.isActive ? "success" : "default"}>{user.isActive ? "Aktif" : "Nonaktif"}</Badge>
              <Button variant="secondary" onClick={() => { setEditing(user); setOpen(true); }}>
                <Pencil size={16} />
              </Button>
              <Button variant="danger" onClick={() => deactivate(user.id)} disabled={!user.isActive || pending}>
                <UserX size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!filteredEmployees.length ? <div className="rounded-3xl border border-slate-100 p-4 text-sm text-slate-500">Tidak ada karyawan yang cocok.</div> : null}
      </div>

      {error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">{editing ? "Edit Karyawan" : "Tambah Karyawan"}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {editing ? "Perbarui data user yang sudah ada." : "Akun baru akan dibuat dengan password default `password123`."}
              </p>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama</label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <Input name="email" type="email" defaultValue={editing?.email} required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nomor HP</label>
                    <Input name="phone" defaultValue={editing?.phone || ""} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                  <select
                    name="roleId"
                    defaultValue={editing?.roleId || ""}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
                  >
                    <option value="" disabled>Pilih role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
                  Karyawan aktif
                </label>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Karyawan"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
