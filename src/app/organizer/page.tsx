import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Organizer · Dinkedin" }
export const dynamic = "force-dynamic"

export default async function OrganizerDashboard() {
  const user = await requireRole("organizer", "admin")
  const supabase = await createClient()

  const [{ data: myTournaments }, draftsCount, publishedCount] = await Promise.all([
    supabase
      .from("tournaments")
      .select("id, name, status, start_date, end_date, city, state")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", "draft"),
    supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .in("status", ["published", "active"]),
  ])

  const tournamentIds = (myTournaments ?? []).map((t) => t.id)
  const { count: registrationCount } = tournamentIds.length
    ? await supabase
        .from("tournament_registrations")
        .select("id", { count: "exact", head: true })
        .in("tournament_id", tournamentIds)
        .neq("status", "canceled")
    : { count: 0 }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Organizer"
        title="Run your tournaments"
        description="Create events, manage divisions, and watch sign-ups roll in."
        action={
          <Link href="/organizer/tournaments/new">
            <Button size="sm">+ New tournament</Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Drafts" value={formatNumber(draftsCount.count ?? 0)} />
        <StatTile label="Live" value={formatNumber(publishedCount.count ?? 0)} />
        <StatTile label="Registrations" value={formatNumber(registrationCount ?? 0)} />
      </div>

      {myTournaments && myTournaments.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <CardEyebrow>Your tournaments</CardEyebrow>
            <Link
              href="/organizer/tournaments"
              className="text-sm font-semibold text-primary hover:text-primary/80 underline decoration-accent decoration-2 underline-offset-4"
            >
              See all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {myTournaments.map((t) => (
              <Link
                key={t.id}
                href={`/organizer/tournaments/${t.id}`}
                className="block group"
              >
                <Card className="h-full transition-shadow group-hover:shadow-[0_8px_30px_-12px_rgba(15,61,46,0.25)]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-bold truncate">
                      {t.name}
                    </p>
                    <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {[t.city, t.state].filter(Boolean).join(", ") || "Location TBA"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardEyebrow>Phase 3</CardEyebrow>
        <CardTitle className="mt-1">Match result entry</CardTitle>
        <p className="text-sm text-ink-2 mt-2">
          Enter scores fast on mobile. Finalizing a tournament triggers ranking
          and reward updates automatically.
        </p>
        <div className="mt-4">
          <Badge tone="outline">Coming next</Badge>
        </div>
      </Card>
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

function statusTone(status: string) {
  switch (status) {
    case "draft":
      return "neutral" as const
    case "published":
      return "accent" as const
    case "active":
      return "primary" as const
    case "completed":
      return "gold" as const
    case "canceled":
      return "warn" as const
    default:
      return "neutral" as const
  }
}
