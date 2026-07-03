"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleEmployeeStatus, deleteEmployee } from "@/actions/employees";

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  role: { id: string; name: string } | null;
  outlets: { outlet: { id: string; name: string } }[];
};

type Role = { id: string; name: string };
type Outlet = { id: string; name: string };

export function EmployeesClient({
  employees,
  roles,
  outlets,
}: {
  employees: Employee[];
  roles: Role[];
  outlets: Outlet[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRole = !filterRole || emp.role?.id === filterRole;
    const matchOutlet =
      !filterOutlet || emp.outlets.some((o) => o.outlet.id === filterOutlet);
    return matchSearch && matchRole && matchOutlet;
  });

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleEmployeeStatus(id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karyawan"
        description="Kelola semua karyawan bisnis Anda"
        breadcrumb="Operasional / Karyawan"
        actions={
          <Link href="/employees/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Tambah Karyawan
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="sm:w-48">
          <option value="">Semua Role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
        <Select value={filterOutlet} onChange={(e) => setFilterOutlet(e.target.value)} className="sm:w-48">
          <option value="">Semua Outlet</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="Belum ada karyawan" description="Tambahkan karyawan pertama untuk mulai mengelola tim Anda." />
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-4 font-semibold text-slate-600">Nama</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Email</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Role</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Outlet</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">{emp.name}</td>
                  <td className="px-5 py-4 text-slate-600">{emp.email || "-"}</td>
                  <td className="px-5 py-4">
                    {emp.role ? <Badge tone="info">{emp.role.name}</Badge> : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {emp.outlets.length > 0
                        ? emp.outlets.map((o) => (
                            <Badge key={o.outlet.id} tone="default">{o.outlet.name}</Badge>
                          ))
                        : <span className="text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Switch checked={emp.isActive} onChange={() => handleToggle(emp.id)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/employees/${emp.id}/edit`}>
                        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                          <Pencil size={15} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Karyawan">
        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak bisa dibatalkan.
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
