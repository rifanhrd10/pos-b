import { SettingsNavLink } from "./settings-nav-link"

const settingsNav = [
  { label: "Profil Bisnis", href: "/settings/business", icon: "Building2" },
  { label: "Pajak & Service", href: "/settings/tax", icon: "Receipt" },
  { label: "Template Struk", href: "/settings/receipt", icon: "FileText" },
  { label: "Metode Pembayaran", href: "/settings/payment", icon: "CreditCard" },
  { label: "General", href: "/settings/general", icon: "Settings" },
  { label: "Akun", href: "/settings/account", icon: "User" },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500">Kelola konfigurasi bisnis Anda</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left sidebar */}
        <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24 h-fit">
          <nav className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-soft">
            {settingsNav.map((item) => (
              <SettingsNavLink key={item.href} item={item} />
            ))}
          </nav>
        </aside>
        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
