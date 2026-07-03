# Phase 2: RBAC + Employee Management

**Goal:** Role-based access control dan manajemen karyawan per-outlet.  
**Estimasi:** 3-4 hari  
**Dependencies:** Phase 1  
**Priority:** P0

---

## 1. Database Schema

```prisma
enum DefaultRole {
  OWNER
  ADMIN
  MANAGER
  CASHIER
  WAREHOUSE
}

model Role {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  permissions String[]
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())

  business    Business   @relation(fields: [businessId], references: [id], onDelete: Cascade)
  employees   Employee[]

  @@unique([businessId, name])
}

model Employee {
  id          String   @id @default(cuid())
  businessId  String
  userId      String?
  outletId    String?
  roleId      String
  name        String
  email       String?
  phone       String?
  pin         String?         // 4-6 digit PIN for kasir
  isActive    Boolean  @default(true)
  startDate   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user        User?         @relation(fields: [userId], references: [id])
  outlet      Outlet?       @relation(fields: [outletId], references: [id])
  role        Role          @relation(fields: [roleId], references: [id])
  transactions Transaction[]
}
```

---

## 2. Permission System

```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  // Dashboard
  "dashboard.view": "Lihat dashboard",
  
  // POS
  "pos.access": "Akses kasir",
  "pos.void": "Void transaksi",
  "pos.refund": "Refund transaksi",
  "pos.discount": "Beri diskon manual",
  
  // Products
  "products.view": "Lihat produk",
  "products.manage": "Kelola produk (CRUD)",
  "products.pricing": "Ubah harga",
  
  // Inventory
  "inventory.view": "Lihat stok",
  "inventory.manage": "Kelola stok",
  
  // Reports
  "reports.view": "Lihat laporan",
  "reports.export": "Export laporan",
  
  // Employees
  "employees.view": "Lihat karyawan",
  "employees.manage": "Kelola karyawan",
  
  // Outlets
  "outlets.view": "Lihat outlet",
  "outlets.manage": "Kelola outlet",
  
  // Settings
  "settings.manage": "Kelola pengaturan",
  "settings.roles": "Kelola role & permission",
  
  // Customers
  "customers.view": "Lihat pelanggan",
  "customers.manage": "Kelola pelanggan",
  
  // Promos
  "promos.view": "Lihat promo",
  "promos.manage": "Kelola promo",
} as const;

// Default role templates
export const DEFAULT_ROLES = {
  OWNER: Object.keys(PERMISSIONS),   // semua permission
  ADMIN: [/* semua kecuali settings.roles */],
  MANAGER: ["dashboard.view", "pos.access", "pos.discount", "products.view", 
            "inventory.view", "reports.view", "employees.view", "customers.view"],
  CASHIER: ["pos.access", "products.view", "customers.view"],
  WAREHOUSE: ["inventory.view", "inventory.manage", "products.view"],
};
```

---

## 3. Pages & Routes

```
src/app/(dashboard)/
  employees/
    page.tsx              — Daftar karyawan (table + search + filter)
    [id]/page.tsx         — Detail karyawan
    new/page.tsx          — Tambah karyawan baru
  roles/
    page.tsx              — Daftar role + permission matrix
    [id]/page.tsx         — Edit role permissions
    new/page.tsx          — Buat role baru
```

---

## 4. Features

- CRUD karyawan (nama, email, phone, PIN, role, outlet assignment)
- Invite karyawan via email (optional)
- PIN kasir (4-6 digit) untuk operasi POS
- Role management: buat role custom, assign permissions
- Permission check middleware per-route dan per-action
- Employee list: filter by outlet, role, status
- Auto-create default roles saat bisnis dibuat (Owner, Admin, Kasir)

---

## 5. Server Actions

```typescript
// src/actions/employees.ts
getEmployees(filters)        — List + pagination + filters
getEmployee(id)              — Detail
createEmployee(data)         — Create + assign role/outlet
updateEmployee(id, data)     — Update
toggleEmployeeStatus(id)     — Activate/deactivate
setEmployeePin(id, pin)      — Set/reset kasir PIN

// src/actions/roles.ts
getRoles()                   — List roles
createRole(data)             — Create custom role
updateRolePermissions(id, permissions) — Update
deleteRole(id)               — Delete (non-system only)
```

---

## 6. Deliverables Checklist

```
- [ ] Add Role + Employee models to Prisma schema
- [ ] Create migration
- [ ] Seed default roles on business creation (Owner, Admin, Kasir)
- [ ] Build permission checking utility (hasPermission, requirePermission)
- [ ] Build employee list page with filters
- [ ] Build add/edit employee form
- [ ] Build role management page with permission matrix
- [ ] Add PIN setup for kasir
- [ ] Protect routes based on permissions
- [ ] Update sidebar nav to show/hide items based on role
- [ ] Test: create employee, assign role, verify access
- [ ] Commit
```
