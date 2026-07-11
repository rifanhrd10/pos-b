"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOutlets } from "@/actions/onboarding";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";

type OutletForm = {
  name: string;
  address: string;
  city: string;
  phone: string;
};

const emptyOutlet = (): OutletForm => ({ name: "", address: "", city: "", phone: "" });

export default function OutletPage() {
  const router = useRouter();
  const { outlet, setOutlet } = useOnboardingStore();
  
  const [hasMultiOutlet, setHasMultiOutlet] = useState<boolean | null>(outlet.hasMultiOutlet ?? null);
  const [outlets, setOutlets] = useState<OutletForm[]>(outlet.outlets || [emptyOutlet()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load from store on mount
  useEffect(() => {
    if (outlet.hasMultiOutlet !== undefined) {
      setHasMultiOutlet(outlet.hasMultiOutlet);
    }
    if (outlet.outlets && outlet.outlets.length > 0) {
      setOutlets(outlet.outlets);
    }
  }, []);

  function updateOutlet(index: number, field: keyof OutletForm, value: string) {
    if (field === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 0 && value[0] !== "0") {
        value = "0" + value;
      }
    }
    setOutlets((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  }

  function addOutlet() {
    setOutlets((prev) => [...prev, emptyOutlet()]);
  }

  function removeOutlet(index: number) {
    if (outlets.length <= 1) return;
    setOutlets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    
    // Save to store
    setOutlet({
      hasMultiOutlet: hasMultiOutlet ?? false,
      outlets: outlets,
    });

    const formData = new FormData();
    formData.append("hasMultiOutlet", hasMultiOutlet ? "true" : "false");

    if (hasMultiOutlet) {
      outlets.forEach((outlet, i) => {
        formData.append(`outlets[${i}][name]`, outlet.name);
        if (outlet.address) formData.append(`outlets[${i}][address]`, outlet.address);
        if (outlet.city) formData.append(`outlets[${i}][city]`, outlet.city);
        if (outlet.phone) formData.append(`outlets[${i}][phone]`, outlet.phone);
      });
    }

    const result = await createOutlets(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/onboarding/operations");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-10 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] bg-[#eff4ff] text-[#004ac6] font-display-lg font-bold text-[28px] border border-[#c2d3ff]">03</div>
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[32px] text-on-surface tracking-tight font-bold">Setup Outlet</h1>
            <p className="text-primary font-label-md uppercase tracking-[0.1em] mt-1">Langkah Ketiga: Lokasi</p>
          </div>
        </div>
        <p className="font-body-md text-[15px] text-on-surface-variant max-w-4xl leading-relaxed mt-6">
          Tambahkan cabang atau lokasi toko Anda. <span className="text-primary font-medium">Bisa ditambah nanti lewat pengaturan.</span>
        </p>
        <div className="mt-8 h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary w-3/5 transition-all duration-700 ease-out "></div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 md:p-8 relative z-10">
        
        {/* Question: punya cabang? */}
        {hasMultiOutlet === null && (
          <div className="space-y-6">
            <p className="font-headline-sm text-headline-sm text-on-surface">Apakah bisnis Anda memiliki lebih dari 1 lokasi / cabang?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setHasMultiOutlet(false)}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-outline-variant/30 p-8 text-center hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
              >
                <span className="material-symbols-outlined text-4xl text-outline mb-2">storefront</span>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">Tidak</p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Hanya 1 toko saja</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setHasMultiOutlet(true)}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-outline-variant/30 p-8 text-center hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
              >
                <div className="flex gap-1 mb-2">
                  <span className="material-symbols-outlined text-4xl text-outline">storefront</span>
                  <span className="material-symbols-outlined text-4xl text-outline">storefront</span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">Ya</p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Punya 2 atau lebih lokasi</p>
                </div>
              </button>
            </div>
            
            <div className="pt-6 border-t border-outline-variant/20 flex justify-end mt-8">
              <button 
                className="px-6 py-3 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2" 
                type="button" 
                onClick={() => router.push("/onboarding/plan")}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Tidak punya cabang → konfirmasi auto-create */}
        {hasMultiOutlet === false && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 space-y-3">
              <div className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                <span className="font-headline-sm text-headline-sm">Outlet Utama</span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Outlet akan dibuat otomatis menggunakan nama dan alamat bisnis Anda yang sudah diisi di langkah pertama.
                Anda dapat mengubah detail outlet kapan saja melalui halaman Pengaturan Outlet nanti.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setHasMultiOutlet(null)}
              className="text-sm font-label-md text-primary hover:text-primary/80 underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Ubah pilihan (Saya punya lebih dari 1 lokasi)
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-4 text-sm text-error bg-error-container rounded-lg">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Punya cabang → form multi-outlet */}
        {hasMultiOutlet === true && (
          <div className="space-y-6">
            {outlets.map((outlet, index) => (
              <div key={index} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                    Outlet {index + 1}
                  </h3>
                  {outlets.length > 1 && (
                    <button type="button" onClick={() => removeOutlet(index)} className="text-outline hover:text-error transition-colors flex items-center gap-1 font-label-sm text-sm">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Hapus
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">Nama Outlet <span className="text-error">*</span></label>
                    <input
                      required
                      className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50"
                      placeholder="Contoh: Cabang Pusat"
                      value={outlet.name}
                      onChange={(e) => updateOutlet(index, "name", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-2">Kota <span className="text-error">*</span></label>
                      <input
                        required
                        className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50"
                        placeholder="Jakarta"
                        value={outlet.city}
                        onChange={(e) => updateOutlet(index, "city", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-2">Telepon <span className="text-error">*</span></label>
                      <input
                        required
                        className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50"
                        placeholder="021-xxxxxxxx"
                        value={outlet.phone}
                        onChange={(e) => updateOutlet(index, "phone", e.target.value)}
                      />
                      <p className="font-body-md text-xs text-on-surface-variant mt-1">Wajib angka (contoh: 08123456789)</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">Alamat Lengkap <span className="text-error">*</span></label>
                    <textarea
                      required
                      className="block w-full px-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50 resize-none"
                      placeholder="Jl. Contoh No. 1"
                      rows={2}
                      value={outlet.address}
                      onChange={(e) => updateOutlet(index, "address", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOutlet}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/40 p-4 text-sm font-label-md text-on-surface-variant hover:border-primary hover:text-primary bg-surface-container-lowest hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tambah Outlet Lagi
            </button>

            <button
              type="button"
              onClick={() => setHasMultiOutlet(null)}
              className="text-sm font-label-md text-primary hover:text-primary/80 underline flex items-center gap-1 pt-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Ubah pilihan (Saya hanya punya 1 lokasi)
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-4 text-sm text-error bg-error-container rounded-lg">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {hasMultiOutlet !== null && (
          <div className="pt-6 border-t border-outline-variant/20 flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
            <button 
              className="w-full md:w-auto px-6 py-3 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2" 
              type="button" 
              onClick={() => router.push("/onboarding/plan")}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Kembali
            </button>
            <button 
              className="w-full md:w-auto px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              type="button" 
              onClick={handleSubmit}
              disabled={loading || (hasMultiOutlet === true && outlets.every((o) => !o.name.trim()))}
            >
              {loading ? "Menyimpan..." : "Lanjut ke Operasional"}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
