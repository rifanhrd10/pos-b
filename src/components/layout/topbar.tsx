import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";

export function Topbar({
  userName,
  outletName,
  collapsed,
  onToggleSidebar,
}: {
  userName: string;
  outletName: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          aria-label={collapsed ? "Tampilkan sidebar" : "Minimalkan sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div>
          <p className="text-lg font-semibold text-slate-900">Bayaro Admin</p>
          <p className="text-sm text-slate-500">Panel administrasi template</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right lg:block">
          <p className="text-xs text-slate-500">Hari ini</p>
          <p className="text-sm font-semibold text-slate-900">{today}</p>
        </div>
        <div className="hidden rounded-2xl bg-slate-50 px-4 py-2 text-right md:block">
          <p className="text-xs text-slate-500">Workspace</p>
          <p className="text-sm font-semibold text-slate-900">{outletName}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-white">
          <p className="text-xs text-slate-300">Admin</p>
          <p className="text-sm font-semibold">{userName}</p>
        </div>
        <a
          href="/login"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          title="Keluar"
        >
          <LogOut size={18} />
        </a>
      </div>
    </div>
  );
}
