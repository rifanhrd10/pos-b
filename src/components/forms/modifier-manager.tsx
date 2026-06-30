"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emitToast } from "@/components/ui/toast-provider";

type ModifierGroupItem = {
  id: string;
  name: string;
  description: string | null;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  isActive: boolean;
  modifierCount: number;
  productCount: number;
};

type ModifierItem = {
  id: string;
  modifierGroupId: string;
  groupName: string;
  name: string;
  price: number;
  costPrice: number | null;
  sku: string | null;
  stock: number | null;
  isStockTracked: boolean;
  isActive: boolean;
};

function formatRupiahInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

function parseCurrency(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function ModalFrame({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-3xl items-center justify-center">
        <div className="max-h-[92vh] w-full overflow-hidden rounded-[32px] bg-white shadow-soft">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ModifierManager({
  initialGroups,
  initialModifiers,
}: {
  initialGroups: ModifierGroupItem[];
  initialModifiers: ModifierItem[];
}) {
  const [tab, setTab] = useState<"groups" | "items">("groups");
  const [groups, setGroups] = useState(initialGroups);
  const [modifiers, setModifiers] = useState(initialModifiers);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroupItem | null>(null);
  const [editingItem, setEditingItem] = useState<ModifierItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [groupQuery, setGroupQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [groupStatus, setGroupStatus] = useState("all");
  const [itemStatus, setItemStatus] = useState("all");
  const [itemPriceInput, setItemPriceInput] = useState("");
  const [itemCostPriceInput, setItemCostPriceInput] = useState("");
  const [itemStockTracked, setItemStockTracked] = useState(false);

  const sortedGroups = useMemo(
    () =>
      [...groups]
        .filter((group) => {
          const matchQuery = [group.name, group.description].join(" ").toLowerCase().includes(groupQuery.toLowerCase());
          const matchStatus =
            groupStatus === "all" ||
            (groupStatus === "active" && group.isActive) ||
            (groupStatus === "inactive" && !group.isActive) ||
            (groupStatus === "required" && group.isRequired);
          return matchQuery && matchStatus;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [groups, groupQuery, groupStatus],
  );
  const sortedItems = useMemo(
    () =>
      [...modifiers]
        .filter((item) => {
          const matchQuery = [item.name, item.groupName, item.sku].join(" ").toLowerCase().includes(itemQuery.toLowerCase());
          const matchStatus =
            itemStatus === "all" ||
            (itemStatus === "active" && item.isActive) ||
            (itemStatus === "inactive" && !item.isActive) ||
            (itemStatus === "tracked" && item.isStockTracked);
          return matchQuery && matchStatus;
        })
        .sort((a, b) => a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name)),
    [modifiers, itemQuery, itemStatus],
  );

  function saveGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      minSelect: Number(formData.get("minSelect") || 0),
      maxSelect: Number(formData.get("maxSelect") || 1),
      isRequired: formData.get("isRequired") === "on",
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(editingGroup ? `/api/modifier-groups/${editingGroup.id}` : "/api/modifier-groups", {
        method: editingGroup ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan grup topping.");
        emitToast({ tone: "error", title: "Grup topping gagal disimpan", description: result.message });
        return;
      }

      setGroups((prev) => editingGroup ? prev.map((item) => (item.id === editingGroup.id ? result : item)) : [result, ...prev]);
      setGroupModalOpen(false);
      setEditingGroup(null);
      setError(null);
      emitToast({ tone: "success", title: editingGroup ? "Grup topping diperbarui" : "Grup topping ditambahkan" });
    });
  }

  function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      modifierGroupId: String(formData.get("modifierGroupId") || ""),
      name: String(formData.get("name") || ""),
      price: Number(formData.get("price") || 0),
      costPrice: formData.get("costPrice") ? Number(formData.get("costPrice")) : null,
      sku: String(formData.get("sku") || ""),
      stock: formData.get("stock") ? Number(formData.get("stock")) : null,
      isStockTracked: formData.get("isStockTracked") === "on",
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(editingItem ? `/api/modifiers/${editingItem.id}` : "/api/modifiers", {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menyimpan item topping.");
        emitToast({ tone: "error", title: "Item topping gagal disimpan", description: result.message });
        return;
      }

      setModifiers((prev) => editingItem ? prev.map((item) => (item.id === editingItem.id ? result : item)) : [result, ...prev]);
      setItemModalOpen(false);
      setEditingItem(null);
      setError(null);
      emitToast({ tone: "success", title: editingItem ? "Item topping diperbarui" : "Item topping ditambahkan" });
    });
  }

  async function removeGroup(id: string) {
    if (!window.confirm("Hapus grup topping ini? Jika sudah terhubung ke produk atau modifier, sistem akan melakukan soft delete.")) return;
    const response = await fetch(`/api/modifier-groups/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Gagal menghapus grup topping.");
      emitToast({ tone: "error", title: "Grup topping gagal dihapus", description: result.message });
      return;
    }
    setGroups((prev) => prev.filter((item) => item.id !== id));
    emitToast({ tone: "success", title: "Grup topping diperbarui", description: result.message });
  }

  async function removeItem(id: string) {
    if (!window.confirm("Hapus item topping ini? Jika sudah dipakai transaksi, sistem akan melakukan soft delete.")) return;
    const response = await fetch(`/api/modifiers/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Gagal menghapus item topping.");
      emitToast({ tone: "error", title: "Item topping gagal dihapus", description: result.message });
      return;
    }
    setModifiers((prev) => prev.filter((item) => item.id !== id));
    emitToast({ tone: "success", title: "Item topping diperbarui", description: result.message });
  }

  function openCreateGroupModal() {
    setEditingGroup(null);
    setGroupModalOpen(true);
  }

  function openEditGroupModal(group: ModifierGroupItem) {
    setEditingGroup(group);
    setGroupModalOpen(true);
  }

  function openCreateItemModal() {
    setEditingItem(null);
    setItemPriceInput("");
    setItemCostPriceInput("");
    setItemStockTracked(false);
    setItemModalOpen(true);
  }

  function openEditItemModal(item: ModifierItem) {
    setEditingItem(item);
    setItemPriceInput(formatRupiahInput(String(item.price)));
    setItemCostPriceInput(item.costPrice === null ? "" : formatRupiahInput(String(item.costPrice)));
    setItemStockTracked(item.isStockTracked);
    setItemModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-white p-4 shadow-soft">
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${tab === "groups" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setTab("groups")}
            type="button"
          >
            Grup Topping
          </button>
          <button
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${tab === "items" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setTab("items")}
            type="button"
          >
            Item Topping
          </button>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            if (tab === "groups") {
              openCreateGroupModal();
            } else {
              openCreateItemModal();
            }
          }}
        >
          <Plus size={16} />
          {tab === "groups" ? "Tambah Grup" : "Tambah Item"}
        </Button>
      </div>

      {tab === "groups" ? (
        <div className="space-y-3">
          <div className="grid gap-4 rounded-[28px] bg-white p-4 shadow-soft md:grid-cols-[1fr_0.8fr]">
            <Input placeholder="Cari nama atau deskripsi grup..." value={groupQuery} onChange={(event) => setGroupQuery(event.target.value)} />
            <select value={groupStatus} onChange={(event) => setGroupStatus(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
              <option value="all">Semua grup</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="required">Wajib dipilih</option>
            </select>
          </div>
          {sortedGroups.map((group) => (
            <div key={group.id} className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{group.name}</p>
                    {group.isRequired ? <Badge tone="warning">Wajib</Badge> : <Badge>Opsional</Badge>}
                    {group.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{group.description || "Tanpa deskripsi."}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Min {group.minSelect} • Max {group.maxSelect} • {group.modifierCount} item • {group.productCount} produk
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEditGroupModal(group)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="danger" onClick={() => void removeGroup(group.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!sortedGroups.length ? <div className="rounded-[28px] bg-white p-6 text-sm text-slate-500 shadow-soft">Tidak ada grup topping yang cocok.</div> : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-4 rounded-[28px] bg-white p-4 shadow-soft md:grid-cols-[1fr_0.8fr]">
            <Input placeholder="Cari nama topping, grup, atau SKU..." value={itemQuery} onChange={(event) => setItemQuery(event.target.value)} />
            <select value={itemStatus} onChange={(event) => setItemStatus(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
              <option value="all">Semua item</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="tracked">Lacak stok</option>
            </select>
          </div>
          {sortedItems.map((item) => (
            <div key={item.id} className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                    <Badge tone="info">{item.groupName}</Badge>
                    {item.isStockTracked ? <Badge tone="warning">Lacak Stok</Badge> : <Badge>Tanpa Stok</Badge>}
                    {item.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Harga tambahan Rp{item.price.toLocaleString("id-ID")} • SKU {item.sku || "-"} • Stok {item.stock ?? "-"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEditItemModal(item)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="danger" onClick={() => void removeItem(item.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!sortedItems.length ? <div className="rounded-[28px] bg-white p-6 text-sm text-slate-500 shadow-soft">Tidak ada item topping yang cocok.</div> : null}
        </div>
      )}

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {groupModalOpen ? (
        <ModalFrame
          title={editingGroup ? "Edit Grup Topping" : "Tambah Grup Topping"}
          subtitle="Kelompokkan topping berdasarkan fungsi pilihan di kasir, misalnya level gula, ukuran gelas, atau add-on."
          onClose={() => setGroupModalOpen(false)}
        >
          <form className="space-y-6" onSubmit={saveGroup}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama grup</label>
                  <Input name="name" defaultValue={editingGroup?.name} placeholder="Contoh: Pilihan Topping Dingin" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi</label>
                  <Input name="description" defaultValue={editingGroup?.description || ""} placeholder="Opsional, untuk catatan internal tim" />
                </div>
              </div>
              <div className="space-y-4 rounded-[28px] bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Aturan pemilihan</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Minimal pilih</label>
                    <Input name="minSelect" type="number" defaultValue={editingGroup?.minSelect ?? 0} required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Maksimal pilih</label>
                    <Input name="maxSelect" type="number" defaultValue={editingGroup?.maxSelect ?? 1} required />
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isRequired" defaultChecked={editingGroup?.isRequired ?? false} />
                  Wajib dipilih saat checkout
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={editingGroup?.isActive ?? true} />
                  Grup aktif
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setGroupModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Grup"}</Button>
            </div>
          </form>
        </ModalFrame>
      ) : null}

      {itemModalOpen ? (
        <ModalFrame
          title={editingItem ? "Edit Item Topping" : "Tambah Item Topping"}
          subtitle="Isi harga tambahan, grup, dan opsi tracking stok bila topping ini memang disimpan sebagai item terpisah."
          onClose={() => setItemModalOpen(false)}
        >
          <form className="space-y-6" onSubmit={saveItem}>
            <input name="price" value={parseCurrency(itemPriceInput)} readOnly hidden />
            <input name="costPrice" value={itemCostPriceInput ? parseCurrency(itemCostPriceInput) : ""} readOnly hidden />

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Grup topping</label>
                  <select
                    name="modifierGroupId"
                    defaultValue={editingItem?.modifierGroupId || ""}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
                  >
                    <option value="" disabled>Pilih grup topping</option>
                    {sortedGroups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama topping</label>
                  <Input name="name" defaultValue={editingItem?.name} placeholder="Contoh: Boba, Keju, Extra Shot" required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Harga tambahan</label>
                    <Input
                      value={itemPriceInput}
                      onChange={(event) => setItemPriceInput(formatRupiahInput(event.target.value))}
                      inputMode="numeric"
                      placeholder="Rp 0"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Harga modal</label>
                    <Input
                      value={itemCostPriceInput}
                      onChange={(event) => setItemCostPriceInput(formatRupiahInput(event.target.value))}
                      inputMode="numeric"
                      placeholder="Rp 0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Inventori & status</p>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">SKU internal</label>
                  <Input name="sku" defaultValue={editingItem?.sku || ""} placeholder="Opsional untuk identifikasi internal" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Stok topping</label>
                  <Input
                    name="stock"
                    type="number"
                    defaultValue={editingItem?.stock ?? ""}
                    placeholder="Kosongkan bila tidak dilacak"
                    disabled={!itemStockTracked}
                    className={!itemStockTracked ? "bg-white/70 text-slate-400" : "bg-white"}
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isStockTracked"
                    checked={itemStockTracked}
                    onChange={(event) => setItemStockTracked(event.target.checked)}
                  />
                  Lacak stok topping ini
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={editingItem?.isActive ?? true} />
                  Item aktif
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setItemModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Item"}</Button>
            </div>
          </form>
        </ModalFrame>
      ) : null}
    </div>
  );
}
