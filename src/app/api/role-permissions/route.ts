import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    }),
  ]);

  return NextResponse.json({
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissionIds: role.rolePermissions.map((item) => item.permissionId),
    })),
    permissions: permissions.map((permission) => ({
      id: permission.id,
      module: permission.module,
      action: permission.action,
      description: permission.description,
    })),
  });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const roleId = String(payload.roleId || "");
  const permissionIds = Array.isArray(payload.permissionIds) ? payload.permissionIds.map(String) : [];

  if (!roleId) {
    return NextResponse.json({ message: "Role wajib dipilih." }, { status: 400 });
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ message: "Role tidak ditemukan." }, { status: 404 });
  }

  const validPermissions = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
    select: { id: true },
  });
  const validPermissionIds = validPermissions.map((item) => item.id);

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    if (validPermissionIds.length) {
      await tx.rolePermission.createMany({
        data: validPermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  });

  return NextResponse.json({
    message: `Hak akses role ${role.name} berhasil diperbarui.`,
    roleId,
    permissionIds: validPermissionIds,
  });
}
