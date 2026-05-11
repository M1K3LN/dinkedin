import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Tournaments · Dinkedin" }

export default function TournamentsPage() {
  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Find tournaments to join. Filtering and registration arrive in Phase 2."
      />
      <EmptyState
        title="No tournaments yet"
        description="Once organizers publish events, you'll see them here. Phase 1 ships the foundation; the live tournament feed lands in Phase 2."
      />
    </div>
  )
}
