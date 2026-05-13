import { Card, CardEyebrow } from "@/components/ui/Card"
import { MatchStatusBadge } from "./MatchStatusBadge"
import type { Match, Team } from "@/lib/match-center/types"

export function MyNextMatchCard({
  match,
  myTeam,
  teams,
}: {
  match: Match | null
  myTeam: Team | null
  teams: Team[]
}) {
  if (!match || !myTeam) {
    return (
      <Card>
        <CardEyebrow>Your next match</CardEyebrow>
        <p className="font-display text-xl font-bold mt-2">No upcoming match yet.</p>
        <p className="text-sm text-muted mt-1">
          Check back when the next round is scheduled.
        </p>
      </Card>
    )
  }

  const isHome = match.team1Id === myTeam.id
  const opponentId = isHome ? match.team2Id : match.team1Id
  const opponent = teams.find((t) => t.id === opponentId) ?? null

  const time = match.scheduledTime
    ? new Date(match.scheduledTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  return (
    <Card tone="accent" className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <CardEyebrow className="!text-accent-ink/70">Your next match</CardEyebrow>
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="mt-3 space-y-2">
        <p className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {myTeam.label}
        </p>
        <p className="text-sm uppercase tracking-[0.16em] font-semibold opacity-60">
          vs
        </p>
        <p className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {opponent?.label ?? "Opponent TBD"}
        </p>
      </div>

      <div className="mt-5 pt-5 border-t border-accent-ink/15 grid grid-cols-3 gap-3 text-sm">
        <Cell label="Court" value={match.courtNumber ? `#${match.courtNumber}` : "TBD"} />
        <Cell label="Round" value={`R${match.roundNumber}`} />
        <Cell label="Time" value={time ?? "TBD"} />
      </div>
    </Card>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold opacity-60">
        {label}
      </p>
      <p className="font-display text-xl font-bold tabular mt-0.5">{value}</p>
    </div>
  )
}
