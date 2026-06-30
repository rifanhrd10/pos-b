import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { items: { include: { modifiers: true } }, payments: true },
      });
      if (!transaction) throw new Error("Transaksi tidak ditemukan.");
      if (transaction.status !== "PAID") throw new Error("Refund hanya bisa untuk transaksi PAID.");

      for (const item of transaction.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product?.isStockTracked) {
          const beforeStock = product.stock;
          const afterStock = beforeStock + item.quantity;
          await tx.product.update({ where: { id: product.id }, data: { stock: afterStock } });
          await tx.stockMovement.create({
            data: {
              outletId: transaction.outletId,
              productId: product.id,
              type: "REFUND",
              quantity: item.quantity,
              beforeStock,
              afterStock,
              referenceType: "TRANSACTION_REFUND",
              referenceId: transaction.id,
              note: `Refund ${transaction.transactionNumber}`,
            },
          });
        }

        for (const mod of item.modifiers) {
          const modifier = await tx.modifier.findUnique({ where: { id: mod.modifierId } });
          if (modifier?.isStockTracked) {
            const beforeStock = modifier.stock || 0;
            const afterStock = beforeStock + mod.quantity;
            await tx.modifier.update({ where: { id: modifier.id }, data: { stock: afterStock } });
            await tx.stockMovement.create({
              data: {
                outletId: transaction.outletId,
                modifierId: modifier.id,
                type: "REFUND",
                quantity: mod.quantity,
                beforeStock,
                afterStock,
                referenceType: "TRANSACTION_REFUND",
                referenceId: transaction.id,
                note: `Refund ${transaction.transactionNumber}`,
              },
            });
          }
        }
      }

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "REFUNDED" },
      });

      await tx.transactionPayment.updateMany({
        where: { transactionId: transaction.id },
        data: { status: "REFUNDED" },
      });
    });

    return NextResponse.json({ message: "Transaksi berhasil direfund dan stok dikembalikan." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Refund gagal." }, { status: 400 });
  }
}
