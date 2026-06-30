import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { modifierSchema } from "@/lib/validations";

function serializeModifier(modifier: {
  id: string;
  modifierGroupId: string;
  name: string;
  price: unknown;
  costPrice: unknown;
  sku: string | null;
  stock: number | null;
  isStockTracked: boolean;
  isActive: boolean;
  modifierGroup: { name: string };
}) {
  return {
    id: modifier.id,
    modifierGroupId: modifier.modifierGroupId,
    groupName: modifier.modifierGroup.name,
    name: modifier.name,
    price: decimalToNumber(modifier.price),
    costPrice: modifier.costPrice ? decimalToNumber(modifier.costPrice) : null,
    sku: modifier.sku,
    stock: modifier.stock,
    isStockTracked: modifier.isStockTracked,
    isActive: modifier.isActive,
  };
}

export async function GET() {
  const modifiers = await prisma.modifier.findMany({
    where: { deletedAt: null },
    include: { modifierGroup: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(modifiers.map(serializeModifier));
}

export async function POST(request: Request) {
  const parsed = modifierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input topping tidak valid." }, { status: 400 });
  }

  const modifier = await prisma.modifier.create({
    data: {
      modifierGroupId: parsed.data.modifierGroupId,
      name: parsed.data.name,
      price: parsed.data.price,
      costPrice: parsed.data.costPrice ?? null,
      sku: parsed.data.sku || null,
      stock: parsed.data.isStockTracked ? parsed.data.stock ?? 0 : null,
      isStockTracked: parsed.data.isStockTracked,
      isActive: parsed.data.isActive,
    },
    include: { modifierGroup: true },
  });

  return NextResponse.json(serializeModifier(modifier));
}
