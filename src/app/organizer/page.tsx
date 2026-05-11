import Link from "next/link"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export const metadata = { title: "Organizer Dashboard · Dinkedin" }

export default function OrganizerDashboard() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Organizer"
        title="Run your tournaments"
        description="Create events, manage divisions, and enter results. The full build lands in Phase 2 and 3."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Tournaments" value="—" />
        <StatTile label="Registrations" value="—" />
        <StatTile label="Matches scheduled" value="—" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardEyebrow>Phase 2</CardEyebrow>
          <CardTitle className="mt-1">Tournament builder</CardTitle>
          <p className="text-sm text-ink-2 mt-2">
            Multi-step flow: details, divisions, publish. Photo upload, registration windows, and waitlists included.
          </p>
          <div className="mt-4">
            <Link href="/organizer/tournaments/new">
              <Button size="sm" variant="outline">Preview</Button>
            </Link>
          </div>
        </Card>
        <Card>
          <CardEyebrow>Phase 3</CardEyebrow>
          <CardTitle className="mt-1">Match result entry</CardTitle>
          <p className="text-sm text-ink-2 mt-2">
            Enter scores fast on mobile. Finalizing a tournament triggers ranking + reward updates automatically.
          </p>
          <div className="mt-4">
            <Badge tone="outline">Coming</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardEyebrow>{label}</CardEyebrow>
      <p className="font-display text-4xl font-bold tabular mt-1.5">{value}</p>
    </Card>
  )
}
