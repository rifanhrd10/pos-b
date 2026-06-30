import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      modifierGroups: {
        include: {
          modifierGroup: {
            include: {
              modifiers: { where: { deletedAt: null, isActive: true } },
            },
          },
        },
      },
    },
  });

  if (!product || product.deletedAt) {
    return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(product.modifierGroups);
}
