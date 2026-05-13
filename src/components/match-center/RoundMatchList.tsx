"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { MatchCard } from "./MatchCard"
import type { Match, Team } from "@/lib/match-center/types"

const COLLAPSE_THRESHOLD = 5

export function RoundMatchList({
  matches,
  teams,
  myTeamId,
  round,
}: {
  matches: Match[]
  teams: Team[]
  myTeamId: string | null
  round: number
}) {
  const [expanded, setExpanded] = useState(false)

  const sorted = [...matches].sort((a, b) => {
    // Viewer's match first
    const aMine = myTeamId && (a.team1Id === myTeamId || a.team2Id === myTeamId)
    const bMine = myTeamId && (b.team1Id === myTeamId || b.team2Id === myTeamId)
    if (aMine && !bMine) return -1
    if (!aMine && bMine) return 1
    // Then by scheduled time, then court
    const at = a.scheduledTime ?? ""
    const bt = b.scheduledTime ?? ""
    if (at !== bt) return at.localeCompare(bt)
    return (a.courtNumber ?? 99) - (b.courtNumber ?? 99)
  })

  const visible =
    expanded || sorted.length <= COLLAPSE_THRESHOLD
      ? sorted
      : sorted.slice(0, COLLAPSE_THRESHOLD)
  const hidden = sorted.length - visible.length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
          Round {round} · {sorted.length} match{sorted.length === 1 ? "" : "es"}
        </p>
        <p className="text-[11px] text-muted">
          {sorted.filter((m) => m.status === "completed").length} final
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No matches scheduled for this round yet.</p>
      ) : (
        <>
          {visible.map((m) => (
            <MatchCard key={m.id} match={m} teams={teams} myTeamId={myTeamId} />
          ))}
          {hidden > 0 && (
            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={() => setExpanded(true)}
            >
              See all {sorted.length} matches
            </Button>
          )}
        </>
      )}
    </div>
  )
}
