import { auth, getBusinessContext } from "@/lib/auth";
import { getMasterToppings } from "@/actions/master-options";
import { redirect } from "next/navigation";
import { ToppingsClient } from "./toppings-client";

export default async function MasterToppingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const toppings = await getMasterToppings(ctx.businessId);
  return <ToppingsClient toppings={toppings.map((topping) => ({ ...topping, price: Number(topping.price) }))} />;
}
