import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      roleName: user.role.name,
      outletId: user.outletId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input karyawan tidak valid." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && !existing.deletedAt) {
    return NextResponse.json({ message: "Email karyawan sudah dipakai." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          roleId: parsed.data.roleId,
          outletId: parsed.data.outletId || null,
          isActive: parsed.data.isActive,
          deletedAt: null,
          passwordHash,
        },
        include: { role: true },
      })
    : await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          roleId: parsed.data.roleId,
          outletId: parsed.data.outletId || null,
          isActive: parsed.data.isActive,
          passwordHash,
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
