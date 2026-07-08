import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEmployeeByUserId, getAssignedOutlets } from "@/actions/kasir";
import { getKasirEmployeeId } from "@/lib/outlet-context";
import { OutletSelector } from "./outlet-selector";

export const dynamic = "force-dynamic";

export default async function OutletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employeeIdFromCookie = await getKasirEmployeeId();
  const employee = employeeIdFromCookie
    ? await getEmployeeByUserId(session.user.id as string)
    : null;

  if (!employee) {
    redirect("/kasir/pin");
  }

  const outlets = await getAssignedOutlets(employee.id);

  if (outlets.length === 0) {
    redirect("/kasir/pin");
  }

  if (outlets.length === 1) {
    redirect("/kasir/pos");
  }

  return (
    <OutletSelector
      employeeName={employee.name}
      outlets={outlets}
    />
  );
}
