import {
  Bell,
  Calendar,
  BarChart3,
  CreditCard,
  FileText,
  FolderOpen,
  Kanban,
  KeyRound,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  Settings,
  Shield,
  Store,
  Table,
  Tag,
  ToggleLeft,
  User,
  UserPlus,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  permission?: string;
};

export type NavSection = {
  label: string;
  description: string;
  items: string[];
  dropdown?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/employees", label: "Karyawan", icon: Users, permission: "employees.view" },
  { href: "/outlets", label: "Outlet", icon: Store, permission: "outlets.view" },
  { href: "/roles", label: "Role & Akses", icon: Shield, permission: "settings.roles" },
  { href: "/ui/tables", label: "Tables", icon: Table },
  { href: "/ui/forms", label: "Forms", icon: FileText },
  { href: "/ui/cards", label: "Cards", icon: CreditCard },
  { href: "/ui/modals", label: "Modals & Dialogs", icon: ToggleLeft },
  { href: "/ui/buttons", label: "Buttons & Badges", icon: Tag },
  { href: "/ui/alerts", label: "Alerts & Toast", icon: Bell },
  { href: "/pages/calendar", label: "Calendar", icon: Calendar },
  { href: "/pages/kanban", label: "Kanban Board", icon: Kanban },
  { href: "/pages/file-manager", label: "File Manager", icon: FolderOpen },
  { href: "/pages/chat", label: "Chat", icon: MessageSquare },
  { href: "/pages/invoice", label: "Invoice", icon: FileText },
  { href: "/pages/pricing", label: "Pricing", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Pengaturan", icon: Settings, permission: "settings.manage" },
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/register", label: "Register", icon: UserPlus },
  { href: "/forgot-password", label: "Lupa Password", icon: KeyRound },
];

export const navSections: NavSection[] = [
  {
    label: "Ringkasan",
    description: "Overview dan statistik utama.",
    items: ["/dashboard"],
  },
  {
    label: "Operasional",
    description: "Kelola karyawan, outlet, dan hak akses.",
    items: ["/employees", "/outlets", "/roles"],
  },
  {
    label: "UI Elements",
    description: "Komponen dan elemen UI siap pakai.",
    items: ["/ui/tables", "/ui/forms", "/ui/cards", "/ui/modals", "/ui/buttons", "/ui/alerts"],
  },
  {
    label: "Pages",
    description: "Halaman-halaman siap pakai untuk aplikasi.",
    items: ["/pages/calendar", "/pages/kanban", "/pages/file-manager", "/pages/chat", "/pages/invoice", "/pages/pricing"],
  },
  {
    label: "User",
    description: "Akun dan pengaturan pengguna.",
    items: ["/profile", "/settings"],
  },
  {
    label: "Auth Pages",
    description: "Halaman autentikasi.",
    items: ["/login", "/register", "/forgot-password"],
    dropdown: true,
  },
];
