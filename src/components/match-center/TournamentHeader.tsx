import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { PLAY_TYPE_LABELS } from "@/lib/validation"
import { PointsEligibilityBadge } from "./PointsEligibilityBadge"
import type { DivisionView, Standing, Team, TournamentView } from "@/lib/match-center/types"

export function TournamentHeader({
  tournament,
  division,
  myTeam,
  myStanding,
}: {
  tournament: TournamentView
  division: DivisionView
  myTeam: Team | null
  myStanding: Standing | null
}) {
  const venue =
    [tournament.locationName, tournament.city, tournament.state]
      .filter(Boolean)
      .join(" · ") || "Location TBA"

  const statusBadge =
    tournament.status === "active" ? (
      <Badge tone="accent">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-current animate-pulse" />
        Live
      </Badge>
    ) : tournament.status === "completed" ? (
      <Badge tone="gold">Completed</Badge>
    ) : (
      <Badge tone="outline">{tournament.status}</Badge>
    )

  return (
    <Card tone="dark" className="overflow-hidden p-6 md:p-8">
      <div className="flex items-center gap-2 flex-wrap">
        {statusBadge}
        <Badge tone="outline" className="!text-primary-ink/80 !border-white/20">
          {PLAY_TYPE_LABELS[division.playType]}
        </Badge>
        <Badge tone="outline" className="!text-primary-ink/80 !border-white/20">
          Round Robin
        </Badge>
        <PointsEligibilityBadge
          status={division.pointsEligibilityStatus}
          teamCount={division.teamCount}
          minTeams={division.minTeamsForPoints}
        />
      </div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-accent font-bold mt-4">
        {tournament.name}
      </p>
      <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mt-1">
        {division.name}
      </h1>
      <p className="text-primary-ink/70 mt-2 text-sm">{venue}</p>

      <dl className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
        <Mini label="Teams" value={division.teamCount} />
        <Mini
          label="Advance"
          value={division.teamsAdvancing ? `Top ${division.teamsAdvancing}` : "—"}
        />
        <Mini
          label="You"
          value={
            myTeam && myStanding ? `#${myStanding.rank} of ${division.teamCount}` : "—"
          }
        />
      </dl>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-primary-ink/60 font-semibold">
        {label}
      </dt>
      <dd className="font-display text-xl md:text-2xl font-bold tabular text-primary-ink mt-0.5">
        {value}
      </dd>
    </div>
  )
}
