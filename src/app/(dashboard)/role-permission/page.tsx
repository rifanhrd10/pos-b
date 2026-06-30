import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { RolePermissionManager } from "@/components/forms/role-permission-manager";

export default async function RolePermissionPage() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        rolePermissions: true,
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Permission"
        description="Kelola hak akses per role untuk modul-modul Bayaro. Owner, admin, dan kasir bisa diberi kombinasi izin yang berbeda sesuai kebutuhan outlet."
        breadcrumb="Sistem / Role Permission"
      />
      <RolePermissionManager
        initialRoles={roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissionIds: role.rolePermissions.map((item) => item.permissionId),
        }))}
        permissions={permissions.map((permission) => ({
          id: permission.id,
          module: permission.module,
          action: permission.action,
          description: permission.description,
        }))}
      />
    </div>
  );
}
