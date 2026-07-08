"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Receipt,
  FileText,
  CreditCard,
  Settings,
  User,
  LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Receipt,
  FileText,
  CreditCard,
  Settings,
  User,
}

interface NavItem {
  label: string
  href: string
  icon: string
}

export function SettingsNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(item.href)
  const Icon = iconMap[item.icon]

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-indigo-50 font-medium text-indigo-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {item.label}
    </Link>
  )
}
