import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockAdjustmentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const parsed = stockAdjustmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input adjustment stok tidak valid." }, { status: 400 });
  }

  const { productId, quantity, note } = parsed.data;
  if (!productId) {
    return NextResponse.json({ message: "Produk wajib dipilih." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || product.deletedAt) throw new Error("Produk tidak ditemukan.");

      const beforeStock = product.stock;
      const afterStock = beforeStock + quantity;
      if (afterStock < 0) throw new Error("Stok tidak boleh menjadi negatif.");

      await tx.product.update({
        where: { id: productId },
        data: { stock: afterStock },
      });

      await tx.stockMovement.create({
        data: {
          outletId: product.outletId,
          productId: product.id,
          type: "ADJUSTMENT",
          quantity,
          beforeStock,
          afterStock,
          referenceType: "MANUAL_ADJUSTMENT",
          note: note || "Adjustment stok manual",
        },
      });

      return { message: "Adjustment stok berhasil disimpan." };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Adjustment gagal." }, { status: 400 });
  }
}
