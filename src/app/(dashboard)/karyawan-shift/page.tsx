import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeManager } from "@/components/forms/employee-manager";
import { ShiftManager } from "@/components/forms/shift-manager";

export default async function EmployeeShiftPage() {
  const [users, shifts, roles] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shift.findMany({
      include: { user: true },
      orderBy: { openedAt: "desc" },
      take: 10,
    }),
    prisma.role.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Karyawan & Shift" description="Kelola user, role, dan shift operasional Bayaro dari satu modul tim." breadcrumb="Operasional / Karyawan & Shift" />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <EmployeeManager
          outletId={users[0]?.outletId || ""}
          roles={roles.map((role) => ({ id: role.id, name: role.name }))}
          initialEmployees={users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roleId: user.roleId,
            roleName: user.role.name,
            outletId: user.outletId,
            isActive: user.isActive,
          }))}
        />
        <ShiftManager
          outletId={users[0]?.outletId || ""}
          users={users.map((user) => ({ id: user.id, name: user.name, role: user.role.name, isActive: user.isActive }))}
          shifts={shifts.map((shift) => ({
            id: shift.id,
            userName: shift.user.name,
            openedAt: shift.openedAt.toISOString(),
            closedAt: shift.closedAt?.toISOString() || null,
            openingCash: decimalToNumber(shift.openingCash),
            closingCash: shift.closingCash ? decimalToNumber(shift.closingCash) : null,
            expectedCash: shift.expectedCash ? decimalToNumber(shift.expectedCash) : null,
            cashDifference: shift.cashDifference ? decimalToNumber(shift.cashDifference) : null,
            status: shift.status,
          }))}
        />
      </div>
    </div>
  );
}
