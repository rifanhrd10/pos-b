import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";
import { AIRecommendationPanel } from "@/components/shared/ai-recommendation-panel";
import { MenuOcrImporter } from "@/components/shared/menu-ocr-importer";
import { prisma } from "@/lib/prisma";
import { getMasterToppings, getMasterVariants } from "@/actions/master-options";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");
  const [ownerBusiness, masterVariants, masterToppings] = await Promise.all([
    prisma.business.findFirst({
      where: { id: ctx.businessId, ownerId: session.user.id },
      select: { settings: { select: { aiApiKey: true } } },
    }),
    getMasterVariants(ctx.businessId, false),
    getMasterToppings(ctx.businessId, false),
  ]);
  const aiEnabled = Boolean(ownerBusiness?.settings?.aiApiKey);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
      {aiEnabled ? (
        <>
          <MenuOcrImporter />
          <AIRecommendationPanel />
        </>
      ) : null}
      <ProductForm
        mode="create"
        businessId={ctx.businessId}
        masterVariants={masterVariants.map((variant) => ({
          ...variant,
          options: variant.options.map((option) => ({ ...option, priceAdjustment: Number(option.priceAdjustment) })),
        }))}
        masterToppings={masterToppings.map((topping) => ({ ...topping, price: Number(topping.price) }))}
      />
    </div>
  );
}
