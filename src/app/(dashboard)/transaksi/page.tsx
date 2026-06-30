import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionListManager } from "@/components/transactions/transaction-list-manager";

export default async function TransactionPage() {
  const transactions = await prisma.transaction.findMany({
    where: { deletedAt: null },
    include: { cashier: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Daftar transaksi tidak menggunakan CRUD bebas. Detail transaksi tersimpan sebagai snapshot dan bisa digunakan untuk cetak ulang struk atau refund."
        breadcrumb="Operasional / Transaksi"
      />
      <TransactionListManager
        transactions={transactions.map((transaction) => ({
          id: transaction.id,
          transactionNumber: transaction.transactionNumber,
          cashierName: transaction.cashier.name,
          createdAt: transaction.createdAt.toISOString(),
          grandTotal: decimalToNumber(transaction.grandTotal),
          status: transaction.status,
          itemCount: transaction.items.length,
        }))}
      />
    </div>
  );
}
