"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { getErrorMessage } from "@/lib/errors";

interface CustomerFormProps {
  businessId: string;
  initialData?: {
    id?: string;
    name?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
  };
  onSuccess?: () => void;
}

export function CustomerForm({ businessId, initialData, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const data = { name, phone: phone || null, email: email || null, address: address || null, notes: notes || null };

    try {
      if (initialData?.id) {
        const result = await updateCustomer(initialData.id, data);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createCustomer(businessId, data);
        if (result.error) {
          setError(result.error);
          return;
        }
      }
      onSuccess?.();
      router.push("/customers");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-5 font-semibold text-slate-900">Informasi Pelanggan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap pelanggan"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">No. HP</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Alamat</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan tentang pelanggan..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isPending}>
          {initialData?.id ? "Perbarui Pelanggan" : "Tambah Pelanggan"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/customers")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
