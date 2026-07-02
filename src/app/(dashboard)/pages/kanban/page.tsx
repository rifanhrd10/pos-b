"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Task = {
  id: number;
  title: string;
  description: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  tags: string[];
};

type Column = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

const INITIAL_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-100 text-slate-600",
    tasks: [
      { id: 1, title: "Desain halaman checkout baru", description: "Perbarui UI checkout dengan komponen terbaru", assignee: "BS", priority: "high", tags: ["UI", "Frontend"] },
      { id: 2, title: "Integrasi payment gateway", description: "Tambahkan support untuk GoPay dan OVO", assignee: "AW", priority: "medium", tags: ["Backend", "API"] },
      { id: 3, title: "Dokumentasi API v2", description: "Tulis dokumentasi endpoint baru", assignee: "SR", priority: "low", tags: ["Docs"] },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-100 text-blue-700",
    tasks: [
      { id: 4, title: "Optimasi performa database", description: "Index query untuk laporan bulanan", assignee: "DP", priority: "high", tags: ["Database", "Backend"] },
      { id: 5, title: "Fitur ekspor CSV", description: "Ekspor data transaksi ke format CSV", assignee: "RK", priority: "medium", tags: ["Feature"] },
      { id: 6, title: "Dark mode toggle", description: "Implementasi tema gelap untuk dashboard", assignee: "MP", priority: "low", tags: ["UI"] },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-amber-100 text-amber-700",
    tasks: [
      { id: 7, title: "Perbaikan bug notifikasi", description: "Fix notifikasi duplikat pada mobile", assignee: "HW", priority: "high", tags: ["Bug", "Mobile"] },
      { id: 8, title: "Refactor auth middleware", description: "Pisahkan logika autentikasi", assignee: "RF", priority: "medium", tags: ["Backend"] },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-emerald-100 text-emerald-700",
    tasks: [
      { id: 9, title: "Setup CI/CD pipeline", description: "GitHub Actions untuk auto deploy", assignee: "BS", priority: "medium", tags: ["DevOps"] },
      { id: 10, title: "Halaman login baru", description: "Redesign halaman login dengan layout baru", assignee: "DA", priority: "low", tags: ["UI", "Frontend"] },
      { id: 11, title: "Migrasi ke PostgreSQL", description: "Pindahkan database dari MySQL ke PostgreSQL", assignee: "AW", priority: "high", tags: ["Database"] },
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  UI: "bg-purple-100 text-purple-700",
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-slate-100 text-slate-700",
  API: "bg-cyan-100 text-cyan-700",
  Docs: "bg-amber-100 text-amber-700",
  Database: "bg-orange-100 text-orange-700",
  Feature: "bg-emerald-100 text-emerald-700",
  Bug: "bg-rose-100 text-rose-700",
  Mobile: "bg-pink-100 text-pink-700",
  DevOps: "bg-indigo-100 text-indigo-700",
};

const COL_ORDER = ["todo", "inprogress", "review", "done"];

export default function KanbanPage() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  const moveTask = (taskId: number, fromColId: string) => {
    const fromIdx = COL_ORDER.indexOf(fromColId);
    if (fromIdx >= COL_ORDER.length - 1) return;
    const toColId = COL_ORDER[fromIdx + 1];
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromColId) return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        if (col.id === toColId) {
          const task = prev.find((c) => c.id === fromColId)?.tasks.find((t) => t.id === taskId);
          return task ? { ...col, tasks: [...col.tasks, task] } : col;
        }
        return col;
      })
    );
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Kanban Board"
        description="Manajemen tugas dengan tampilan board Kanban interaktif."
        breadcrumb="Pages / Kanban"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const isLast = COL_ORDER.indexOf(col.id) >= COL_ORDER.length - 1;
          return (
            <div
              key={col.id}
              className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft min-h-[500px] flex flex-col"
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${col.color}`}>
                  {col.title}
                </span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {col.tasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="flex-1 space-y-3">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <p className="font-medium text-slate-800 text-sm leading-snug">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.description}</p>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Assignee */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bayaro-soft text-xs font-bold text-bayaro-navy">
                          {task.assignee}
                        </div>
                        {/* Priority */}
                        <Badge
                          tone={
                            task.priority === "high"
                              ? "danger"
                              : task.priority === "medium"
                              ? "warning"
                              : "info"
                          }
                        >
                          {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                        </Badge>
                      </div>
                      {/* Move button */}
                      {!isLast && (
                        <Button
                          variant="ghost"
                          className="h-7 px-2 py-0 text-xs"
                          onClick={() => moveTask(task.id, col.id)}
                          title="Pindah ke kolom berikutnya"
                        >
                          →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task Button */}
              <div className="mt-3">
                <Button variant="ghost" className="w-full text-sm text-slate-500">
                  + Tambah tugas
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
