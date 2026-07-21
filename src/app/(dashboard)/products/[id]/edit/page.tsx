import { auth, getBusinessContext } from "@/lib/auth";
import { getProduct } from "@/actions/products";
import { getMasterToppings, getMasterVariants } from "@/actions/master-options";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { id } = await params;
  const [product, masterVariants, masterToppings] = await Promise.all([
    getProduct(id),
    getMasterVariants(ctx.businessId, true),
    getMasterToppings(ctx.businessId, true),
  ]);

  if (!product) notFound();

  // Normalize decimal values for the form
  const normalizedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    taxRate: Number(product.taxRate),
    variantGroups: product.variantGroups.map((group) => ({
      ...group,
      masterVariant: group.masterVariant
        ? {
            id: group.masterVariant.id,
            name: group.masterVariant.name,
            isActive: group.masterVariant.isActive,
          }
        : null,
    })),
    variants: product.variants.map((v) => ({
      ...v,
      priceAdjustment: Number(v.priceAdjustment),
    })),
    toppings: product.toppings.map((t) => ({
      ...t,
      masterToppingId: t.masterToppingId,
      price: Number(t.price),
    })),
  };

  return (
    <ProductForm
      mode="edit"
      businessId={ctx.businessId}
      product={normalizedProduct}
      masterVariants={masterVariants.map((variant) => ({
        ...variant,
        options: variant.options.map((option) => ({ ...option, priceAdjustment: Number(option.priceAdjustment) })),
      }))}
      masterToppings={masterToppings.map((topping) => ({ ...topping, price: Number(topping.price) }))}
    />
  );
}
