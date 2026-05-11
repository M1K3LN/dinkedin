import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Create Tournament · Organizer" }

export default function NewTournamentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create tournament"
        description="Set up a new tournament — name, location, dates, divisions."
      />
      <EmptyState
        title="Builder coming in Phase 2"
        description="Phase 1 stands up the schema and permissions. The full tournament + division creation flow ships in Phase 2."
      />
    </div>
  )
}
