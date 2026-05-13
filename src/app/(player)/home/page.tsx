import Link from "next/link"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { RankBadge } from "@/components/ui/RankBadge"
import { Stat, StatRow } from "@/components/ui/Stat"
import { formatNumber } from "@/lib/utils"
import { PLAY_TYPE_LABELS } from "@/lib/validation"

export const metadata = { title: "Home · Dinkedin" }
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: playerProfile } = await supabase
    .from("player_profiles")
    .select(
      "display_name, skill_level, total_ranking_points, total_reward_points, wins, losses",
    )
    .eq("user_id", user.id)
    .maybeSingle()

  // My active registrations (where I'm the player or the partner).
  const { data: myRegs } = await supabase
    .from("tournament_registrations")
    .select("id, tournament_id, division_id, partner_player_id, status, player_id")
    .or(`player_id.eq.${user.id},partner_player_id.eq.${user.id}`)
    .eq("status", "registered")

  let upcoming: UpcomingItem[] = []
  if (myRegs && myRegs.length > 0) {
    const tournamentIds = Array.from(new Set(myRegs.map((r) => r.tournament_id)))
    const divisionIds = Array.from(new Set(myRegs.map((r) => r.division_id)))

    const today = new Date().toISOString().slice(0, 10)
    const [{ data: tournaments }, { data: divisions }] = await Promise.all([
      supabase
        .from("tournaments")
        .select("id, name, city, state, start_date, end_date, status")
        .in("id", tournamentIds)
        .in("status", ["published", "active"])
        .or(`start_date.is.null,start_date.gte.${today}`)
        .order("start_date", { ascending: true })
        .limit(3),
      supabase
        .from("tournament_divisions")
        .select("id, name, play_type")
        .in("id", divisionIds),
    ])

    const tournamentMap = new Map((tournaments ?? []).map((t) => [t.id, t]))
    const divisionMap = new Map((divisions ?? []).map((d) => [d.id, d]))

    upcoming = myRegs
      .map((r) => {
        const t = tournamentMap.get(r.tournament_id)
        const d = divisionMap.get(r.division_id)
        if (!t || !d) return null
        return {
          registrationId: r.id,
          tournamentId: r.tournament_id,
          tournamentName: t.name,
          startDate: t.start_date,
          endDate: t.end_date,
          city: t.city,
          state: t.state,
          divisionName: d.name,
          playTypeLabel: PLAY_TYPE_LABELS[d.play_type],
          hasPartner: r.partner_player_id != null,
        } as UpcomingItem
      })
      .filter((x): x is UpcomingItem => x != null)
      .slice(0, 3)
  }

  const greetingName =
    playerProfile?.display_name || user.firstName || user.email.split("@")[0]

  const wins = playerProfile?.wins ?? 0
  const losses = playerProfile?.losses ?? 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : null
  const skill =
    playerProfile?.skill_level != null
      ? Number(playerProfile.skill_level)
      : null
  const reliability = Math.min(100, total * 8)

  return (
    <div className="space-y-7">
      {/* Hero card: rating + stat trio */}
      <Card tone="dark" className="overflow-hidden p-7 md:p-9">
        <div className="grid md:grid-cols-[auto_1fr] gap-7 items-center">
          <div className="flex md:block justify-center">
            <RankBadge
              rating={skill}
              reliability={reliability}
              verified={false}
              size="lg"
            />
          </div>
          <div className="space-y-4">
            <div>
              <CardEyebrow className="text-accent">Welcome back</CardEyebrow>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1 capitalize">
                {greetingName}
              </h2>
            </div>
            <p className="text-primary-ink/70 max-w-prose">
              Your home base. Track your rating, find your next match, and watch
              the reward points stack up.
            </p>
            <StatRow className="pt-2">
              <Stat
                label="Wins"
                value={formatNumber(wins)}
                tone="ink"
                className="text-primary-ink [&_p:first-child]:text-primary-ink/60"
              />
              <Stat
                label="Win rate"
                value={winRate == null ? "—" : `${winRate}%`}
                tone="ink"
                className="text-primary-ink [&_p:first-child]:text-primary-ink/60"
              />
              <Stat
                label="Matches"
                value={formatNumber(total)}
                tone="ink"
                className="text-primary-ink [&_p:first-child]:text-primary-ink/60"
              />
            </StatRow>
          </div>
        </div>
      </Card>

      {/* Up next: registered tournaments */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <CardEyebrow>Up next</CardEyebrow>
            <span className="text-xs text-muted">
              {upcoming.length} registration{upcoming.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-3">
            {upcoming.map((u) => (
              <Link key={u.registrationId} href={`/tournaments/${u.tournamentId}`}>
                <Card className="flex items-center justify-between gap-3 hover:shadow-[0_8px_30px_-12px_rgba(15,61,46,0.25)] transition-shadow">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold truncate">
                      {u.tournamentName}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {u.divisionName} · {u.playTypeLabel}
                      {u.hasPartner ? " · with partner" : ""}
                    </p>
                    <p className="text-sm text-ink-2 mt-1">
                      {formatRange(u.startDate, u.endDate)} ·{" "}
                      {[u.city, u.state].filter(Boolean).join(", ") ||
                        "Location TBA"}
                    </p>
                  </div>
                  <Badge tone="accent">Registered</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Points row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div
            className="absolute -right-8 -top-8 size-32 rounded-full bg-accent/20 blur-2xl"
            aria-hidden
          />
          <CardEyebrow>Ranking points</CardEyebrow>
          <p className="font-display text-5xl font-bold tabular mt-1.5">
            {formatNumber(playerProfile?.total_ranking_points ?? 0)}
          </p>
          <p className="text-sm text-muted mt-2">
            Earn 5 for registering, 10 per match win, up to 50 for podium.
          </p>
        </Card>
        <Card tone="accent" className="relative overflow-hidden">
          <CardEyebrow className="!text-accent-ink/70">Reward points</CardEyebrow>
          <div className="flex items-end gap-2 mt-1.5">
            <p className="font-display text-5xl font-bold tabular">
              {formatNumber(playerProfile?.total_reward_points ?? 0)}
            </p>
            <Badge tone="primary" className="mb-2">unlock perks</Badge>
          </div>
          <p className="text-sm text-accent-ink/80 mt-2">
            Redeem reward points for Shopify perks. Coming in Phase 4.
          </p>
        </Card>
      </div>

      {/* What's next: only show when there's no registration yet */}
      {upcoming.length === 0 && (
        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <CardEyebrow>Up next</CardEyebrow>
              <CardTitle className="mt-1">Find your first tournament</CardTitle>
            </div>
            <Badge tone="outline">+50 on register</Badge>
          </div>
          <p className="text-ink-2 text-[15px]">
            Browse published events, pick a division, and lock in your spot.
            You&apos;ll earn ranking and reward points the moment you register.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/tournaments">
              <Button size="md">Browse tournaments</Button>
            </Link>
            <Link href="/profile/edit">
              <Button size="md" variant="outline">
                Finish your profile
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

type UpcomingItem = {
  registrationId: string
  tournamentId: string
  tournamentName: string
  startDate: string | null
  endDate: string | null
  city: string | null
  state: string | null
  divisionName: string
  playTypeLabel: string
  hasPartner: boolean
}

function formatRange(start: string | null, end: string | null) {
  if (!start) return "Date TBA"
  const s = new Date(start)
  const sLabel = s.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  if (!end || end === start) return sLabel
  const e = new Date(end)
  return `${sLabel} – ${e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`
}
