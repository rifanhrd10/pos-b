"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Clock, Users, Pencil, Trash2, Store } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleOutletStatus, deleteOutlet, createOutlet, updateOutlet } from "@/actions/outlets";
import { toast } from "sonner";
import RegionSelects from "@/components/RegionSelects";

type Outlet = {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  openTime: string | null;
  closeTime: string | null;
  isActive: boolean;
  _count: { employees: number };
};

export function OutletsClient({ outlets }: { outlets: Outlet[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleOutletStatus(id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const res = await deleteOutlet(deleteId);
      if ((res as any)?.error) {
         toast.error((res as any).error);
      } else {
         toast.success("Outlet berhasil dihapus");
         setDeleteId(null);
         router.refresh();
      }
    });
  }

  function openCreateModal() {
    setEditingOutlet(null);
    setOpenTime("08:00");
    setCloseTime("22:00");
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(outlet: Outlet) {
    setEditingOutlet(outlet);
    setOpenTime(outlet.openTime || "08:00");
    setCloseTime(outlet.closeTime || "22:00");
    setError(null);
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    form.set("openTime", openTime);
    form.set("closeTime", closeTime);

    try {
      let result;
      if (editingOutlet) {
        result = await updateOutlet(editingOutlet.id, form);
      } else {
        result = await createOutlet(form);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        toast.success(`Outlet berhasil di${editingOutlet ? 'perbarui' : 'tambahkan'}`);
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
        title="Outlet"
        description="Kelola cabang dan lokasi bisnis Anda"
        breadcrumb="Operasional / Outlet"
        actions={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-2" />
            Tambah Outlet
          </Button>
        }
      />

      {outlets.length === 0 ? (
        <EmptyState title="Belum ada outlet" description="Tambahkan outlet pertama untuk mulai mengelola cabang bisnis Anda." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="relative rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                  {outlet.logo ? (
                    <img src={outlet.logo} alt={outlet.name} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <Store size={22} className="text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900">{outlet.name}</h3>
                  <Badge tone={outlet.isActive ? "success" : "warning"}>
                    {outlet.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {(outlet.address || outlet.city) && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                    <span>{[outlet.address, outlet.city, outlet.province].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {(outlet.openTime || outlet.closeTime) && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="flex-shrink-0 text-slate-400" />
                    <span>{outlet.openTime || "?"} - {outlet.closeTime || "?"}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={14} className="flex-shrink-0 text-slate-400" />
                  <span>{outlet._count.employees} karyawan</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <Switch checked={outlet.isActive} onChange={() => handleToggle(outlet.id)} />
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(outlet)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(outlet.id)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Outlet">
        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus outlet ini? Semua data karyawan yang terkait akan terpengaruh.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>

      {/* Outlet Form Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOutlet ? "Edit Outlet" : "Tambah Outlet"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Outlet <span className="text-red-500">*</span></label>
            <Input name="name" required placeholder="Nama outlet / cabang" defaultValue={editingOutlet?.name} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
            <Input name="address" placeholder="Alamat lengkap" defaultValue={editingOutlet?.address || ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="mb-2 block text-sm font-medium text-slate-700">Wilayah</label>
              <RegionSelects 
                defaultValues={{
                  province: editingOutlet?.province,
                  city: editingOutlet?.city,
                }} 
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Telepon</label>
              <Input name="phone" type="tel" inputMode="numeric" placeholder="Telepon" defaultValue={editingOutlet?.phone || ""} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Buka</label>
              <TimePicker value={openTime} onChange={setOpenTime} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Jam Tutup</label>
              <TimePicker value={closeTime} onChange={setCloseTime} />
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
