"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function FormsPage() {
  const [checkboxes, setCheckboxes] = useState({ a: true, b: false, c: true });
  const [switches, setSwitches] = useState({ notif: true, dark: false, email: false });
  const [radio, setRadio] = useState("tunai");
  const [formSwitch, setFormSwitch] = useState(true);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Forms"
        description="Semua elemen form: input, select, textarea, checkbox, radio, dan switch."
        breadcrumb="UI Elements / Forms"
      />

      {/* Input States */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Input Text</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Berbagai state input: default, fokus, error, dan nonaktif.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Default */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Default</label>
            <Input placeholder="Input default" />
          </div>

          {/* Normal (focus visible on interact) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Dengan Nilai</label>
            <Input defaultValue="Budi Santoso" placeholder="Nama lengkap" />
          </div>

          {/* Error */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Error</label>
            <Input
              defaultValue="emailsalah"
              placeholder="Email"
              className="border-rose-400 focus:ring-rose-200"
            />
            <p className="mt-1.5 text-xs text-rose-600">Email tidak valid.</p>
          </div>

          {/* Disabled */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nonaktif</label>
            <Input disabled placeholder="Input nonaktif" />
          </div>
        </div>
      </div>

      {/* Select */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Select Dropdown</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Komponen select dengan opsi yang dapat dipilih.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
            <Select>
              <option value="">Pilih kategori</option>
              <option value="elektronik">Elektronik</option>
              <option value="pakaian">Pakaian</option>
              <option value="makanan">Makanan</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Provinsi</label>
            <Select>
              <option value="">Pilih provinsi</option>
              <option value="jakarta">Jakarta</option>
              <option value="jabar">Jawa Barat</option>
              <option value="jateng">Jawa Tengah</option>
              <option value="jatim">Jawa Timur</option>
              <option value="bali">Bali</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Textarea</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Area teks untuk input multi-baris.</p>
        <div className="max-w-lg">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</label>
          <Textarea rows={4} placeholder="Tulis deskripsi di sini..." />
        </div>
      </div>

      {/* Checkbox */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Checkbox</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Pilihan multi-select dengan komponen Checkbox.</p>
        <div className="flex flex-col gap-4">
          <Checkbox
            checked={checkboxes.a}
            onChange={(v) => setCheckboxes((prev) => ({ ...prev, a: v }))}
            label="Terima notifikasi email"
          />
          <Checkbox
            checked={checkboxes.b}
            onChange={(v) => setCheckboxes((prev) => ({ ...prev, b: v }))}
            label="Setujui syarat & ketentuan"
          />
          <Checkbox
            checked={checkboxes.c}
            onChange={(v) => setCheckboxes((prev) => ({ ...prev, c: v }))}
            label="Berlangganan newsletter"
          />
        </div>
      </div>

      {/* Radio */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Radio Button</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Pilihan tunggal menggunakan radio button.</p>
        <div className="flex flex-col gap-4">
          {[
            { value: "tunai", label: "Pembayaran tunai" },
            { value: "kartu", label: "Kartu kredit/debit" },
            { value: "transfer", label: "Transfer bank" },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={radio === opt.value}
                onChange={() => setRadio(opt.value)}
                className="accent-bayaro-navy h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Switch */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Toggle Switch</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">Pengalih on/off untuk pengaturan preferensi.</p>
        <div className="flex flex-col gap-5">
          <Switch
            checked={switches.notif}
            onChange={(v) => setSwitches((prev) => ({ ...prev, notif: v }))}
            label="Notifikasi push"
          />
          <Switch
            checked={switches.dark}
            onChange={(v) => setSwitches((prev) => ({ ...prev, dark: v }))}
            label="Mode gelap"
          />
          <Switch
            checked={switches.email}
            onChange={(v) => setSwitches((prev) => ({ ...prev, email: v }))}
            label="Email marketing"
          />
        </div>
      </div>

      {/* Complete Form Example */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-sora text-lg font-semibold text-slate-900">Contoh Form Lengkap</h2>
        <p className="mt-1 mb-6 text-sm text-slate-500">Form praktis menggabungkan semua elemen input.</p>
        <form className="max-w-lg space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <Input placeholder="Masukkan nama lengkap" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input type="email" placeholder="nama@bayaro.id" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Telepon</label>
            <Input type="tel" placeholder="08xx-xxxx-xxxx" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Pilih Role</label>
            <Select>
              <option value="">Pilih role pengguna</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="kasir">Kasir</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
            <Textarea rows={3} placeholder="Tulis alamat lengkap..." />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Notifikasi</p>
              <p className="text-xs text-slate-400">Aktifkan notifikasi untuk akun ini</p>
            </div>
            <Switch
              checked={formSwitch}
              onChange={setFormSwitch}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Simpan Data
          </Button>
        </form>
      </div>
    </div>
  );
}
