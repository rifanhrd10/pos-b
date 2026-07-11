import { getSubscriptionsList, getPlansList } from "@/actions/itadmin"
import { SubscriptionsClient } from "./subscriptions-client"

export default async function SubscriptionsPage() {
  const [subscriptions, plans] = await Promise.all([
    getSubscriptionsList(),
    getPlansList(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-sm text-slate-400">Kelola subscription semua bisnis</p>
      </div>
      <SubscriptionsClient subscriptions={subscriptions} plans={plans} />
    </div>
  )
}
