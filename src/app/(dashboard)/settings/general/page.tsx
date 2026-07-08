import { auth, getBusinessContext } from "@/lib/auth"
import { getBusinessSettings } from "@/actions/settings"
import { redirect } from "next/navigation"
import { GeneralForm } from "./general-form"

export const dynamic = "force-dynamic"

export default async function GeneralSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getBusinessContext(session.user.id)
  if (!ctx) redirect("/dashboard")

  const data = await getBusinessSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">General</h1>
        <p className="text-sm text-slate-500">Preferensi tampilan dan perilaku aplikasi</p>
      </div>
      <GeneralForm settings={data?.settings ?? null} />
    </div>
  )
}
