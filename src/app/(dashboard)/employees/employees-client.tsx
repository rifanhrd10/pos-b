"use client";

import { useState, useTransition } from "react";
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
import { toggleEmployeeStatus, deleteEmployee, createEmployee, updateEmployee } from "@/actions/employees";
import { toast } from "sonner";

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  pin: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [error, setError] = useState("");

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRole = !filterRole || emp.role?.id === filterRole;
    const matchOutlet =
      !filterOutlet || emp.outlets.some((o) => o.outlet.id === filterOutlet);
    return matchSearch && matchRole && matchOutlet;
  });

  function handleToggle(id: string, currentStatus: boolean) {
    startTransition(async () => {
      const res = await toggleEmployeeStatus(id);
      if (res.error) {
        toast.error("Gagal mengubah status: " + res.error);
      } else {
        toast.success(`Karyawan berhasil di${currentStatus ? 'nonaktifkan' : 'aktifkan'}`);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const res = await deleteEmployee(deleteId);
      if ((res as any).error) {
        toast.error("Gagal menghapus karyawan");
      } else {
        toast.success("Karyawan berhasil dihapus");
        setDeleteId(null);
        router.refresh();
      }
    });
  }

  function openCreateModal() {
    setEditingEmployee(null);
    setSelectedOutlets([]);
    setSelectedRoleId("");
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(emp: Employee) {
    setEditingEmployee(emp);
    setSelectedOutlets(emp.outlets.map(o => o.outlet.id));
    setSelectedRoleId(emp.role?.id || "");
    setError("");
    setIsModalOpen(true);
  }

  function toggleOutlet(id: string) {
    setSelectedOutlets((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    form.set("outletIds", JSON.stringify(selectedOutlets));

    try {
      let result;
      if (editingEmployee) {
        result = await updateEmployee(editingEmployee.id, form);
      } else {
        result = await createEmployee(form);
      }

      if (result.error) {
        setError(result.error);
      } else {
        toast.success(`Karyawan berhasil di${editingEmployee ? 'perbarui' : 'tambahkan'}`);
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karyawan"
        description="Kelola semua karyawan bisnis Anda"
        breadcrumb="Operasional / Karyawan"
        actions={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-2" />
            Tambah Karyawan
          </Button>
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
                    <Switch checked={emp.isActive} onChange={() => handleToggle(emp.id, emp.isActive)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil size={15} />
                      </button>
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

      {/* Employee Form Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? "Edit Karyawan" : "Tambah Karyawan"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
            <Input name="name" required placeholder="Nama karyawan" defaultValue={editingEmployee?.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="email@contoh.com" defaultValue={editingEmployee?.email || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Telepon</label>
              <Input name="phone" type="tel" placeholder="08xxxxxxxxxx" defaultValue={editingEmployee?.phone || ""} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role <span className="text-red-500">*</span></label>
            <Select 
              name="roleId" 
              required 
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">Pilih role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>

          {roles.find(r => r.id === selectedRoleId)?.name.toLowerCase() === 'kasir' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">PIN (untuk kasir)</label>
              <Input 
                name="pin" 
                type="password" 
                inputMode="numeric"
                pattern="\d*"
                placeholder="4-6 digit PIN" 
                maxLength={6} 
                defaultValue={editingEmployee?.pin || ""} 
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                }}
              />
              {editingEmployee && <p className="text-xs text-slate-500 mt-1">Biarkan kosong jika tidak ingin mengubah PIN.</p>}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Penempatan Outlet *
            </label>
            <div className="max-h-[150px] overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-3 bg-slate-50/50">
              {outlets.length === 0 ? (
                <p className="text-sm text-slate-400 p-2">Belum ada outlet terdaftar.</p>
              ) : (
                outlets.map((outlet) => (
                  <label key={outlet.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedOutlets.includes(outlet.id)}
                      onChange={() => toggleOutlet(outlet.id)}
                      className="h-4 w-4 rounded border-slate-300 text-bayaro-navy focus:ring-bayaro-blue"
                    />
                    <span className="text-sm text-slate-700">{outlet.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
