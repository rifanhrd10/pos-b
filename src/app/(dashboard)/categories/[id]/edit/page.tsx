import { getCategory } from "@/actions/categories";
import { CategoryForm } from "@/components/shared/category-form";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) notFound();

  return <CategoryForm mode="edit" category={category} />;
}
