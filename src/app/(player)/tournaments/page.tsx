import Link from "next/link"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export const metadata = { title: "Tournaments · Dinkedin" }
export const dynamic = "force-dynamic"

export default async function TournamentsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: tournaments },
    { data: myRegistrations },
  ] = await Promise.all([
    supabase
      .from("tournaments")
      .select(
        "id, name, location_name, city, state, start_date, end_date, status, registration_deadline",
      )
      .in("status", ["published", "active"])
      .order("start_date", { ascending: true })
      .limit(50),
    supabase
      .from("tournament_registrations")
      .select("tournament_id, division_id, status")
      .eq("player_id", user.id)
      .neq("status", "canceled"),
  ])

  const upcoming =
    tournaments?.filter((t) => !t.start_date || t.start_date >= today) ?? []
  const past =
    tournaments?.filter((t) => t.start_date && t.start_date < today) ?? []

  const registeredTournamentIds = new Set(
    myRegistrations?.map((r) => r.tournament_id) ?? [],
  )

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Find your next match"
        title="Tournaments"
        description="Browse open events near and far. Tap into a tournament to see divisions and register."
      />

      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          title="No tournaments published yet"
          description="When organizers publish events, you'll see them here with divisions, dates, and a Register button."
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <CardEyebrow>Upcoming</CardEyebrow>
              <div className="grid sm:grid-cols-2 gap-4">
                {upcoming.map((t) => (
                  <TournamentTile
                    key={t.id}
                    tournament={t}
                    registered={registeredTournamentIds.has(t.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <CardEyebrow>Recently played</CardEyebrow>
              <div className="grid sm:grid-cols-2 gap-4">
                {past.map((t) => (
                  <TournamentTile
                    key={t.id}
                    tournament={t}
                    registered={registeredTournamentIds.has(t.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function TournamentTile({
  tournament,
  registered,
}: {
  tournament: {
    id: string
    name: string
    location_name: string | null
    city: string | null
    state: string | null
    start_date: string | null
    end_date: string | null
    status: string
    registration_deadline: string | null
  }
  registered: boolean
}) {
  const venue =
    tournament.location_name ||
    [tournament.city, tournament.state].filter(Boolean).join(", ") ||
    "Location TBA"

  const dateLabel = tournament.start_date
    ? formatRange(tournament.start_date, tournament.end_date)
    : "Date TBA"

  return (
    <Link href={`/tournaments/${tournament.id}`} className="block group">
      <Card className="h-full transition-shadow group-hover:shadow-[0_8px_30px_-12px_rgba(15,61,46,0.25)] p-0 overflow-hidden">
        <div
          className="relative h-32 bg-gradient-to-br from-[#1F5B41] via-[#0F3D2E] to-[#0B2A1F]"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 70%, rgba(198,255,61,0.5), transparent 40%), radial-gradient(circle at 80% 20%, rgba(247,245,238,0.18), transparent 35%)",
            }}
          />
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-bg/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
            <span className="size-1.5 rounded-full bg-accent" />
            {dateLabel}
          </div>
          {registered && (
            <div className="absolute top-3 right-3">
              <Badge tone="accent">You&apos;re in</Badge>
            </div>
          )}
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight truncate">
              {tournament.name}
            </h3>
            {tournament.status === "active" && (
              <Badge tone="primary">Live</Badge>
            )}
          </div>
          <p className="text-sm text-muted">{venue}</p>
        </div>
      </Card>
    </Link>
  )
}

function formatRange(start: string, end: string | null) {
  const s = new Date(start)
  const sLabel = s.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  if (!end || end === start) return sLabel
  const e = new Date(end)
  return `${s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`
}
