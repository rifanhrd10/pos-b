import { auth, getBusinessContext } from "@/lib/auth";
import { getProduct } from "@/actions/products";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/shared/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  // Normalize decimal values for the form
  const normalizedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    taxRate: Number(product.taxRate),
    variants: product.variants.map((v) => ({
      ...v,
      priceAdjustment: Number(v.priceAdjustment),
    })),
    toppings: product.toppings.map((t) => ({
      ...t,
      price: Number(t.price),
    })),
  };

  return <ProductForm mode="edit" businessId={ctx.businessId} product={normalizedProduct} />;
}
