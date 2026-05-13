import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MatchStatusBadge } from "./MatchStatusBadge"
import { cn } from "@/lib/utils"
import type { Match, Team } from "@/lib/match-center/types"

export function MatchCard({
  match,
  teams,
  myTeamId,
  showRoundLabel,
}: {
  match: Match
  teams: Team[]
  myTeamId: string | null
  showRoundLabel?: boolean
}) {
  const team1 = teams.find((t) => t.id === match.team1Id) ?? null
  const team2 = teams.find((t) => t.id === match.team2Id) ?? null

  const isMine =
    !!myTeamId && (match.team1Id === myTeamId || match.team2Id === myTeamId)

  const completed = match.status === "completed"
  const team1Won = match.winnerTeam === "team_1"
  const team2Won = match.winnerTeam === "team_2"
  const diff =
    completed && match.team1Score != null && match.team2Score != null
      ? Math.abs(match.team1Score - match.team2Score)
      : null

  const time = match.scheduledTime
    ? new Date(match.scheduledTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden",
        isMine && "ring-2 ring-accent",
      )}
    >
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {showRoundLabel && (
            <Badge tone="outline">R{match.roundNumber}</Badge>
          )}
          {match.courtNumber != null && (
            <Badge tone="outline">Court {match.courtNumber}</Badge>
          )}
          {time && (
            <span className="text-xs text-muted">{time}</span>
          )}
          {isMine && <Badge tone="accent">Your match</Badge>}
        </div>
        <MatchStatusBadge status={match.status} />
      </div>

      {/* Teams */}
      <div className="px-4 py-3 space-y-1.5">
        <TeamRow
          label={team1?.label ?? "Team 1"}
          score={match.team1Score}
          isWinner={team1Won}
          isMine={!!myTeamId && match.team1Id === myTeamId}
        />
        <TeamRow
          label={team2?.label ?? "Team 2"}
          score={match.team2Score}
          isWinner={team2Won}
          isMine={!!myTeamId && match.team2Id === myTeamId}
        />
      </div>

      {completed && diff != null && (
        <div className="px-4 pb-3 text-[11px] text-muted">
          +{diff} point differential
        </div>
      )}
    </Card>
  )
}

function TeamRow({
  label,
  score,
  isWinner,
  isMine,
}: {
  label: string
  score: number | null
  isWinner: boolean
  isMine: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        isWinner && "text-ink",
      )}
    >
      <p
        className={cn(
          "text-sm truncate",
          isWinner ? "font-bold text-primary" : "text-ink-2",
          isMine && !isWinner && "font-semibold",
        )}
      >
        {label}
      </p>
      <span
        className={cn(
          "font-display text-xl font-bold tabular shrink-0",
          score == null && "text-muted",
          isWinner && "text-primary",
        )}
      >
        {score == null ? "—" : score}
      </span>
    </div>
  )
}
