import {
  BarChart2,
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
  Package,
  Settings,
  Shield,
  ShoppingBag,
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
  { href: "/settings/business", label: "Profil Bisnis", icon: Settings, permission: "settings.manage" },
  { href: "/settings/tax", label: "Pajak & Service", icon: Settings, permission: "settings.manage" },
  { href: "/settings/receipt", label: "Template Struk", icon: Settings, permission: "settings.manage" },
  { href: "/settings/payment", label: "Metode Pembayaran", icon: Settings, permission: "settings.manage" },
  { href: "/settings/general", label: "General", icon: Settings, permission: "settings.manage" },
  { href: "/settings/account", label: "Akun", icon: Settings, permission: "settings.manage" },
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/register", label: "Register", icon: UserPlus },
  { href: "/forgot-password", label: "Lupa Password", icon: KeyRound },
  { href: "/inventory", label: "Stok Overview", icon: Package, permission: "inventory.view" },
  { href: "/inventory/low-stock", label: "Stok Rendah", icon: Package, permission: "inventory.view" },
  { href: "/inventory/adjustments", label: "Penyesuaian", icon: Package, permission: "inventory.view" },
  { href: "/inventory/transfers", label: "Transfer", icon: Package, permission: "inventory.view" },
  { href: "/inventory/opname", label: "Stok Opname", icon: Package, permission: "inventory.view" },
  { href: "/kasir", label: "POS Kasir", icon: Store, permission: "pos.access" },
  { href: "/promos", label: "Promo & Diskon", icon: Tag, permission: "settings.manage" },
  { href: "/reports/sales", label: "Penjualan", icon: BarChart2, permission: "settings.manage" },
  { href: "/reports/products", label: "Produk Terlaris", icon: ShoppingBag, permission: "settings.manage" },
  { href: "/reports/cashier", label: "Per Kasir", icon: Users, permission: "settings.manage" },
  { href: "/reports/inventory", label: "Inventori", icon: Package, permission: "settings.manage" },
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
    label: "Inventori",
    description: "Kelola stok, penyesuaian, dan transfer inventori.",
    items: [
      "/inventory",
      "/inventory/low-stock",
      "/inventory/adjustments",
      "/inventory/transfers",
      "/inventory/opname",
    ],
  },
  {
    label: "POS Kasir",
    description: "Akses kasir untuk transaksi penjualan.",
    items: ["/kasir"],
  },
  {
    label: "Penjualan",
    description: "Kelola promo, voucher, dan diskon.",
    items: ["/promos"],
  },
  {
    label: "Laporan",
    description: "Laporan penjualan, produk, kasir, dan inventori.",
    items: [
      "/reports/sales",
      "/reports/products",
      "/reports/cashier",
      "/reports/inventory",
    ],
  },
  {
    label: "Pengaturan",
    description: "Konfigurasi bisnis, pajak, struk, dan akun.",
    items: [
      "/settings/business",
      "/settings/tax",
      "/settings/receipt",
      "/settings/payment",
      "/settings/general",
      "/settings/account",
    ],
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
    items: ["/profile"],
  },
  {
    label: "Auth Pages",
    description: "Halaman autentikasi.",
    items: ["/login", "/register", "/forgot-password"],
    dropdown: true,
  },
];
