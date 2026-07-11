export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBusinessSettings } from "@/actions/settings"
import { ReceiptSettingsClient } from "./receipt-settings-client"

export default async function ReceiptSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const data = await getBusinessSettings()
  if (!data) redirect("/dashboard")

  return (
    <ReceiptSettingsClient
      settings={data.settings}
      business={data.business}
    />
  )
}
