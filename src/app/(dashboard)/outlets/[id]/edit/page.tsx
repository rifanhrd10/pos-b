import { notFound, redirect } from "next/navigation";
import { getOutlet } from "@/actions/outlets";
import { auth } from "@/lib/auth";
import OutletEditForm from "./edit-form";

export default async function EditOutletPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const outlet = await getOutlet(id);

  if (!outlet) notFound();

  return <OutletEditForm outlet={outlet} />;
}
