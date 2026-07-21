"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Building2, Pencil, Plus, Search, Sparkles, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateTables, createTable, deleteTable, toggleTableStatus, updateTable } from "@/actions/tables";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Outlet = {
  id: string;
  name: string;
  isActive: boolean;
};

type TableRow = {
  id: string;
  outletId: string;
  name: string;
  capacity: number;
  isActive: boolean;
  sortOrder: number;
  outlet: {
    id: string;
    name: string;
  };
  _count: {
    orders: number;
  };
};

type FormMode = "single" | "bulk";

type Props = {
  outlets: Outlet[];
  tables: TableRow[];
  activeOutletId: string | null;
};

export function TablesClient({ outlets, tables, activeOutletId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const defaultOutletId = activeOutletId || outlets[0]?.id || "";

  const [outletFilter, setOutletFilter] = useState(defaultOutletId || "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<FormMode>("single");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleTables = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesOutlet = outletFilter === "all" || table.outletId === outletFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && table.isActive) ||
        (statusFilter === "inactive" && !table.isActive);
      const matchesKeyword =
        !keyword ||
        table.name.toLowerCase().includes(keyword) ||
        table.outlet.name.toLowerCase().includes(keyword);

      return matchesOutlet && matchesStatus && matchesKeyword;
    });
  }, [tables, outletFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const active = tables.filter((table) => table.isActive).length;
    const inactive = tables.length - active;
    const capacity = tables.filter((table) => table.isActive).reduce((sum, table) => sum + table.capacity, 0);

    return { active, inactive, capacity };
  }, [tables]);

  function openCreate(mode: FormMode) {
    setEditingTable(null);
    setFormMode(mode);
    setError(null);
    setIsFormOpen(true);
  }

  function openEdit(table: TableRow) {
    setEditingTable(table);
    setFormMode("single");
    setError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (editingTable) {
        result = await updateTable(editingTable.id, formData);
      } else if (formMode === "bulk") {
        result = await bulkCreateTables(formData);
      } else {
        result = await createTable(formData);
      }

      if (result?.error) {
        setError(result.error);
        return;
      }

      if ("created" in result && result.created) {
        toast.success(`${result.created} meja berhasil dibuat`);
      } else {
        toast.success(editingTable ? "Meja berhasil diperbarui" : "Meja berhasil ditambahkan");
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggle(table: TableRow) {
    startTransition(async () => {
      const result = await toggleTableStatus(table.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(table.isActive ? "Meja dinonaktifkan" : "Meja diaktifkan");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteTable(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Meja berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Meja"
        description="Kelola daftar meja per outlet untuk flow dine-in di POS kasir web dan Android"
        breadcrumb="Operasional / Master Meja"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => openCreate("bulk")} disabled={outlets.length === 0}>
              <Sparkles size={16} className="mr-2" />
              Generate Meja
            </Button>
            <Button onClick={() => openCreate("single")} disabled={outlets.length === 0}>
              <Plus size={16} className="mr-2" />
              Tambah Meja
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Meja Aktif" value={stats.active} hint="Muncul di kasir" tone="blue" />
        <StatCard label="Kapasitas Aktif" value={stats.capacity} hint="Total kursi tersedia" tone="green" />
        <StatCard label="Nonaktif" value={stats.inactive} hint="Disembunyikan dari kasir" tone="slate" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama meja atau outlet..."
              className="pl-11"
            />
          </div>
          <Select value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)}>
            <option value="all">Semua outlet</option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>
      </div>

      {outlets.length === 0 ? (
        <EmptyState title="Belum ada outlet" description="Tambahkan outlet terlebih dahulu sebelum membuat master meja." />
      ) : visibleTables.length === 0 ? (
        <EmptyState title="Belum ada meja" description="Buat meja satuan atau generate banyak meja untuk outlet yang dipilih." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTables.map((table) => (
            <div
              key={table.id}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-bayaro-blue">
                    <Armchair size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">{table.name}</h3>
                      <Badge tone={table.isActive ? "success" : "warning"}>
                        {table.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Building2 size={14} />
                      {table.outlet.name}
                    </p>
                  </div>
                </div>
                <Switch checked={table.isActive} onChange={() => handleToggle(table)} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Kapasitas</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{table.capacity}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Urutan</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{table.sortOrder}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Order</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{table._count.orders}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-100 pt-4">
                <button
                  onClick={() => openEdit(table)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Edit ${table.name}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(table)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Hapus ${table.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTable ? "Edit Meja" : formMode === "bulk" ? "Generate Banyak Meja" : "Tambah Meja"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Outlet</label>
            <Select name="outletId" required defaultValue={editingTable?.outletId || defaultOutletId}>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                  {!outlet.isActive ? " (Nonaktif)" : ""}
                </option>
              ))}
            </Select>
          </div>

          {formMode === "bulk" && !editingTable ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Awalan Nama</label>
                <Input name="prefix" defaultValue="Meja" placeholder="Contoh: Meja, VIP, Outdoor" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mulai Nomor</label>
                <Input name="startNumber" type="number" min={1} defaultValue={1} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Jumlah Meja</label>
                <Input name="count" type="number" min={1} max={100} defaultValue={10} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kapasitas per Meja</label>
                <Input name="capacity" type="number" min={1} defaultValue={4} />
              </div>
              <div className="sm:col-span-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Contoh: awalan “Meja”, mulai nomor 1, jumlah 10 akan membuat Meja 1 sampai Meja 10.
                Nama yang sudah ada akan dilewati otomatis.
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Meja</label>
                <Input name="name" required defaultValue={editingTable?.name || ""} placeholder="Contoh: Meja 1, VIP 1, Outdoor 2" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kapasitas</label>
                <Input name="capacity" type="number" min={1} defaultValue={editingTable?.capacity || 4} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Urutan</label>
                <Input name="sortOrder" type="number" min={0} defaultValue={editingTable?.sortOrder || 0} />
              </div>
              <div className="flex items-end">
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Urutan kecil tampil lebih dulu di denah kasir.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Meja">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Yakin ingin menghapus <strong>{deleteTarget?.name}</strong>? Jika meja sudah pernah dipakai transaksi,
            sistem akan menolak hapus dan menyarankan nonaktif agar riwayat tetap aman.
          </p>
          {deleteTarget?._count.orders ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Meja ini sudah memiliki {deleteTarget._count.orders} order. Lebih aman dinonaktifkan.
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "blue" | "green" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-bayaro-blue",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
          {tone === "green" ? <UsersRound size={22} /> : <Armchair size={22} />}
        </div>
      </div>
    </div>
  );
}
