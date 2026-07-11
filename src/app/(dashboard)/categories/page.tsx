import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/actions/categories";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const context = await getBusinessContext(session.user.id);
  if (!context?.businessId) redirect("/dashboard");

  const categories = await getCategories(context.businessId);

  return <CategoriesClient categories={categories} />;
}
