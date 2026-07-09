import { auth } from "@/lib/auth";
import { getCustomer } from "@/actions/customers";
import { notFound, redirect } from "next/navigation";
import { CustomerForm } from "@/components/shared/customer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const customer = await getCustomer(id) as {
    id: string;
    businessId: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  } | null;

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customers/${id}`} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Pelanggan</h1>
          <p className="text-sm text-slate-500">{customer.name}</p>
        </div>
      </div>

      <CustomerForm
        businessId={customer.businessId}
        initialData={{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          notes: customer.notes,
        }}
      />
    </div>
  );
}
