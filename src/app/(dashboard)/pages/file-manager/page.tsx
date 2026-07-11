"use client";

import { useState } from "react";
import { LayoutGrid, List, Upload, Download, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FOLDERS = [
  { id: 1, name: "Dokumen", icon: "📁", count: 24 },
  { id: 2, name: "Gambar", icon: "🖼️", count: 18 },
  { id: 3, name: "Video", icon: "🎬", count: 7 },
  { id: 4, name: "Unduhan", icon: "⬇️", count: 31 },
  { id: 5, name: "Laporan 2024", icon: "📊", count: 12 },
];

const FILES = [
  { id: 1, name: "laporan-penjualan-juni.pdf", type: "PDF", size: "2.4 MB", date: "15 Jul 2024", icon: "📄" },
  { id: 2, name: "foto-produk-kopi.jpg", type: "JPG", size: "1.8 MB", date: "14 Jul 2024", icon: "🖼️" },
  { id: 3, name: "data-transaksi-q2.xlsx", type: "XLSX", size: "890 KB", date: "13 Jul 2024", icon: "📊" },
  { id: 4, name: "panduan-kasir.docx", type: "DOCX", size: "445 KB", date: "12 Jul 2024", icon: "📝" },
  { id: 5, name: "logo-bayaro-final.png", type: "PNG", size: "234 KB", date: "11 Jul 2024", icon: "🖼️" },
  { id: 6, name: "backup-database-juni.sql", type: "SQL", size: "15.2 MB", date: "10 Jul 2024", icon: "💾" },
  { id: 7, name: "video-promosi-juli.mp4", type: "MP4", size: "48.7 MB", date: "9 Jul 2024", icon: "🎬" },
  { id: 8, name: "kontrak-supplier-baru.pdf", type: "PDF", size: "1.1 MB", date: "8 Jul 2024", icon: "📄" },
  { id: 9, name: "foto-outlet-bayaro.jpg", type: "JPG", size: "3.2 MB", date: "7 Jul 2024", icon: "🖼️" },
  { id: 10, name: "rekap-stok-mingguan.xlsx", type: "XLSX", size: "567 KB", date: "6 Jul 2024", icon: "📊" },
  { id: 11, name: "peraturan-internal.pdf", type: "PDF", size: "780 KB", date: "5 Jul 2024", icon: "📄" },
  { id: 12, name: "sertifikat-halal-2024.png", type: "PNG", size: "1.4 MB", date: "4 Jul 2024", icon: "🖼️" },
];

const TYPE_TONE: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  PDF: "danger",
  JPG: "success",
  PNG: "success",
  XLSX: "info",
  DOCX: "info",
  SQL: "warning",
  MP4: "warning",
  DOCX2: "info",
};

export default function FileManagerPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  const filteredFiles = FILES.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFolderName = selectedFolder
    ? FOLDERS.find((f) => f.id === selectedFolder)?.name
    : null;

  const toggleSelect = (id: number) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="File Manager"
        description="Kelola dan organisir file dan dokumen bisnis Anda."
        breadcrumb="Pages / File Manager"
      />

      <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
        {/* Left Sidebar */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Folder</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder(null)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-50",
                selectedFolder === null ? "bg-bayaro-soft text-bayaro-navy font-semibold" : "text-slate-700"
              )}
            >
              <span>📂</span>
              <span className="flex-1">Semua File</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {FILES.length}
              </span>
            </button>
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-50",
                  selectedFolder === folder.id
                    ? "bg-bayaro-soft text-bayaro-navy font-semibold"
                    : "text-slate-700"
                )}
              >
                <span>{folder.icon}</span>
                <span className="flex-1">{folder.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {folder.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl border transition",
                  viewMode === "grid"
                    ? "border-bayaro-blue bg-bayaro-soft text-bayaro-blue"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl border transition",
                  viewMode === "list"
                    ? "border-bayaro-blue bg-bayaro-soft text-bayaro-blue"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <Button variant="primary" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Breadcrumb + Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">Dokumen</span>
              {selectedFolderName && (
                <>
                  {" › "}
                  <span className="font-medium text-slate-700">{selectedFolderName}</span>
                </>
              )}
              {!selectedFolderName && (
                <>
                  {" › "}
                  <span className="font-medium text-slate-700">Semua File</span>
                </>
              )}
            </p>
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">{filteredFiles.length}</span> file
            </p>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => toggleSelect(file.id)}
                  className={cn(
                    "rounded-[20px] border bg-white p-4 cursor-pointer transition",
                    selectedFiles.has(file.id)
                      ? "border-bayaro-blue ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-bayaro-blue"
                  )}
                >
                  <div className="mb-3 text-4xl">{file.icon}</div>
                  <p className="truncate text-sm font-medium text-slate-800" title={file.name}>
                    {file.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={TYPE_TONE[file.type] ?? "default"}>{file.type}</Badge>
                    <span className="text-xs text-slate-400">{file.size}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">{file.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">File</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tipe</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ukuran</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, i) => (
                    <tr
                      key={file.id}
                      className={cn(
                        "border-b border-slate-50 hover:bg-slate-50 transition",
                        i === filteredFiles.length - 1 && "border-b-0"
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{file.icon}</span>
                          <span className="font-medium text-slate-800 truncate max-w-[200px]" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={TYPE_TONE[file.type] ?? "default"}>{file.type}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{file.size}</td>
                      <td className="px-4 py-3.5 text-slate-500">{file.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-rose-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
