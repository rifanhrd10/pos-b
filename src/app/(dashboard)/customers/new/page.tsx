import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerForm } from "@/components/shared/customer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewCustomerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers" className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Pelanggan</h1>
          <p className="text-sm text-slate-500">Tambah pelanggan baru ke daftar</p>
        </div>
      </div>

      <CustomerForm businessId={ctx.businessId} />
    </div>
  );
}
