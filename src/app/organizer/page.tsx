import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"

export const metadata = { title: "Organizer Dashboard · Dinkedin" }

export default function OrganizerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Dashboard"
        description="Create tournaments, manage divisions, and enter results."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">
            Tournaments
          </p>
          <p className="mt-1 text-3xl font-bold">—</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">
            Registrations
          </p>
          <p className="mt-1 text-3xl font-bold">—</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">
            Matches scheduled
          </p>
          <p className="mt-1 text-3xl font-bold">—</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-base">Coming soon</h2>
        <p className="text-sm text-muted mt-1">
          Tournament creation, division management, and registration workflows
          arrive in Phase 2. Match result entry and ranking/reward triggers
          arrive in Phase 3.
        </p>
      </Card>
    </div>
  )
}
