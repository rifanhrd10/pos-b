"use client";

import { usePathname } from "next/navigation";
import { BayaroLogo } from "@/components/shared/logo";
import { OnboardingStepper } from "@/components/shared/onboarding-stepper";
import { Sparkles, Building2, Store, CheckCircle2, Clock } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  
  const steps = [
    { 
      id: "business", 
      title: "Profil Bisnis", 
      desc: "Nama, tipe, dan info bisnis",
      icon: Building2,
      active: pathname.includes("/business"),
      completed:
        pathname.includes("/plan") ||
        pathname.includes("/outlet") ||
        pathname.includes("/operations") ||
        pathname.includes("/complete")
    },
    { 
      id: "plan", 
      title: "Pilih Plan", 
      desc: "Starter, Pro, atau Enterprise",
      icon: Sparkles,
      active: pathname.includes("/plan"),
      completed:
        pathname.includes("/outlet") ||
        pathname.includes("/operations") ||
        pathname.includes("/complete")
    },
    { 
      id: "outlet", 
      title: "Setup Outlet", 
      desc: "Lokasi toko atau cabang",
      icon: Store,
      active: pathname.includes("/outlet"),
      completed:
        pathname.includes("/operations") || pathname.includes("/complete")
    },
    { 
      id: "operations", 
      title: "Operasional", 
      desc: "Jam buka, tutup, dan shift",
      icon: Clock,
      active: pathname.includes("/operations"),
      completed: pathname.includes("/complete")
    },
    { 
      id: "complete", 
      title: "Selesai", 
      desc: "Dashboard siap digunakan",
      icon: CheckCircle2,
      active: pathname.includes("/complete"),
      completed: false
    }
  ];

  return (
    <main className="grid min-h-screen lg:grid-cols-[380px_1fr] bg-white">
      {/* Left sidebar - Premium Dark Theme */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0F1C] p-10 text-white lg:flex border-r border-white/5 shadow-2xl">
        <div className="absolute -left-[30%] -top-[10%] h-[60%] w-[60%] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[20%] h-[50%] w-[50%] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 shadow-lg">
            <BayaroLogo compact />
          </div>
          <span className="font-heading text-2xl font-bold tracking-wider text-white">BAYARO</span>
        </div>

        <div className="relative z-10 space-y-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md mb-6">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight">
              Setup bisnis kamu dalam 5 langkah.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Hanya butuh kurang dari 2 menit. Seluruh pengaturan ini dapat diubah kapan saja melalui halaman Settings.
            </p>
          </div>

          {/* Premium Vertical Stepper */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4">
                {/* Connecting line */}
                {index !== steps.length - 1 && (
                  <div className={`absolute left-[19px] top-[40px] bottom-[-24px] w-[2px] rounded-full transition-colors duration-500 ${step.completed ? "bg-cyan-500" : "bg-white/5"}`} />
                )}
                
                {/* Step Icon */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  step.active ? "border-cyan-400 bg-cyan-400/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" : 
                  step.completed ? "border-cyan-500 bg-cyan-500 text-white" : 
                  "border-white/10 bg-[#0A0F1C] text-slate-600"
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                
                {/* Step Text */}
                <div className="pt-2">
                  <h3 className={`font-semibold transition-colors duration-500 ${step.active ? "text-white" : step.completed ? "text-slate-300" : "text-slate-500"}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${step.active ? "text-cyan-200/70" : "text-slate-600"}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-slate-600">
          © {new Date().getFullYear()} Bayaro Technologies
        </div>
      </aside>

      {/* Right content area - Clean & Minimalist */}
      <div className="flex flex-col bg-[#F8FAFC] lg:bg-white h-screen overflow-y-auto overflow-x-hidden relative">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur-md sticky top-0 z-50 lg:hidden">
          <BayaroLogo />
          <OnboardingStepper />
        </div>

        {/* Dynamic Background for Right Side */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute -left-[10%] -top-[10%] h-[70vh] w-[70vh] animate-[spin_20s_linear_infinite] rounded-full bg-gradient-to-br from-cyan-300/5 to-blue-500/5 blur-[100px]" />
          <div className="absolute -right-[10%] -bottom-[10%] h-[70vh] w-[70vh] animate-[spin_25s_linear_infinite_reverse] rounded-full bg-gradient-to-br from-violet-300/5 to-blue-500/5 blur-[100px]" />
        </div>

        {/* Changed back to items-start with margin to fix top cut-off issue */}
        <div className="relative z-10 flex flex-1 items-start justify-center p-6 lg:p-12 pt-12 lg:pt-20">
          <div className="w-full max-w-2xl">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
