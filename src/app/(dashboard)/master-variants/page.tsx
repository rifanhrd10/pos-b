import { auth, getBusinessContext } from "@/lib/auth";
import { getMasterVariants } from "@/actions/master-options";
import { redirect } from "next/navigation";
import { VariantsClient } from "./variants-client";

export default async function MasterVariantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const variants = await getMasterVariants(ctx.businessId);
  return (
    <VariantsClient
      variants={variants.map((variant) => ({
        ...variant,
        options: variant.options.map((option) => ({
          ...option,
          priceAdjustment: Number(option.priceAdjustment),
        })),
      }))}
    />
  );
}
