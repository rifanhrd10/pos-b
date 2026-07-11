import {
  BarChart2,
  Clock,
  LayoutDashboard,
  Printer,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tag,
  User,
  Users,
  Boxes,
  TrendingDown,
  SlidersHorizontal,
  ArrowRightLeft,
  ClipboardCheck,
  Building2,
  Percent,
  ReceiptText,
  Wallet,
  UserCog,
  Package,
  LayoutGrid,
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
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/pos", label: "POS Kasir", icon: Store, permission: "pos.access" },
  { href: "/shifts", label: "Shift Kasir", icon: Clock, permission: "pos.close_shift" },
  { href: "/products", label: "Daftar Produk", icon: LayoutGrid, permission: "products.view" },
  { href: "/categories", label: "Kategori", icon: Tag, permission: "products.view" },
  { href: "/products/new", label: "Tambah Produk", icon: ShoppingBag, permission: "products.manage" },
  { href: "/inventory", label: "Stok Overview", icon: Boxes, permission: "inventory.view" },
  { href: "/inventory/low-stock", label: "Stok Rendah", icon: TrendingDown, permission: "inventory.view" },
  { href: "/inventory/adjustments", label: "Penyesuaian Stok", icon: SlidersHorizontal, permission: "inventory.manage" },
  { href: "/inventory/transfers", label: "Transfer Stok", icon: ArrowRightLeft, permission: "inventory.manage" },
  { href: "/inventory/opname", label: "Stok Opname", icon: ClipboardCheck, permission: "inventory.manage" },
  { href: "/customers", label: "Pelanggan", icon: Users, permission: "customers.view" },
  { href: "/promos", label: "Promo & Diskon", icon: Tag, permission: "promos.view" },
  { href: "/reports/sales", label: "Penjualan", icon: BarChart2, permission: "reports.view" },
  { href: "/reports/products", label: "Produk Terlaris", icon: ShoppingBag, permission: "reports.view" },
  { href: "/reports/cashier", label: "Per Kasir", icon: Users, permission: "reports.view" },
  { href: "/reports/inventory", label: "Inventori", icon: Package, permission: "reports.view" },
  { href: "/employees", label: "Karyawan", icon: Users, permission: "employees.view" },
  { href: "/outlets", label: "Outlet", icon: Store, permission: "settings.manage" },
  { href: "/roles", label: "Role & Akses", icon: Shield, permission: "settings.manage" },
  { href: "/settings/business", label: "Profil Bisnis", icon: Building2, permission: "settings.manage" },
  { href: "/settings/tax", label: "Pajak & Service", icon: Percent, permission: "settings.manage" },
  { href: "/settings/receipt", label: "Template Struk", icon: ReceiptText, permission: "settings.manage" },
  { href: "/settings/payment", label: "Metode Bayar", icon: Wallet, permission: "settings.manage" },
  { href: "/settings/printer", label: "Printer", icon: Printer, permission: "settings.manage" },
  { href: "/settings", label: "Pengaturan", icon: Settings, permission: "settings.manage" },
  { href: "/profile", label: "Profil Saya", icon: User, permission: "settings.manage" },
  { href: "/settings/account", label: "Pengaturan Akun", icon: UserCog, permission: "settings.manage" },
];

export const navSections: NavSection[] = [
  {
    label: "Ringkasan",
    description: "Overview dan statistik utama.",
    items: ["/dashboard"],
  },
  {
    label: "POS Kasir",
    description: "Transaksi dan shift kasir.",
    items: ["/pos", "/shifts"],
  },
  {
    label: "Produk",
    description: "Kelola produk dan kategori.",
    items: ["/products", "/categories"],
  },
  {
    label: "Inventori",
    description: "Kelola stok dan transfer.",
    items: [
      "/inventory",
      "/inventory/low-stock",
      "/inventory/adjustments",
      "/inventory/transfers",
      "/inventory/opname",
    ],
  },
  {
    label: "Pelanggan & Promo",
    description: "CRM dan promo diskon.",
    items: ["/customers", "/promos"],
  },
  {
    label: "Laporan",
    description: "Laporan penjualan dan analitik.",
    items: [
      "/reports/sales",
      "/reports/products",
      "/reports/cashier",
      "/reports/inventory",
    ],
  },
  {
    label: "Operasional",
    description: "Kelola karyawan, outlet, dan peran.",
    items: ["/employees", "/outlets", "/roles"],
  },
  {
    label: "Pengaturan",
    description: "Konfigurasi bisnis dan sistem.",
    items: [
      "/settings/business",
      "/settings/tax",
      "/settings/receipt",
      "/settings/payment",
      "/settings/printer",
    ],
  },
  {
    label: "Akun",
    description: "Profil dan akun Anda.",
    items: ["/profile", "/settings/account"],
  },
];
