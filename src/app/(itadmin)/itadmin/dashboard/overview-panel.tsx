"use client";

import {
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Package,
  Trash2,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  FileX,
  Info,
  Building2,
  UserCircle2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type OverviewProps = {
  stats: {
    totalBusinesses: number;
    todayOrders: number;
    todayRevenue: number;
    newBusinessesThisMonth: number;
    expiringSoon: number;
    planDistribution: { plan: string; count: number }[];
  };
  systemStats: {
    totalUsers: number;
    totalBusinesses: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalEmployees: number;
    avgOrdersPerDay: number;
  };
  actionQueue: any[];
  recentLogs: any[];
};

const COLORS = ["#4f46e5", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6"];

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  colorClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
      {/* Background soft glow based on the gradient */}
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-20 ${colorClass}`} />
      
      <div className="relative flex items-start gap-4 justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
          <p className="mt-1.5 truncate text-2xl lg:text-[28px] font-black tracking-tight text-slate-900" title={value}>
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner shadow-white/20 ${colorClass}`}>
          <Icon size={20} className="text-white drop-shadow-sm" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"></span>
        <p className="truncate">{subtitle}</p>
      </div>
    </div>
  );
}

export function OverviewPanel({ stats, systemStats, actionQueue, recentLogs }: OverviewProps) {
  const totalPlans = stats.planDistribution.reduce((acc, curr) => acc + curr.count, 0);

  const chartData = stats.planDistribution.map((d, i) => ({
    name: d.plan,
    value: d.count,
    percentage: totalPlans > 0 ? Math.round((d.count / totalPlans) * 100) : 0,
    color: COLORS[i % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
          <p className="text-sm text-slate-500">
            Ringkasan performa sistem SaaS, pendapatan bulanan, dan status langganan.
          </p>
        </div>
      </div>

      {/* KPI Row 1: Core Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pendapatan (MRR)"
          value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(systemStats.totalRevenue)}
          subtitle="Pendapatan sistem keseluruhan"
          icon={DollarSign}
          colorClass="from-emerald-400 to-green-600"
        />
        <KpiCard
          title="Total Toko"
          value={stats.totalBusinesses.toString()}
          subtitle={`+${stats.newBusinessesThisMonth} toko baru bulan ini`}
          icon={Store}
          colorClass="from-blue-500 to-indigo-600"
        />
        <KpiCard
          title="Total Transaksi"
          value={systemStats.totalOrders.toLocaleString("id-ID")}
          subtitle={`Rata-rata ~${systemStats.avgOrdersPerDay} trx/hari`}
          icon={TrendingUp}
          colorClass="from-violet-500 to-fuchsia-600"
        />
        <KpiCard
          title="Butuh Tindakan"
          value={actionQueue.length.toString()}
          subtitle="Expiring / verifikasi bayar"
          icon={AlertTriangle}
          colorClass={actionQueue.length > 0 ? "from-red-500 to-rose-600" : "from-teal-400 to-emerald-600"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Charts & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6">Distribusi Paket Langganan</h3>
            <div className="flex flex-col justify-center mt-2">
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  {chartData.map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2.5">
                          <span 
                            className="w-3 h-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: item.color }} 
                          />
                          {item.name}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">{item.value}</span>
                          <span className="text-xs font-medium text-slate-400 ml-1.5 uppercase tracking-wider">toko</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100/80 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                        >
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 -translate-x-full bg-white/20 group-hover:animate-[shimmer_1.5s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                  Belum ada data berlangganan
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Perlu Tindakan Segera</h3>
              <Link href="/itadmin/businesses" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Lihat Semua &rarr;
              </Link>
            </div>
            {actionQueue.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Semua aman! Tidak ada antrean prioritas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionQueue.slice(0, 4).map((tenant: any) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-700 font-bold">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tenant.name}</p>
                        <p className="text-xs text-slate-500">{tenant.planName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        tenant.status === "pending" ? "bg-amber-100 text-amber-700" :
                        tenant.status === "expired" ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {tenant.status === "pending" ? "Pending Pay" : tenant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Activity Logs Feed */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900">Aktivitas Terakhir</h3>
              <Link href="/itadmin/logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Detail
              </Link>
            </div>

            <div className="space-y-6">
              {recentLogs.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-400">Belum ada aktivitas.</div>
              ) : (
                recentLogs.map((log, idx) => {
                  let Icon = Info;
                  let color = "bg-slate-100 text-slate-600";
                  let label = log.action;

                  if (log.action.includes("VOID") || log.action.includes("DELETE") || log.action.includes("REJECT")) {
                    Icon = log.action.includes("PRODUCT") ? Trash2 : (log.action.includes("ORDER") ? FileX : AlertCircle);
                    color = "bg-red-100 text-red-600";
                    label = log.action === "VOID_ORDER" ? "Pesanan Batal" : 
                            log.action === "DELETE_PRODUCT" ? "Hapus Produk" :
                            log.action === "REJECT_PAYMENT" ? "Tolak Bayar" : log.action;
                  } else if (log.action.includes("APPROVE") || log.action.includes("SUCCESS")) {
                    Icon = CheckCircle2;
                    color = "bg-emerald-100 text-emerald-600";
                    label = log.action === "APPROVE_PAYMENT" ? "Setuju Bayar" : log.action;
                  } else if (log.action.includes("STOCK")) {
                    Icon = Package;
                    color = "bg-amber-100 text-amber-600";
                    label = log.action === "ADJUST_STOCK" ? "Ubah Stok" : log.action;
                  } else if (log.action.includes("PAYMENT") || log.action.includes("RENEWAL")) {
                    Icon = CreditCard;
                    color = "bg-blue-100 text-blue-600";
                    label = log.action === "REQUEST_RENEWAL" ? "Minta Perpanjang" : log.action;
                  } else {
                    label = log.action.replace(/_/g, ' ');
                  }

                  return (
                    <div key={log.id} className="relative pl-6">
                      {idx !== recentLogs.length - 1 && (
                        <div className="absolute left-2.5 top-7 bottom-[-24px] w-px bg-slate-100"></div>
                      )}
                      
                      <div className="absolute -left-1.5 top-0.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${color}`}>
                          <Icon size={14} />
                        </div>
                      </div>

                      <div className="ml-3">
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building2 size={10} className="inline" />
                          <span className="truncate max-w-[120px]">{log.tenantName}</span>
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">
                          {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: localeId })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/itadmin/logs" className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Buka Audit Trail Lengkap <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
