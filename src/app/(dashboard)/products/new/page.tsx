import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  return <ProductForm mode="create" businessId={ctx.businessId} />;
}
