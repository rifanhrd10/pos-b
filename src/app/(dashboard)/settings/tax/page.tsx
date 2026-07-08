import { auth, getBusinessContext } from "@/lib/auth"
import { getBusinessSettings } from "@/actions/settings"
import { redirect } from "next/navigation"
import { TaxForm } from "./tax-form"

export const dynamic = "force-dynamic"

export default async function TaxSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/dashboard")

  const data = await getBusinessSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pajak &amp; Service</h1>
        <p className="text-sm text-slate-500">Atur tarif pajak dan biaya layanan</p>
      </div>
      <TaxForm
        taxRate={Number(data?.business?.taxRate ?? 11)}
        serviceRate={Number(data?.business?.serviceRate ?? 0)}
      />
    </div>
  )
}
