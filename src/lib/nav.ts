import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Users,
  UserRoundCog,
  Wallet,
  Archive,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export type NavSection = {
  label: string;
  description: string;
  items: string[];
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kasir", label: "Kasir", icon: ShoppingCart },
  { href: "/transaksi", label: "Transaksi", icon: ReceiptText },
  { href: "/kategori", label: "Kategori", icon: Tags },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/topping", label: "Topping / Menu Tambahan", icon: UtensilsCrossed },
  { href: "/stok", label: "Stok", icon: Boxes },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/karyawan-shift", label: "Karyawan & Shift", icon: UserRoundCog },
  { href: "/role-permission", label: "Role Permission", icon: Archive },
  { href: "/pembayaran", label: "Pembayaran", icon: CreditCard },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/outlet", label: "Outlet", icon: Store },
  { href: "/struk", label: "Struk", icon: Wallet },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
] ;

export const navSections: NavSection[] = [
  {
    label: "Ringkasan",
    description: "Pantau kondisi bisnis dan akses cepat.",
    items: ["/dashboard"],
  },
  {
    label: "Penjualan",
    description: "Alur transaksi harian dan pembayaran.",
    items: ["/kasir", "/transaksi", "/pembayaran", "/laporan"],
  },
  {
    label: "Menu & Inventori",
    description: "Kelola katalog, topping, stok, dan vendor.",
    items: ["/kategori", "/produk", "/topping", "/stok"],
  },
  {
    label: "Pelanggan & Tim",
    description: "Hubungan pelanggan dan operasional karyawan.",
    items: ["/pelanggan", "/karyawan-shift", "/role-permission"],
  },
  {
    label: "Outlet & Sistem",
    description: "Atur identitas outlet, struk, dan modul tambahan.",
    items: ["/outlet", "/struk", "/pengaturan"],
  },
];

export const lockedModules = [
  "Promo Basic",
  "Voucher Basic",
  "QR Menu",
  "Meja Sederhana",
  "Stock Opname",
  "Export Laporan",
  "Role Permission",
  "E-wallet Payment",
  "Debit/Kredit",
  "Split Payment",
  "Barcode Produk",
  "Reservasi Basic",
  "Backup Data",
];

export const starterHighlights = [
  { label: "Core Aktif", value: "14 modul" },
  { label: "Modul Tambahan", value: "14 included" },
  { label: "Status Paket", value: "Full Access" },
  { label: "Siap Dipakai", value: "UMKM, retail, dan kafe" },
];
