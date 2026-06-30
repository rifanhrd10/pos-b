import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ReceiptSettingsForm } from "@/components/forms/receipt-settings-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function ReceiptPage() {
  const [outlet, receipt] = await Promise.all([
    prisma.outlet.findFirst({ where: { deletedAt: null } }),
    prisma.receiptSetting.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Struk"
        description="Atur tampilan struk dengan live preview sederhana. Data struk mengambil outlet, transaksi, item, topping, pelanggan, dan kasir."
        breadcrumb="Pengaturan / Struk"
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.75fr]">
        <ReceiptSettingsForm
          receipt={
            receipt
              ? {
                  headerText: receipt.headerText,
                  footerText: receipt.footerText,
                  paperSize: receipt.paperSize,
                  showLogo: receipt.showLogo,
                  showCashierName: receipt.showCashierName,
                  showCustomerName: receipt.showCustomerName,
                  showTax: receipt.showTax,
                  showServiceCharge: receipt.showServiceCharge,
                }
              : null
          }
        />

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
          <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-5">
            <div className="mx-auto max-w-[340px] rounded-3xl bg-white p-5 shadow-sm">
              {receipt?.showLogo ? (
                <Image src="/branding/bayaro-app-icon-blue.png" alt="Bayaro" width={54} height={54} className="mx-auto" />
              ) : null}
              <p className="mt-3 text-center text-lg font-bold text-slate-900">{receipt?.headerText || "Bayaro POS"}</p>
              <p className="mt-1 text-center text-sm text-slate-500">{outlet?.name}</p>
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Kopi Susu Aren</span><span>Rp28.000</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>+ Boba</span><span>Rp5.000</span></div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-semibold"><span>Total</span><span>Rp36.630</span></div>
              </div>
              <p className="mt-5 text-center text-xs leading-5 text-slate-500">{receipt?.footerText || outlet?.receiptFooter}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
