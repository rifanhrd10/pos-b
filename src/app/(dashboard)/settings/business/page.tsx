import { auth, getBusinessContext } from "@/lib/auth"
import { getBusinessSettings } from "@/actions/settings"
import { redirect } from "next/navigation"
import { BusinessForm } from "./business-form"

export const dynamic = "force-dynamic"

export default async function BusinessSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/dashboard")

  const data = await getBusinessSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Bisnis</h1>
        <p className="text-sm text-slate-500">Kelola informasi bisnis Anda</p>
      </div>
      <BusinessForm business={data?.business ?? null} />
    </div>
  )
}
