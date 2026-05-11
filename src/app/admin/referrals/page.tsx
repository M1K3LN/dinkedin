import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Referrals · Admin" }

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        description="Manage referral codes and Shopify discount code records."
      />
      <EmptyState
        title="No referral codes yet"
        description="Referral code generation lands in Phase 3. Shopify discount record view lands in Phase 4."
      />
    </div>
  )
}
