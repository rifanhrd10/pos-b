import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getEmployeeByUserId,
  getActiveSession,
  getTables,
  getTableStatuses,
  getPosProducts,
  getPosCategories,
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
    select: { taxRate: true, serviceRate: true },
  });

  const businessTaxRate = business?.taxRate ?? 0;
  const businessServiceRate = business?.serviceRate ?? 0;

  const [tables, tableStatuses, products, categories] = await Promise.all([
    getTables(outletId),
    getTableStatuses(outletId),
    getPosProducts(outlet.businessId),
    getPosCategories(outlet.businessId),
  ]);

  return (
    <PosClient
      kasirName={employee.name}
      outletName={outlet.name}
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
    />
  );
}
