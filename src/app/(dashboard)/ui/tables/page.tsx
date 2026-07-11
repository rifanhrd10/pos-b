"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

const users = [
  { id: 1, name: "Budi Santoso", email: "budi@bayaro.id", role: "Admin", status: "active", date: "1 Jan 2024" },
  { id: 2, name: "Siti Rahma", email: "siti@bayaro.id", role: "Kasir", status: "active", date: "3 Jan 2024" },
  { id: 3, name: "Andi Wijaya", email: "andi@bayaro.id", role: "Manager", status: "inactive", date: "5 Jan 2024" },
  { id: 4, name: "Rina Kusuma", email: "rina@bayaro.id", role: "Kasir", status: "active", date: "7 Jan 2024" },
  { id: 5, name: "Doni Prasetyo", email: "doni@bayaro.id", role: "Admin", status: "active", date: "10 Jan 2024" },
  { id: 6, name: "Maya Putri", email: "maya@bayaro.id", role: "Kasir", status: "inactive", date: "12 Jan 2024" },
  { id: 7, name: "Hendra Wibowo", email: "hendra@bayaro.id", role: "Manager", status: "active", date: "14 Jan 2024" },
  { id: 8, name: "Dewi Anggraini", email: "dewi@bayaro.id", role: "Kasir", status: "active", date: "16 Jan 2024" },
  { id: 9, name: "Reza Firmansyah", email: "reza@bayaro.id", role: "Admin", status: "active", date: "18 Jan 2024" },
  { id: 10, name: "Fitri Handayani", email: "fitri@bayaro.id", role: "Kasir", status: "inactive", date: "20 Jan 2024" },
  { id: 11, name: "Agus Setiawan", email: "agus@bayaro.id", role: "Manager", status: "active", date: "22 Jan 2024" },
  { id: 12, name: "Lina Marlina", email: "lina@bayaro.id", role: "Kasir", status: "active", date: "24 Jan 2024" },
  { id: 13, name: "Tono Surya", email: "tono@bayaro.id", role: "Admin", status: "active", date: "26 Jan 2024" },
  { id: 14, name: "Wati Kartika", email: "wati@bayaro.id", role: "Kasir", status: "inactive", date: "28 Jan 2024" },
  { id: 15, name: "Bambang Susilo", email: "bambang@bayaro.id", role: "Manager", status: "active", date: "30 Jan 2024" },
  { id: 16, name: "Nur Hidayah", email: "nur@bayaro.id", role: "Kasir", status: "active", date: "1 Feb 2024" },
  { id: 17, name: "Eko Prasetyo", email: "eko@bayaro.id", role: "Admin", status: "active", date: "3 Feb 2024" },
  { id: 18, name: "Sri Wahyuni", email: "sri@bayaro.id", role: "Kasir", status: "inactive", date: "5 Feb 2024" },
  { id: 19, name: "Fajar Nugroho", email: "fajar@bayaro.id", role: "Manager", status: "active", date: "7 Feb 2024" },
  { id: 20, name: "Indah Permata", email: "indah@bayaro.id", role: "Kasir", status: "active", date: "9 Feb 2024" },
];

const PER_PAGE = 5;

export default function TablesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val as "all" | "active" | "inactive");
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tables"
        description="Komponen tabel dengan fitur pencarian, filter, dan paginasi."
        breadcrumb="UI Elements / Tables"
      />

      {/* Basic Table */}
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-sora text-lg font-semibold text-slate-900">Tabel Dasar</h2>
          <p className="mt-1 text-sm text-slate-500">Tabel sederhana dengan header dan baris data.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user, i) => (
                <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.role}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge tone={user.status === "active" ? "success" : "default"}>
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DataTable with Filter & Pagination */}
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-sora text-lg font-semibold text-slate-900">DataTable dengan Filter &amp; Paginasi</h2>
          <p className="mt-1 text-sm text-slate-500">Tabel interaktif dengan pencarian, filter status, dan paginasi.</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{paginated.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{filtered.length}</span> pengguna
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : (
                paginated.map((user, i) => {
                  const absoluteIndex = (safePage - 1) * PER_PAGE + i + 1;
                  return (
                    <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-500">{absoluteIndex}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.role}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge tone={user.status === "active" ? "success" : "default"}>
                          {user.status === "active" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{user.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <Pencil size={15} />
                          </button>
                          <button className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="secondary"
            className="h-9 px-4 text-xs"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            &larr; Sebelumnya
          </Button>
          <span className="text-sm text-slate-600">
            Halaman <span className="font-semibold text-slate-900">{safePage}</span> dari{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </span>
          <Button
            variant="secondary"
            className="h-9 px-4 text-xs"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Berikutnya &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
