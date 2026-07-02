"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, X, ChevronDown } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Gratis",
    period: "selamanya",
    description: "Untuk bisnis kecil yang baru mulai",
    highlight: false,
    features: [
      { text: "1 outlet", included: true },
      { text: "2 kasir", included: true },
      { text: "Manajemen produk dasar", included: true },
      { text: "Laporan harian", included: true },
      { text: "Export data", included: false },
      { text: "Multi-outlet", included: false },
      { text: "Priority support", included: false },
      { text: "Custom branding", included: false },
    ],
    cta: "Mulai Gratis",
  },
  {
    name: "Professional",
    price: "Rp 299.000",
    period: "per bulan",
    description: "Untuk bisnis yang sedang berkembang",
    highlight: true,
    features: [
      { text: "5 outlet", included: true },
      { text: "Kasir tidak terbatas", included: true },
      { text: "Manajemen produk lengkap", included: true },
      { text: "Laporan harian & bulanan", included: true },
      { text: "Export data (CSV & PDF)", included: true },
      { text: "Multi-outlet dashboard", included: true },
      { text: "Priority support 24/7", included: false },
      { text: "Custom branding", included: false },
    ],
    cta: "Coba 14 Hari Gratis",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "hubungi kami",
    description: "Untuk jaringan bisnis skala besar",
    highlight: false,
    features: [
      { text: "Outlet tidak terbatas", included: true },
      { text: "Kasir tidak terbatas", included: true },
      { text: "Manajemen produk lengkap", included: true },
      { text: "Semua jenis laporan", included: true },
      { text: "Export data semua format", included: true },
      { text: "Multi-outlet dashboard", included: true },
      { text: "Priority support 24/7", included: true },
      { text: "Custom branding & white-label", included: true },
    ],
    cta: "Hubungi Sales",
  },
];

const FAQ = [
  { q: "Apakah ada masa percobaan gratis?", a: "Ya, paket Professional tersedia dengan masa percobaan 14 hari tanpa perlu kartu kredit." },
  { q: "Bisakah saya upgrade atau downgrade paket?", a: "Tentu bisa. Anda dapat mengubah paket kapan saja dan perubahan akan berlaku di periode billing berikutnya." },
  { q: "Bagaimana cara melakukan pembayaran?", a: "Kami menerima transfer bank, kartu kredit/debit, dan dompet digital (GoPay, OVO, Dana)." },
  { q: "Apakah data saya aman?", a: "Data Anda dienkripsi dengan AES-256 dan disimpan di server berlokasi di Indonesia." },
  { q: "Apa yang terjadi jika berlangganan habis?", a: "Akun Anda akan beralih ke paket Starter secara otomatis. Data Anda tidak akan dihapus." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Harga"
        description="Pilih paket yang sesuai dengan kebutuhan bisnis Anda."
        breadcrumb="Pages / Pricing"
      />

      {/* Header Section */}
      <div className="text-center pt-6">
        <div className="flex justify-center mb-4">
          <Badge tone="info">Harga Transparan</Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Pilih Paket yang Tepat untuk Bisnis Anda
        </h1>
        <p className="mt-3 text-slate-500 max-w-lg mx-auto">
          Semua paket sudah termasuk fitur inti Bayaro POS. Upgrade atau downgrade kapan saja tanpa biaya tambahan.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-[28px] border p-8 shadow-soft flex flex-col",
              plan.highlight
                ? "bg-bayaro-navy text-white border-bayaro-navy relative"
                : "bg-white border-slate-200",
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-bayaro-blue text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                  Paling Populer
                </span>
              </div>
            )}

            <div>
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  plan.highlight ? "text-blue-200" : "text-bayaro-blue",
                )}
              >
                {plan.name}
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span
                  className={cn(
                    "text-3xl font-bold",
                    plan.highlight ? "text-white" : "text-slate-900",
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm mb-1",
                    plan.highlight ? "text-blue-200" : "text-slate-400",
                  )}
                >
                  / {plan.period}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm mt-2",
                  plan.highlight ? "text-blue-100" : "text-slate-500",
                )}
              >
                {plan.description}
              </p>
            </div>

            <div
              className={cn(
                "my-6 border-t",
                plan.highlight ? "border-white/20" : "border-slate-100",
              )}
            />

            <ul className="space-y-3 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  {feature.included ? (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-400"
                    />
                  ) : (
                    <X
                      size={16}
                      className={cn(
                        "shrink-0",
                        plan.highlight ? "text-white/30" : "text-slate-300",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      feature.included
                        ? plan.highlight
                          ? "text-white"
                          : "text-slate-700"
                        : plan.highlight
                          ? "text-white/40"
                          : "text-slate-400",
                    )}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                variant={plan.highlight ? "secondary" : "primary"}
                className={cn(
                  "w-full",
                  plan.highlight && "bg-white text-bayaro-navy hover:bg-slate-50",
                )}
              >
                {plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-2xl mx-auto pb-10">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Pertanyaan Umum
        </h2>
        <div className="divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white shadow-soft overflow-hidden">
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition"
              >
                <span
                  className={cn(
                    "font-medium text-sm",
                    openFaq === i ? "text-bayaro-blue" : "text-slate-900",
                  )}
                >
                  {item.q}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-slate-400 transition-transform duration-200",
                    openFaq === i && "rotate-180",
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-slate-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
