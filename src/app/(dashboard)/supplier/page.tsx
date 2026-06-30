import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierManager } from "@/components/forms/supplier-manager";

export default async function SupplierPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier"
        description="Kelola supplier, contact person, dan informasi vendor dasar yang dibutuhkan untuk operasional Bayaro."
        breadcrumb="Operasional / Supplier"
      />
      <SupplierManager
        initialSuppliers={suppliers.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          note: supplier.note,
          isActive: supplier.isActive,
          createdAt: supplier.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
