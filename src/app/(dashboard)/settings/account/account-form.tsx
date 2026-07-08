"use client"

import { useState } from "react"
import { updateUserProfile, changePassword } from "@/actions/settings"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
}

interface AccountFormProps {
  user: User
}

export function AccountForm({ user }: AccountFormProps) {
  // Profile section state
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Password section state
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileStatus(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateUserProfile(formData)

    if (result.success) {
      setProfileStatus({ type: "success", message: "Perubahan berhasil disimpan" })
    } else {
      setProfileStatus({ type: "error", message: result.error ?? "Terjadi kesalahan" })
    }
    setProfileLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Client-side validation
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Password baru minimal 8 karakter" })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Konfirmasi password tidak cocok" })
      return
    }

    setPasswordLoading(true)
    setPasswordStatus(null)

    const result = await changePassword(oldPassword, newPassword, confirmPassword)

    if (result.success) {
      setPasswordStatus({ type: "success", message: "Password berhasil diubah" })
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordStatus({ type: "error", message: result.error ?? "Terjadi kesalahan" })
    }
    setPasswordLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Section A: Profil */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={user.name}
              placeholder="Nama lengkap"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
            <input
              name="phone"
              type="tel"
              defaultValue={user.phone ?? ""}
              placeholder="08xxxxxxxxxx"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
            <input
              name="avatar"
              type="text"
              defaultValue={user.avatar ?? ""}
              placeholder="https://contoh.com/avatar.png"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {profileStatus && (
            <p className={`text-sm ${profileStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {profileStatus.message}
            </p>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </form>
      </div>

      {/* Section B: Ganti Password */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Ganti Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Password Lama */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="Password saat ini"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password Baru
              <span className="ml-1 text-xs font-normal text-slate-400">(min. 8 karakter)</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Password baru"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ulangi password baru"
              className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-500">Password tidak cocok</p>
            )}
          </div>

          {passwordStatus && (
            <p className={`text-sm ${passwordStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {passwordStatus.message}
            </p>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Mengubah..." : "Ubah Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
