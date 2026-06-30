import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { CustomerManager } from "@/components/forms/customer-manager";

export default async function CustomerPage() {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { transactions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description="Kelola data pelanggan dasar dan riwayat transaksi dalam satu panel CRM Bayaro." breadcrumb="CRM / Pelanggan" />
      <CustomerManager initialCustomers={customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        note: customer.note,
        createdAt: customer.createdAt.toISOString(),
        transactionCount: customer._count.transactions,
      }))} />
    </div>
  );
}
