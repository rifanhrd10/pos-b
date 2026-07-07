import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";
import { AIRecommendationPanel } from "@/components/shared/ai-recommendation-panel";
import { MenuOcrImporter } from "@/components/shared/menu-ocr-importer";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
      <MenuOcrImporter />
      <AIRecommendationPanel />
      <ProductForm mode="create" businessId={ctx.businessId} />
    </div>
  );
}
