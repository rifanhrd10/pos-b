import { PaymentVerificationPanel } from "./payment-verification-panel"
import { getPaymentRequests } from "@/app/actions/payment-requests"

export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const requests = await getPaymentRequests();
  
  const formattedRequests = requests.map(req => ({
    id: req.id,
    tenantName: req.business.name,
    tenantId: req.business.id,
    currentPlan: req.business.subscription?.plan?.displayName || "Starter",
    currentStatus: req.business.subscription?.status || "trial",
    currentExpiry: req.business.subscription?.currentPeriodEnd?.toISOString() || new Date().toISOString(),
    requestDate: req.createdAt.toISOString(),
    status: req.status.toLowerCase()
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <PaymentVerificationPanel initialRequests={formattedRequests} />
    </div>
  )
}
