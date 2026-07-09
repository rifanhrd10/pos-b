import { auth, getBusinessContext } from "@/lib/auth";
import { getBusinessSettings } from "@/actions/settings";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PrinterSettingsClient } from "./printer-settings-client";

export const dynamic = "force-dynamic";

export default async function PrinterSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const data = await getBusinessSettings();
  const autoPrint = data?.settings?.autoPrintReceipt ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Printer"
        description="Konfigurasi printer termal dan cetak struk"
        breadcrumb="Pengaturan / Printer"
      />
      <PrinterSettingsClient
        autoPrintReceipt={autoPrint}
        businessName={data?.business?.name ?? "Bisnis Saya"}
        businessAddress={data?.business?.address ?? null}
        businessPhone={data?.business?.phone ?? null}
      />
    </div>
  );
}
