import { redirect } from "next/navigation";
import { getBusinessContext, auth } from "@/lib/auth";
import { getTableMasterData } from "@/actions/tables";
import { TablesClient } from "./tables-client";

export default async function TablesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const context = await getBusinessContext(session.user.id);
  if (!context?.businessId) redirect("/dashboard");

  const data = await getTableMasterData(context.businessId);

  return <TablesClient outlets={data.outlets} tables={data.tables} activeOutletId={context.outletId} />;
}
