"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Clock, Users, Pencil, Trash2, Store } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleOutletStatus, deleteOutlet } from "@/actions/outlets";

type Outlet = {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  city: string | null;
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

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleOutletStatus(id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteOutlet(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outlet"
        description="Kelola cabang dan lokasi bisnis Anda"
        breadcrumb="Operasional / Outlet"
        actions={
          <Link href="/outlets/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Tambah Outlet
            </Button>
          </Link>
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
                    <span>{[outlet.address, outlet.city].filter(Boolean).join(", ")}</span>
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
                  <Link href={`/outlets/${outlet.id}/edit`}>
                    <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                      <Pencil size={15} />
                    </button>
                  </Link>
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
    </div>
  );
}
