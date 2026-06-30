import { prisma } from "@/lib/prisma";
import { OutletSettingsForm } from "@/components/forms/outlet-settings-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function OutletPage() {
  const outlet = await prisma.outlet.findFirst({ where: { deletedAt: null } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outlet"
        description="Edit profil outlet karena data ini memengaruhi transaksi, struk, shift, dan laporan dasar."
        breadcrumb="Pengaturan / Outlet"
      />
      <OutletSettingsForm
        outlet={
          outlet
            ? {
                name: outlet.name,
                phone: outlet.phone,
                email: outlet.email,
                address: outlet.address,
                taxRate: Number(outlet.taxRate),
                serviceChargeRate: Number(outlet.serviceChargeRate),
                receiptFooter: outlet.receiptFooter,
              }
            : null
        }
      />
    </div>
  );
}
