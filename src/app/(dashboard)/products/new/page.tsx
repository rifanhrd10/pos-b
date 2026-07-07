import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";
import { AIRecommendationPanel } from "@/components/shared/ai-recommendation-panel";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <AIRecommendationPanel />
      <ProductForm mode="create" businessId={ctx.businessId} />
    </div>
  );
}
