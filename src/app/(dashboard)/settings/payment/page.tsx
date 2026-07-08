export const dynamic = "force-dynamic";

import { auth, getBusinessContext } from "@/lib/auth";
import { getPaymentMethods } from "@/actions/settings";
import { redirect } from "next/navigation";
import { PaymentSettingsClient } from "./payment-settings-client";

export default async function PaymentSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const paymentMethods = await getPaymentMethods();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Metode Pembayaran</h1>
        <p className="text-sm text-slate-500">Kelola metode pembayaran yang tersedia di kasir</p>
      </div>
      <PaymentSettingsClient
        methods={paymentMethods}
        businessId={ctx.businessId}
      />
    </div>
  );
}
