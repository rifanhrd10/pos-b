"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Megaphone, Plus, Settings2, Trash2, X, Eye, AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react"

export type AnnouncementType = "warning" | "danger" | "info" | "success"

export type AnnouncementRule = {
  id: string
  triggerType: "billing" | "general_once" | "general_always"
  daysBefore?: number
  title: string
  message: string
  isActive: boolean
  type: AnnouncementType
  actionText: string
}

export function AnnouncementManagementPanel({ initialRules }: { initialRules: AnnouncementRule[] }) {
  const [rules, setRules] = useState<AnnouncementRule[]>(initialRules)
  const [isEditing, setIsEditing] = useState<AnnouncementRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [simulating, setSimulating] = useState<AnnouncementRule | null>(null)
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState<Partial<AnnouncementRule>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleSave() {
    if (isCreating) {
      const newRule = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
      } as AnnouncementRule
      setRules([newRule, ...rules])
      setIsCreating(false)
    } else if (isEditing) {
      setRules(rules.map(r => r.id === isEditing.id ? { ...isEditing, ...form } as AnnouncementRule : r))
      setIsEditing(null)
    }
  }

  function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      setRules(rules.filter(r => r.id !== id))
    }
  }

  function toggleActive(id: string) {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  function openCreate() {
    setForm({ 
      triggerType: "general_once", 
      title: "", 
      message: "", 
      isActive: true, 
      type: "info",
      actionText: "Mengerti"
    })
    setIsCreating(true)
  }

  function openEdit(rule: AnnouncementRule) {
    setForm(rule)
    setIsEditing(rule)
  }

  function getIcon(type: AnnouncementType, size = 24) {
    switch (type) {
      case "danger": return <AlertCircle className="text-red-500" size={size} strokeWidth={1.5} />
      case "warning": return <AlertTriangle className="text-amber-500" size={size} strokeWidth={1.5} />
      case "success": return <Sparkles className="text-emerald-500" size={size} strokeWidth={1.5} />
      case "info": return <Info className="text-blue-500" size={size} strokeWidth={1.5} />
      default: return <Megaphone className="text-slate-500" size={size} strokeWidth={1.5} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Pengumuman Pop-up</h1>
          <p className="text-sm text-slate-500">Konfigurasi pop-up notifikasi, info fitur baru, dan pengingat tagihan untuk tenant.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <Plus size={16} /> Buat Pop-up Baru
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600 w-32">Pemicu</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Konten Pop-up</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center w-28">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className={`transition hover:bg-slate-50 ${!rule.isActive ? "opacity-60" : ""}`}>
                  <td className="px-4 py-4 align-top">
                    {rule.triggerType === "billing" ? (
                      <span className="inline-flex flex-col items-start gap-1">
                        <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">Tagihan</span>
                        <span className="text-xs font-medium text-slate-500">H-{rule.daysBefore} Masa Aktif</span>
                      </span>
                    ) : rule.triggerType === "general_once" ? (
                      <span className="inline-flex flex-col items-start gap-1">
                        <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Info Umum</span>
                        <span className="text-xs font-medium text-slate-500">Muncul Sekali</span>
                      </span>
                    ) : (
                      <span className="inline-flex flex-col items-start gap-1">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Peringatan</span>
                        <span className="text-xs font-medium text-slate-500">Selalu Muncul</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(rule.type, 20)}</div>
                      <div>
                        <p className="font-semibold text-slate-900">{rule.title}</p>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl line-clamp-2">{rule.message}</p>
                        <div className="mt-3">
                          <button onClick={() => setSimulating(rule)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">
                            <Eye size={14} /> Simulasi Pop-up
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-center">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => toggleActive(rule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          rule.isActive ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        role="switch"
                        aria-checked={rule.isActive}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(rule)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Edit">
                        <Settings2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    <Megaphone className="mx-auto mb-3 text-slate-300" size={32} />
                    <p>Belum ada pengaturan pengumuman atau pop-up.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {(isCreating || isEditing) && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">{isCreating ? "Buat Pengumuman Baru" : "Edit Pengumuman"}</h2>
              <button onClick={() => { setIsCreating(false); setIsEditing(null) }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="space-y-1.5 block">
                  <span className="text-sm font-medium text-slate-700">Tipe Pemicu</span>
                  <select 
                    value={form.triggerType} 
                    onChange={(e) => setForm({ ...form, triggerType: e.target.value as AnnouncementRule["triggerType"] })} 
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="general_once">Info Umum (Muncul Sekali)</option>
                    <option value="general_always">Peringatan (Selalu Muncul)</option>
                    <option value="billing">Tagihan (Berdasarkan Masa Aktif)</option>
                  </select>
                </label>

                {form.triggerType === "billing" && (
                  <label className="space-y-1.5 block">
                    <span className="text-sm font-medium text-slate-700">Tampil pada (H- Hari)</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 font-semibold text-slate-400">H-</span>
                      <input 
                        type="number" 
                        min={0}
                        value={form.daysBefore || 0} 
                        onChange={(e) => setForm({ ...form, daysBefore: parseInt(e.target.value) || 0 })} 
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                  </label>
                )}

                <label className="space-y-1.5 block">
                  <span className="text-sm font-medium text-slate-700">Tema Visual</span>
                  <select 
                    value={form.type} 
                    onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })} 
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="info">Info (Biru)</option>
                    <option value="success">Sukses/Fitur Baru (Hijau)</option>
                    <option value="warning">Warning (Kuning)</option>
                    <option value="danger">Danger (Merah)</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-sm font-medium text-slate-700">Judul Pop-up</span>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="Misal: Rilis Fitur Laporan AI!"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-sm font-medium text-slate-700">Pesan Detail</span>
                <textarea 
                  value={form.message} 
                  onChange={(e) => setForm({ ...form, message: e.target.value })} 
                  rows={4}
                  placeholder="Isi pesan pop-up..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" 
                />
                {form.triggerType === "billing" && (
                  <p className="text-xs text-slate-500 mt-1">Gunakan <strong>{`{days}`}</strong> untuk menyisipkan jumlah hari yang tersisa.</p>
                )}
              </label>

              <label className="space-y-1.5 block">
                <span className="text-sm font-medium text-slate-700">Teks Tombol Aksi Utama</span>
                <input 
                  type="text" 
                  value={form.actionText} 
                  onChange={(e) => setForm({ ...form, actionText: e.target.value })} 
                  placeholder="Misal: Coba Sekarang"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
              <button onClick={() => { setIsCreating(false); setIsEditing(null) }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">Batal</button>
              <button onClick={handleSave} disabled={!form.title || !form.message || !form.actionText} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50">Simpan Pengumuman</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Simulation Modal */}
      {simulating && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSimulating(null)}></div>
          
          <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
            
            {/* Distinct Header Section */}
            <div className={`relative px-6 py-8 text-center ${
              simulating.type === 'danger' ? 'bg-red-50' :
              simulating.type === 'warning' ? 'bg-amber-50' :
              simulating.type === 'success' ? 'bg-emerald-50' :
              'bg-blue-50'
            }`}>
              {/* Floating Badge in Header */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                  simulating.type === 'danger' ? 'text-red-600' :
                  simulating.type === 'warning' ? 'text-amber-600' :
                  simulating.type === 'success' ? 'text-emerald-600' :
                  'text-blue-600'
                }`}>
                  {simulating.triggerType === "billing" 
                    ? (simulating.daysBefore === 0 ? "HARI INI" : `H-${simulating.daysBefore}`) 
                    : simulating.triggerType === "general_once" ? "INFO BARU" : "PENTING"}
                </span>
              </div>

              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-sm ${
                simulating.type === 'danger' ? 'text-red-600' :
                simulating.type === 'warning' ? 'text-amber-600' :
                simulating.type === 'success' ? 'text-emerald-600' :
                'text-blue-600'
              }`}>
                {getIcon(simulating.type, 32)}
              </div>
              
              <h3 className={`text-xl font-bold leading-snug tracking-tight px-2 ${
                simulating.type === 'danger' ? 'text-red-950' :
                simulating.type === 'warning' ? 'text-amber-950' :
                simulating.type === 'success' ? 'text-emerald-950' :
                'text-blue-950'
              }`}>
                {simulating.title}
              </h3>
            </div>

            {/* Body Section */}
            <div className="p-6">
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed text-center mb-8">
                {simulating.message.replace('{days}', simulating.daysBefore?.toString() || "")}
              </p>
              
              {/* Stacked Actions */}
              <div className="flex flex-col gap-3">
                <button className={`w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  simulating.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25' :
                  simulating.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25' :
                  simulating.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25' :
                  'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                }`}>
                  {simulating.actionText}
                </button>
                <button onClick={() => setSimulating(null)} className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                  Nanti Saja
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
