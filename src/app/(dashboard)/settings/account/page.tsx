import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AccountForm } from "./account-form"

export const dynamic = "force-dynamic"

export default async function AccountSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Akun</h1>
        <p className="text-sm text-slate-500">Kelola profil dan keamanan akun Anda</p>
      </div>
      <AccountForm user={user} />
    </div>
  )
}
