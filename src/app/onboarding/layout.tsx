"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
    { 
      id: "business", 
      title: "Profil Bisnis", 
      desc: "Nama, tipe, dan info bisnis",
      icon: "business_center",
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
      icon: "payments",
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
      icon: "storefront",
      active: pathname.includes("/outlet"),
      completed:
        pathname.includes("/operations") || pathname.includes("/complete")
    },
    { 
      id: "operations", 
      title: "Operasional", 
      desc: "Jam buka, tutup, dan shift",
      icon: "settings_suggest",
      active: pathname.includes("/operations"),
      completed: pathname.includes("/complete")
    },
    { 
      id: "complete", 
      title: "Pengecekan Akhir", 
      desc: "Periksa kembali data Anda",
      icon: "check_circle",
      active: pathname.includes("/complete"),
      completed: false
    }
  ];

  const activeStepIndex = steps.findIndex(s => s.active) + 1;

  return (
    <div className="flex h-screen bg-surface overflow-hidden text-on-surface font-body-lg">
      {/* Sidebar */}
      <aside 
        className="hidden md:flex fixed left-0 top-0 h-full w-[360px] rounded-r-3xl shadow-soft flex-col py-10 px-8 justify-between z-10 transition-transform duration-300 bg-[#0A1945]"
      >
        <div>
          <img src="/branding/bayaro-logo-transparent.png" alt="Bayaro" className="h-[100px] brightness-0 invert ml-[-20px]" />

          {/* Header Info */}
          <div className="mb-10 text-white">
            <h1 className="font-display-lg text-3xl leading-tight mb-4 tracking-tight">Setup bisnis kamu<br/>dalam 5 langkah.</h1>
            <p className="font-body-md text-sm text-white/70 leading-relaxed">
              Hanya butuh kurang dari 2 menit. Seluruh pengaturan ini dapat diubah kapan saja melalui halaman Settings.
            </p>
          </div>

          {/* Navigation Stepper */}
          <nav className="flex flex-col gap-8 relative mt-12">
            {/* Vertical Line Connector */}
            <div className="absolute left-[1.125rem] top-8 bottom-8 w-[2px] bg-white/10 -z-10"></div>

            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-start gap-4 relative group transition-opacity duration-200",
                  step.active || step.completed ? "opacity-100" : "opacity-50 hover:opacity-100"
                )}
              >
                <div 
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-200 bg-[#0A1945]",
                    step.active ? "border-white scale-110" : "border-white/20"
                  )}
                >
                  <span className={cn(
                    "material-symbols-outlined text-lg",
                    step.active ? "text-white" : "text-white/50"
                  )}>
                    {step.icon}
                  </span>
                </div>
                <div className="pt-2">
                  <span className={cn(
                    "block font-label-md text-sm font-bold tracking-wide",
                    step.active ? "text-white" : "text-white/70"
                  )}>
                    {step.title}
                  </span>
                  <span className={cn(
                    "block font-body-md text-xs mt-1",
                    step.active ? "text-white/70" : "text-white/50"
                  )}>
                    {step.desc}
                  </span>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-white/50">
          <span className="font-label-sm text-[10px]">© {new Date().getFullYear()} Bayaro Technologies</span>
          <button 
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-2 font-label-sm text-xs hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col md:ml-[360px] h-full overflow-y-auto bg-surface px-6 py-10 md:px-12 md:py-16",
        isMobile && 'pt-24'
      )}>
        <div className="w-full relative">
          {children}
          {/* Bottom spacer for mobile scrolling */}
          <div className="h-12 md:h-0"></div>
        </div>
      </main>

      {/* Mobile Nav Header (Visible only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A1945] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2 text-white font-display-lg-mobile font-bold tracking-tight">
          <span className="material-symbols-outlined filled-icon text-white text-xl">rocket_launch</span>
          <span className="text-xl">Bayaro</span>
        </div>
        <div className="text-white font-label-sm bg-white/10 px-3 py-1 rounded-full text-xs">
          {activeStepIndex}/5
        </div>
      </div>

      <Modal 
        open={logoutOpen} 
        onClose={() => setLogoutOpen(false)}
        title="Konfirmasi Keluar"
        size="sm"
      >
        <div className="text-on-surface">
          Apakah Anda yakin ingin keluar dari akun ini?
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setLogoutOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={() => signOut({ callbackUrl: "/login" })}>
            Ya, Keluar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
