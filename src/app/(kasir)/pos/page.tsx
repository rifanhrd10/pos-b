import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getEmployeeByUserId,
  getActiveSession,
  getTables,
  getTableStatuses,
  getPosProducts,
  getPosCategories,
  getPaymentMethods,
} from "@/actions/kasir";
import { getKasirEmployeeId, getKasirOutletId } from "@/lib/outlet-context";
import { prisma } from "@/lib/prisma";
import { PosClient } from "./pos-client";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employeeId = await getKasirEmployeeId();
  const outletId = await getKasirOutletId();

  if (!employeeId || !outletId) {
    redirect("/kasir/pin");
  }

  const employee = await getEmployeeByUserId(session.user.id as string);
  if (!employee) {
    redirect("/kasir/pin");
  }

  const activeSession = await getActiveSession(employeeId, outletId);

  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { name: true, businessId: true },
  });

  if (!outlet) {
    redirect("/kasir/pin");
  }

  const business = await prisma.business.findUnique({
    where: { id: outlet.businessId },
    select: { 
      name: true,
      address: true,
      phone: true,
      taxRate: true, 
      serviceRate: true 
    },
  });

  const businessTaxRate = business?.taxRate ?? 0;
  const businessServiceRate = business?.serviceRate ?? 0;

  const [tables, tableStatuses, products, categories, paymentMethods, businessSettings] = await Promise.all([
    getTables(outletId),
    getTableStatuses(outletId),
    getPosProducts(outlet.businessId),
    getPosCategories(outlet.businessId),
    getPaymentMethods(outlet.businessId),
    prisma.businessSettings.findUnique({
      where: { businessId: outlet.businessId },
      select: {
        receiptHeader1: true,
        receiptHeader2: true,
        receiptHeader3: true,
        receiptFooter: true,
        receiptShowLogo: true,
        receiptShowAddress: true,
        receiptShowPhone: true,
        receiptShowKasir: true,
        receiptThankYou: true,
      },
    }),
  ]);

  const receiptSettings = businessSettings ? {
    header1: businessSettings.receiptHeader1,
    header2: businessSettings.receiptHeader2,
    header3: businessSettings.receiptHeader3,
    footer: businessSettings.receiptFooter,
    showLogo: businessSettings.receiptShowLogo ?? undefined,
    showAddress: businessSettings.receiptShowAddress ?? undefined,
    showPhone: businessSettings.receiptShowPhone ?? undefined,
    showKasir: businessSettings.receiptShowKasir ?? undefined,
    thankYou: businessSettings.receiptThankYou,
  } : null;

  return (
    <PosClient
      kasirName={employee.name}
      outletName={outlet.name}
      businessName={business?.name ?? ""}
      businessAddress={business?.address}
      businessPhone={business?.phone}
      employeeId={employeeId}
      outletId={outletId}
      businessId={outlet.businessId}
      activeSession={activeSession}
      tables={tables}
      tableStatuses={tableStatuses}
      products={products}
      categories={categories}
      businessTaxRate={businessTaxRate}
      businessServiceRate={businessServiceRate}
      paymentMethods={paymentMethods}
      receiptSettings={receiptSettings}
    />
  );
}
