"use client"

import { useState, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { CheckCircle2, Clock, Receipt, X, XCircle, AlertTriangle, ShieldCheck, Banknote, CalendarDays, Loader2 } from "lucide-react"
import { approvePaymentRequest, rejectPaymentRequest } from "@/app/actions/payment-requests"

type PaymentRequest = {
  id: string
  tenantName: string
  tenantId: string
  currentPlan: string
  currentStatus: "trial" | "active" | "expired"
  currentExpiry: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
  proofImageUrl?: string
}

export function PaymentVerificationPanel({ initialRequests = [] }: { initialRequests?: any[] }) {
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests)
  const [approving, setApproving] = useState<PaymentRequest | null>(null)
  const [rejecting, setRejecting] = useState<PaymentRequest | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  const [approveForm, setApproveForm] = useState({
    status: "active",
    plan: "pro",
    durationMonths: "1"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleApprove = (id: string) => {
    startTransition(async () => {
      try {
        await approvePaymentRequest(
          id, 
          approveForm.plan, 
          approveForm.status, 
          parseInt(approveForm.durationMonths) || 0
        )
        const tenantName = approving?.tenantName
        toast.custom((t) => (
          <div className="flex w-[380px] items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 tracking-tight">Pembayaran Disetujui!</p>
              <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">
                Tenant <strong className="text-slate-700">{tenantName}</strong> sekarang sudah aktif kembali sesuai paket yang dipilih.
              </p>
            </div>
          </div>
        ))
        setRequests(requests.filter(r => r.id !== id))
        setApproving(null)
      } catch (error) {
        toast.error("Gagal menyetujui pembayaran.")
      }
    })
  }

  const handleReject = (id: string) => {
    startTransition(async () => {
      try {
        await rejectPaymentRequest(id)
        const tenantName = rejecting?.tenantName
        toast.custom((t) => (
          <div className="flex w-[380px] items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 tracking-tight">Pembayaran Ditolak</p>
              <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">
                Permintaan <strong className="text-slate-700">{tenantName}</strong> telah ditolak. Akses tenant tetap diblokir.
              </p>
            </div>
          </div>
        ))
        setRequests(requests.filter(r => r.id !== id))
        setRejecting(null)
      } catch (error) {
        toast.error("Gagal menolak pembayaran.")
      }
    })
  }

  const pendingRequests = requests.filter(r => r.status === "pending")

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Verifikasi Pembayaran</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Tinjau dan konfirmasi transfer perpanjangan langganan dari tenant.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/25">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-blue-100 font-medium mb-1">Menunggu Verifikasi</p>
              <p className="text-4xl font-black">{pendingRequests.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-800">Antrean Verifikasi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-6 py-4 font-semibold">Informasi Tenant</th>
                <th className="px-6 py-4 font-semibold">Status Saat Ini</th>
                <th className="px-6 py-4 font-semibold">Paket Saat Ini</th>
                <th className="px-6 py-4 font-semibold">Waktu Pengajuan</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingRequests.map(req => (
                <tr key={req.id} className="group transition-colors hover:bg-slate-50/60">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                        {req.tenantName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{req.tenantName}</p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">{req.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      req.currentStatus === 'expired' ? 'bg-red-100 text-red-700' :
                      req.currentStatus === 'trial' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.currentStatus === 'expired' && <AlertTriangle size={12} strokeWidth={3} />}
                      {req.currentStatus === 'trial' && <Clock size={12} strokeWidth={3} />}
                      {req.currentStatus === 'active' && <ShieldCheck size={12} strokeWidth={3} />}
                      {req.currentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 border border-slate-200/60">
                      <Banknote size={14} className="text-slate-400" />
                      {req.currentPlan}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium">
                    {new Date(req.requestDate).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setRejecting(req)} className="rounded-xl px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        Tolak
                      </button>
                      <button onClick={() => {
                        setApproving(req)
                        setApproveForm({ 
                          status: "active",
                          plan: req.currentPlan.toLowerCase().includes('basic') ? 'basic' : 'pro',
                          durationMonths: "1" 
                        })
                      }} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95">
                        Tinjau & Setujui
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Semua Beres!</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">Tidak ada pembayaran yang perlu diverifikasi saat ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Approval Modal - Two Column Layout */}
      {approving && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setApproving(null)}></div>
          
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row">
              
              {/* Left Column: Context & Info */}
              <div className="w-full md:w-[40%] bg-blue-50 p-8 flex flex-col border-b md:border-b-0 md:border-r border-blue-100/50">
                <div>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-blue-600 shadow-sm">
                    <Receipt size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-blue-950 tracking-tight leading-tight">Konfirmasi Pembayaran</h3>
                  <p className="mt-3 text-sm font-medium text-blue-600/80 leading-relaxed">
                    Tinjau dan aktifkan kembali layanan untuk tenant <strong className="text-blue-800">{approving.tenantName}</strong>.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl bg-white/60 p-5 backdrop-blur-sm border border-blue-100/50">
                  <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-4">Informasi Saat Ini</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Paket Berjalan</p>
                      <p className="font-bold text-slate-800">{approving.currentPlan}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          approving.currentStatus === 'expired' ? 'bg-red-100 text-red-700' :
                          approving.currentStatus === 'trial' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {approving.currentStatus}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Habis Masa Aktif (Lama)</p>
                      <p className="font-bold text-slate-800 text-sm">
                        {approving.currentExpiry 
                          ? new Date(approving.currentExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="w-full md:w-[60%] p-8 bg-white flex flex-col">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">Pengaturan Perpanjangan</h4>
                  <p className="text-sm text-slate-500 mt-1">Sesuaikan paket dan masa aktif untuk tenant ini.</p>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Ubah Status Tenant</span>
                      <select 
                        value={approveForm.status}
                        onChange={(e) => setApproveForm({...approveForm, status: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors hover:bg-white focus:border-blue-500 focus:bg-white"
                      >
                        <option value="active">Active (Aktif)</option>
                        <option value="trial">Trial (Uji Coba)</option>
                        <option value="expired">Expired (Kedaluwarsa)</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Pilih Paket</span>
                      <select 
                        value={approveForm.plan}
                        onChange={(e) => setApproveForm({...approveForm, plan: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors hover:bg-white focus:border-blue-500 focus:bg-white"
                      >
                        <option value="basic">Basic Plan</option>
                        <option value="pro">Pro Plan</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays size={16} className="text-slate-400" />
                        Tambah Masa Aktif (Bulan)
                      </span>
                      <div className="relative flex items-center">
                        <input 
                          type="number" 
                          value={approveForm.durationMonths}
                          onChange={(e) => setApproveForm({...approveForm, durationMonths: e.target.value})}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pl-4 pr-16 py-3 text-base font-black text-slate-900 outline-none transition-colors hover:bg-white focus:border-blue-500 focus:bg-white" 
                        />
                        <span className="absolute right-4 text-sm font-bold text-slate-400">Bulan</span>
                      </div>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Akan Berlaku Sampai Dengan</p>
                      <p className="text-lg font-black text-emerald-950">
                        {(() => {
                          const date = new Date();
                          const months = parseInt(approveForm.durationMonths) || 0;
                          date.setMonth(date.getMonth() + months);
                          return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button onClick={() => setApproving(null)} className="w-1/3 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-500 transition-colors hover:bg-slate-50">
                    Batal
                  </button>
                  <button 
                    onClick={() => handleApprove(approving.id)}
                    disabled={isPending}
                    className="w-2/3 rounded-2xl bg-blue-600 px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isPending ? (
                      <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                    ) : (
                      "Setujui & Aktifkan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Premium Reject Modal */}
      {rejecting && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRejecting(null)}></div>
          
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="relative bg-red-50 px-8 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-red-600 shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-red-950 tracking-tight">Tolak Pembayaran?</h3>
            </div>

            <div className="p-8">
              <p className="mb-8 text-center text-[15px] font-medium leading-relaxed text-slate-600">
                Anda akan menolak permintaan perpanjangan dari <strong className="text-slate-900">{rejecting.tenantName}</strong>. Pop-up peringatan tagihan akan kembali muncul di dashboard mereka.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleReject(rejecting.id)}
                  disabled={isPending}
                  className="w-full rounded-2xl bg-red-600 px-4 py-4 text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Menolak...</>
                  ) : (
                    "Ya, Tolak Permintaan"
                  )}
                </button>
                <button onClick={() => setRejecting(null)} className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-500 transition-colors hover:bg-slate-50">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
