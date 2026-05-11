import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Rankings · Admin" }

export default function AdminRankingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rankings"
        description="Audit ranking events and apply manual adjustments. Phase 3."
      />
      <EmptyState
        title="No ranking events yet"
        description="Ranking events are generated automatically when match results are finalized in Phase 3."
      />
    </div>
  )
}
