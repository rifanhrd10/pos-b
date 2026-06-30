import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input karyawan tidak valid." }, { status: 400 });
  }

  const duplicate = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id } },
  });
  if (duplicate && !duplicate.deletedAt) {
    return NextResponse.json({ message: "Email karyawan sudah dipakai." }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      roleId: parsed.data.roleId,
      outletId: parsed.data.outletId || null,
      isActive: parsed.data.isActive,
    },
    include: { role: true },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId,
    roleName: user.role.name,
    outletId: user.outletId,
    isActive: user.isActive,
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
  return NextResponse.json({ message: "Karyawan berhasil dinonaktifkan." });
}
