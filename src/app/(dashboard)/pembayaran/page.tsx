import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentMethodManager } from "@/components/forms/payment-method-manager";

export default async function PaymentPage() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="Pembayaran" description="Seluruh metode pembayaran Bayaro aktif di aplikasi ini, termasuk channel premium seperti e-wallet dan kartu." breadcrumb="Operasional / Pembayaran" />
      <PaymentMethodManager initialMethods={methods} />
    </div>
  );
}
