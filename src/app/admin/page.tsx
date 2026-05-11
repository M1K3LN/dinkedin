import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Admin Dashboard · Dinkedin" }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [usersCount, tournamentsCount, registrationsCount] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("tournaments").select("*", { count: "exact", head: true }),
    supabase.from("tournament_registrations").select("*", { count: "exact", head: true }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total users" value={usersCount.count ?? 0} />
        <Stat label="Tournaments" value={tournamentsCount.count ?? 0} />
        <Stat label="Registrations" value={registrationsCount.count ?? 0} />
      </div>

      <Card>
        <h2 className="font-semibold text-base">Phase 1 status</h2>
        <ul className="mt-2 text-sm text-muted space-y-1">
          <li>Schema, enums, and signup trigger deployed.</li>
          <li>Row-level security live for every table.</li>
          <li>Auth, layouts, and protected routes shipped.</li>
          <li>Management UIs land in Phase 2/3.</li>
        </ul>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-muted font-semibold">{label}</p>
      <p className="mt-1 text-3xl font-bold">{formatNumber(value)}</p>
    </Card>
  )
}
