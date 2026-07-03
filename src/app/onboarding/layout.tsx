import { BayaroLogo } from "@/components/shared/logo";
import { OnboardingStepper } from "@/components/shared/onboarding-stepper";
import { Boxes } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[380px_1fr]">
      {/* Left sidebar - permanent on desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-bayaro-navy p-10 text-white lg:flex">
        <div className="absolute -left-[30%] -top-[10%] h-[60%] w-[60%] rounded-full bg-bayaro-blue/25 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[20%] h-[50%] w-[50%] rounded-full bg-cyan-400/15 blur-[100px]" />

        <div className="relative z-10">
          <BayaroLogo dark />
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Boxes className="h-6 w-6 text-cyan-300" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold leading-tight">
              Setup toko kamu dalam 3 langkah mudah
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-200/80">
              Butuh kurang dari 2 menit. Kamu bisa ubah semua ini kapan saja dari Settings.
            </p>
          </div>

          {/* Step list */}
          <div className="space-y-4">
            {[
              { step: 1, title: "Profil Bisnis", desc: "Nama, jenis, dan logo" },
              { step: 2, title: "Outlet Pertama", desc: "Lokasi, jam operasional" },
              { step: 3, title: "Siap Digunakan", desc: "Mulai atau isi demo data" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-cyan-300">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-blue-200/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200/50">
          © {new Date().getFullYear()} Bayaro Technologies
        </div>
      </aside>

      {/* Right content area */}
      <div className="flex flex-col bg-slate-50">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 lg:px-10">
          <div className="flex lg:hidden">
            <BayaroLogo />
          </div>
          <OnboardingStepper />
        </div>

        {/* Page content */}
        <div className="flex flex-1 items-start justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-2xl">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
