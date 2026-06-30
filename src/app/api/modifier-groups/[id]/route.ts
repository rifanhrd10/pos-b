import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { modifierGroupSchema } from "@/lib/validations";

function serializeGroup(group: {
  id: string;
  name: string;
  description: string | null;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  isActive: boolean;
  _count?: { modifiers: number; products: number };
}) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    isRequired: group.isRequired,
    isActive: group.isActive,
    modifierCount: group._count?.modifiers || 0,
    productCount: group._count?.products || 0,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = modifierGroupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input grup topping tidak valid." }, { status: 400 });
  }

  const group = await prisma.modifierGroup.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      minSelect: parsed.data.minSelect,
      maxSelect: parsed.data.maxSelect,
      isRequired: parsed.data.isRequired,
      isActive: parsed.data.isActive,
    },
    include: {
      _count: {
        select: {
          modifiers: { where: { deletedAt: null } },
          products: true,
        },
      },
    },
  });

  return NextResponse.json(serializeGroup(group));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [productCount, modifierCount] = await Promise.all([
    prisma.productModifierGroup.count({ where: { modifierGroupId: id } }),
    prisma.modifier.count({ where: { modifierGroupId: id, deletedAt: null } }),
  ]);

  if (productCount > 0 || modifierCount > 0) {
    await prisma.modifierGroup.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return NextResponse.json({
      message: "Grup topping sudah punya relasi sehingga dinonaktifkan dengan soft delete.",
    });
  }

  await prisma.modifierGroup.delete({ where: { id } });
  return NextResponse.json({ message: "Grup topping berhasil dihapus." });
}
