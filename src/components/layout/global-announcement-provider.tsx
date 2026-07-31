"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createDummyPaymentRequest } from "@/app/actions/payment-requests"

type PlanProps = {
  name: string
  displayName: string
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
} | null

export function GlobalAnnouncementProvider({ 
  plan, 
  businessId,
  hasPendingPayment,
  children 
}: { 
  plan: PlanProps, 
  businessId: string,
  hasPendingPayment: boolean,
  children: React.ReactNode 
}) {
  const [showPopup, setShowPopup] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(999)
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending">(hasPendingPayment ? "pending" : "none")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Hitung sisa hari dari plan
    if (plan && (plan.currentPeriodEnd || plan.trialEndsAt)) {
      const endDate = new Date((plan.currentPeriodEnd || plan.trialEndsAt) as string)
      const now = new Date()
      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      setDaysLeft(diffDays)

      // Cek local storage untuk status pembayaran "pending" (simulasi flow manual)
      const pendingPayment = localStorage.getItem("payment_pending")
      if (pendingPayment === "true") {
        setPaymentStatus("pending")
      }

      // Aturan hardcoded (bisa diganti ambil dari API)
      if (diffDays <= 0 || plan.status === "expired") {
        setIsBlocked(true)
      } else if (diffDays <= 7 && !hasPendingPayment) {
        // Cek apakah hari ini sudah di close
        const lastClosed = localStorage.getItem(`closed_reminder_${diffDays}`)
        const today = now.toISOString().split('T')[0]
        if (lastClosed !== today) {
           // Show the reminder popup
           setShowPopup(true)
        }
      }
    }
  }, [plan, hasPendingPayment])

  async function handleConfirmPayment() {
    setIsSubmitting(true)
    try {
      await createDummyPaymentRequest(businessId)
      setPaymentStatus("pending")
      if (!isBlocked) {
        setShowPopup(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`closed_reminder_${daysLeft}`, today)
    setShowPopup(false)
  }

  return (
    <>
      {children}
      
      {/* Overlay Blokir Penuh Jika Expired */}
      {isBlocked && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/98 backdrop-blur-xl p-4 text-center text-white">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/20 text-red-400 shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)]">
            <AlertTriangle size={48} />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight">Masa Aktif Berakhir</h1>
          <p className="mb-10 max-w-md text-lg text-slate-300 leading-relaxed">
            Akses toko Anda telah ditangguhkan sementara karena masa aktif telah habis. Silakan lakukan transfer untuk memperpanjang, atau tunggu konfirmasi jika Anda sudah membayar.
          </p>

          {paymentStatus === "pending" ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-8 py-4 text-amber-200">
              <p className="font-bold">Pembayaran Menunggu Verifikasi</p>
              <p className="text-sm opacity-80 mt-1">Admin IT sedang memproses perpanjangan Anda.</p>
            </div>
          ) : (
            <button 
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-8 py-4 text-lg font-bold shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" /> Memproses...</> : "Saya Sudah Transfer"}
            </button>
          )}
        </div>,
        document.body
      )}
      
      {/* Pop-up Pengingat (Belum Expired, H-7 dsb) */}
      {showPopup && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center">
            
            <div className="relative w-full px-6 py-8 text-center bg-amber-50">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 shadow-sm">
                  H-{daysLeft}
                </span>
              </div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-amber-600 shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold leading-snug tracking-tight text-amber-950 px-2">
                Masa Aktif Hampir Habis
              </h3>
            </div>

            <div className="p-6">
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed text-center mb-8">
                Toko Anda akan berakhir dalam {daysLeft} hari. Silakan lakukan transfer perpanjangan dan konfirmasi ke admin untuk menghindari penangguhan fitur.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:bg-amber-600 active:scale-[0.98] disabled:opacity-70"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> Memproses...</> : "Saya Sudah Transfer"}
                </button>
                <button onClick={handleClose} className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-500 transition-colors hover:bg-slate-50">
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
