"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupBusiness } from "@/actions/onboarding";
import RegionSelects from "@/components/RegionSelects";
import { Modal } from "@/components/ui/modal";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";

const BUSINESS_TYPES = [
  { value: "COFFEE_SHOP", label: "Coffee Shop" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "VAPE_STORE", label: "Vape Store" },
  { value: "BARBERSHOP", label: "Barbershop" },
  { value: "RETAIL", label: "Retail" },
  { value: "FNB", label: "F&B" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "OTHER", label: "Lainnya" },
];

const formatNPWP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  const chars = numbers.split('');
  let npwp = '';
  if (chars.length > 0) npwp += chars.slice(0, 2).join('');
  if (chars.length > 2) npwp += '.' + chars.slice(2, 5).join('');
  if (chars.length > 5) npwp += '.' + chars.slice(5, 8).join('');
  if (chars.length > 8) npwp += '.' + chars.slice(8, 9).join('');
  if (chars.length > 9) npwp += '-' + chars.slice(9, 12).join('');
  if (chars.length > 12) npwp += '.' + chars.slice(12, 15).join('');
  return npwp;
};

const formatPhone = (value: string) => {
  let numbers = value.replace(/\D/g, '');
  if (numbers.length > 0 && numbers[0] !== '0') {
    numbers = '0' + numbers;
  }
  return numbers;
};

export default function BusinessPage() {
  const router = useRouter();
  const { business, setBusiness } = useOnboardingStore();
  
  const [logo, setLogo] = useState<string | null>(business.logo || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [npwp, setNpwp] = useState(business.npwp || "");
  const [phone, setPhone] = useState(business.phone || "");
  const [viewImageOpen, setViewImageOpen] = useState(false);
  
  // Load from store on mount
  useEffect(() => {
    if (business.logo) setLogo(business.logo);
    if (business.npwp) setNpwp(business.npwp);
    if (business.phone) setPhone(business.phone);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (logo) formData.set("logo", logo);
    
    // Save to store before submitting
    setBusiness({
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      npwp: formData.get('npwp') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      province: formData.get('province') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string,
      subdistrict: formData.get('subdistrict') as string,
      postalCode: formData.get('postalCode') as string,
      logo: logo,
    });

    const result = await setupBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/onboarding/plan");
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-10 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] bg-[#eff4ff] text-[#004ac6] font-display-lg font-bold text-[28px] border border-[#c2d3ff]">01</div>
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[32px] text-on-surface tracking-tight font-bold">Profil Bisnis</h1>
            <p className="text-primary font-label-md uppercase tracking-[0.1em] mt-1">Langkah Pertama: Identitas</p>
          </div>
        </div>
        <p className="font-body-md text-[15px] text-on-surface-variant max-w-4xl leading-relaxed mt-6">
          Tentukan identitas utama bisnis Anda untuk ditampilkan di seluruh sistem. Informasi ini akan digunakan untuk invoice, struk, dan profil publik outlet Anda. <span className="text-primary font-medium">Mari mulai membangun brand Anda hari ini.</span>
        </p>
        <div className="mt-8 h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary w-1/5 transition-all duration-700 ease-out "></div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 md:p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary">domain</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Informasi Perusahaan</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-start gap-6 pb-8 border-b border-outline-variant/20">
              <div className="w-full md:w-32 h-32 rounded-lg border-2 border-dashed border-outline-variant/40 bg-surface flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors group relative overflow-hidden">
                {!logo ? (
                  <>
                    <span className="material-symbols-outlined text-outline text-3xl group-hover:text-primary transition-colors">add_photo_alternate</span>
                    <span className="font-label-sm text-label-sm text-outline mt-2 group-hover:text-primary transition-colors">Upload Logo</span>
                    <input accept="image/png, image/jpeg, image/webp" className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleLogoChange} />
                  </>
                ) : (
                  <>
                    <img src={logo} alt="Logo Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button type="button" onClick={() => setViewImageOpen(true)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all" title="Lihat Penuh">
                        <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                      </button>
                      <label className="w-8 h-8 cursor-pointer rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all" title="Ganti Logo">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <input accept="image/png, image/jpeg, image/webp" className="hidden" type="file" onChange={handleLogoChange} />
                      </label>
                      <button type="button" onClick={() => setLogo(null)} className="w-8 h-8 rounded-full bg-error/90 hover:bg-error text-white flex items-center justify-center transition-all shadow-sm" title="Hapus Logo">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Logo Bisnis</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Format PNG, JPG, atau WebP. Maksimal 2MB. Resolusi disarankan 512x512px.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Nama Bisnis <span className="text-error">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">storefront</span>
                  </div>
                  <input name="name" required defaultValue={business.name || ''} className="block w-full pl-10 pr-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50" placeholder="Kopi Bayaro" type="text" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Jenis Usaha <span className="text-error">*</span></label>
                <div className="relative">
                  <select name="type" required defaultValue={business.type || ''} className="block w-full pl-3 pr-10 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest appearance-none">
                    <option disabled value="">Pilih kategori usaha</option>
                    {BUSINESS_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-label-md text-label-md text-on-surface">NPWP <span className="text-outline-variant font-normal">(Opsional)</span></label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">receipt_long</span>
                </div>
                <input name="npwp" value={npwp} onChange={(e) => setNpwp(formatNPWP(e.target.value))} maxLength={20} className="block w-full pl-10 pr-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50" placeholder="00.000.000.0-000.000" type="text" inputMode="numeric" />
              </div>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">Format angka (opsional)</p>
            </div>
          </div>

          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary">contact_mail</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Kontak &amp; Lokasi Pusat</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Email Perusahaan <span className="text-error">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input name="email" required defaultValue={business.email || ''} className="block w-full pl-10 pr-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50" placeholder="halo@bisnis.com" type="email" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Nomor Telepon <span className="text-error">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">call</span>
                  </div>
                  <input name="phone" required value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="block w-full pl-10 pr-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50" placeholder="08xxxxxxxxxx" type="tel" inputMode="numeric" />
                </div>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">Wajib angka (contoh: 08123456789)</p>
              </div>
            </div>
            
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Alamat Lengkap <span className="text-error">*</span></label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                </div>
                <textarea name="address" required defaultValue={business.address || ''} className="block w-full pl-10 pr-3 py-3 border border-outline-variant/50 rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest placeholder:text-outline/50 resize-none" placeholder="Masukkan alamat lengkap bisnis kamu" rows={3}></textarea>
              </div>
            </div>
            <div className="mt-8">
              <RegionSelects 
                defaultValues={{
                  province: business.province,
                  city: business.city,
                  district: business.district,
                  village: business.subdistrict
                }}
                onChange={(data) => {
                  setBusiness({
                    province: data.province,
                    city: data.city,
                    district: data.district,
                    subdistrict: data.village
                  });
                }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 text-sm text-error bg-error-container rounded-lg">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          <div className="pt-6 border-t border-outline-variant/20 flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
            <button className="w-full md:w-auto px-6 py-3 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2" type="button" onClick={() => router.push("/onboarding/plan")}>Simpan Draft</button>
            <button className="w-full md:w-auto px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm" type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Lanjut ke Pilih Plan"}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>

      <Modal 
        open={viewImageOpen} 
        onClose={() => setViewImageOpen(false)}
        title="Lihat Logo"
        size="md"
      >
        <div className="flex justify-center p-4">
          {logo && <img src={logo} alt="Logo" className="max-w-full max-h-[70vh] rounded-lg object-contain" />}
        </div>
      </Modal>
    </div>
  );
}
