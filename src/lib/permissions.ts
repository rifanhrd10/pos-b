export const PERMISSIONS = {
  "dashboard.view": "Lihat dashboard",
  "pos.access": "Akses kasir",
  "pos.void": "Void transaksi",
  "pos.refund": "Refund transaksi",
  "pos.discount": "Beri diskon manual",
  "products.view": "Lihat produk",
  "products.manage": "Kelola produk (CRUD)",
  "products.pricing": "Ubah harga",
  "inventory.view": "Lihat stok",
  "inventory.manage": "Kelola stok",
  "reports.view": "Lihat laporan",
  "reports.export": "Export laporan",
  "employees.view": "Lihat karyawan",
  "employees.manage": "Kelola karyawan",
  "outlets.view": "Lihat outlet",
  "outlets.manage": "Kelola outlet",
  "settings.manage": "Kelola pengaturan",
  "settings.roles": "Kelola role & permission",
  "customers.view": "Lihat pelanggan",
  "customers.manage": "Kelola pelanggan",
  "promos.view": "Lihat promo",
  "promos.manage": "Kelola promo",
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const DEFAULT_ROLES: Record<string, { name: string; description: string; permissions: Permission[] }> = {
  OWNER: {
    name: "Owner",
    description: "Pemilik bisnis — akses penuh ke semua fitur",
    permissions: ALL_PERMISSIONS,
  },
  ADMIN: {
    name: "Admin",
    description: "Administrator — akses semua kecuali kelola role",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "settings.roles"),
  },
  MANAGER: {
    name: "Manager",
    description: "Kepala cabang — akses dashboard, POS, produk, laporan, karyawan",
    permissions: [
      "dashboard.view",
      "pos.access",
      "pos.discount",
      "products.view",
      "inventory.view",
      "reports.view",
      "employees.view",
      "customers.view",
      "customers.manage",
      "outlets.view",
    ],
  },
  CASHIER: {
    name: "Kasir",
    description: "Kasir — akses POS dan lihat produk",
    permissions: ["pos.access", "products.view", "customers.view"],
  },
  WAREHOUSE: {
    name: "Gudang",
    description: "Staff gudang — kelola stok dan lihat produk",
    permissions: ["inventory.view", "inventory.manage", "products.view"],
  },
};

export function hasPermission(userPermissions: string[], required: Permission | Permission[]): boolean {
  const perms = Array.isArray(required) ? required : [required];
  return perms.every((p) => userPermissions.includes(p));
}

export function hasAnyPermission(userPermissions: string[], required: Permission[]): boolean {
  return required.some((p) => userPermissions.includes(p));
}
