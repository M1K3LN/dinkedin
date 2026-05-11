import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Admin Dashboard · Dinkedin" }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [usersCount, tournamentsCount, registrationsCount, matchesCount] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("tournaments").select("*", { count: "exact", head: true }),
      supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
    ])

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Top-line health. Detailed management UIs land in Phase 2 and 3."
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Users" value={usersCount.count ?? 0} />
        <StatTile label="Tournaments" value={tournamentsCount.count ?? 0} />
        <StatTile label="Registrations" value={registrationsCount.count ?? 0} />
        <StatTile label="Matches" value={matchesCount.count ?? 0} />
      </div>

      <Card>
        <CardEyebrow>Phase 1 status</CardEyebrow>
        <CardTitle className="mt-1">Foundation shipped</CardTitle>
        <ul className="mt-3 space-y-2 text-[15px] text-ink-2">
          {[
            "Schema, enums, and signup trigger deployed.",
            "Row-level security enabled on every table.",
            "Auth, layouts, and protected routes shipped.",
            "Player home, profile, rankings, rewards, tournaments stubbed.",
            "Organizer and admin shells in place; CRUD UIs land in Phase 2/3.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1 size-2 rounded-full bg-accent shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardEyebrow>{label}</CardEyebrow>
      <p className="font-display text-4xl font-bold tabular mt-1.5">
        {formatNumber(value)}
      </p>
    </Card>
  )
}
