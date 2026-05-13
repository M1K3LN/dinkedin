import { Card, CardEyebrow } from "@/components/ui/Card"
import { Stat, StatRow } from "@/components/ui/Stat"
import { AdvancementBadge } from "./AdvancementBadge"
import type { DivisionView, Standing } from "@/lib/match-center/types"

export function MyStandingAdvancementCard({
  standing,
  division,
  totalTeams,
}: {
  standing: Standing | null
  division: DivisionView
  totalTeams: number
}) {
  if (!standing) {
    return (
      <Card>
        <CardEyebrow>Your standing</CardEyebrow>
        <p className="font-display text-xl font-bold mt-2">Not playing yet</p>
        <p className="text-sm text-muted mt-1">
          Once your team plays its first match, your standing shows up here.
        </p>
      </Card>
    )
  }

  const diff = standing.pointDifferential
  const avg = standing.avgPointDifferential

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardEyebrow>Your standing</CardEyebrow>
          <p className="font-display text-3xl font-bold tracking-tight mt-1">
            #{standing.rank}{" "}
            <span className="text-muted text-lg font-medium">
              of {totalTeams}
            </span>
          </p>
          {division.teamsAdvancing != null && (
            <p className="text-sm text-muted mt-1">
              Top {division.teamsAdvancing} advance
            </p>
          )}
        </div>
        <AdvancementBadge status={standing.advancementStatus} />
      </div>

      <StatRow className="mt-5 pt-5 border-t border-hairline">
        <Stat
          label="Record"
          value={`${standing.wins}-${standing.losses}`}
        />
        <Stat
          label="Avg Diff"
          value={`${avg >= 0 ? "+" : ""}${avg.toFixed(1)}`}
          tone={avg >= 0 ? "primary" : "ink"}
        />
        <Stat
          label="Total Diff"
          value={`${diff >= 0 ? "+" : ""}${diff}`}
        />
      </StatRow>

      <div className="mt-4 pt-4 border-t border-hairline grid grid-cols-3 gap-3 text-xs">
        <Mini label="Played" value={standing.matchesPlayed} />
        <Mini label="Points for" value={standing.pointsFor} />
        <Mini label="Points against" value={standing.pointsAgainst} />
      </div>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
        {label}
      </p>
      <p className="font-display text-base font-bold tabular mt-0.5">{value}</p>
    </div>
  )
}
