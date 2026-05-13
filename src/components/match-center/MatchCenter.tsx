"use client"

import { useMemo, useRef, useState } from "react"
import { TournamentHeader } from "./TournamentHeader"
import { MyNextMatchCard } from "./MyNextMatchCard"
import { MyStandingAdvancementCard } from "./MyStandingAdvancementCard"
import { RoundTabs } from "./RoundTabs"
import { RoundMatchList } from "./RoundMatchList"
import { StandingsLeaderboard } from "./StandingsLeaderboard"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { calculatePointsEligibility } from "@/lib/match-center/eligibility"
import type { MatchCenterData } from "@/lib/match-center/types"

const SWIPE_THRESHOLD_PX = 60

export function MatchCenter({ data }: { data: MatchCenterData }) {
  const {
    tournament,
    division,
    teams,
    matches,
    standings,
    myTeam,
    myNextMatch,
    rounds,
  } = data

  // Default tab: the round of the user's next match, else first round.
  const defaultRound =
    myNextMatch?.roundNumber ?? rounds[0] ?? 1
  const [activeTab, setActiveTab] = useState<number | "standings">(
    defaultRound,
  )

  const myStanding = useMemo(
    () => (myTeam ? standings.find((s) => s.teamId === myTeam.id) ?? null : null),
    [standings, myTeam],
  )

  const myMatchByRound = useMemo(() => {
    const set = new Set<number>()
    if (!myTeam) return set
    for (const m of matches) {
      if (m.team1Id === myTeam.id || m.team2Id === myTeam.id) {
        set.add(m.roundNumber)
      }
    }
    return set
  }, [matches, myTeam])

  const matchesInActiveRound = useMemo(
    () =>
      typeof activeTab === "number"
        ? matches.filter((m) => m.roundNumber === activeTab)
        : [],
    [matches, activeTab],
  )

  const eligibility = calculatePointsEligibility({
    registeredTeamCount: division.teamCount,
    minTeamsForPoints: division.minTeamsForPoints,
    tournamentStatus: tournament.status,
    divisionStatus: division.pointsEligibilityStatus,
  })

  // Build the ordered list of tabs (rounds + "standings") so swipe gestures
  // can step through it.
  const tabOrder: (number | "standings")[] = [...rounds, "standings"]
  const touchStartX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const dx = (e.changedTouches[0]?.clientX ?? start) - start
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    const idx = tabOrder.indexOf(activeTab)
    if (idx < 0) return
    const nextIdx = dx < 0 ? idx + 1 : idx - 1
    if (nextIdx < 0 || nextIdx >= tabOrder.length) return
    setActiveTab(tabOrder[nextIdx])
  }

  return (
    <div className="space-y-6 pb-8">
      <TournamentHeader
        tournament={tournament}
        division={division}
        myTeam={myTeam}
        myStanding={myStanding}
      />

      {!eligibility.pointsEligible && (
        <Card tone="default" className="bg-warn/10 border-warn/30">
          <CardEyebrow className="!text-warn">No points awarded</CardEyebrow>
          <p className="text-sm text-ink-2 mt-2">
            {eligibility.playerFacingMessage}
          </p>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <MyNextMatchCard
          match={myNextMatch}
          myTeam={myTeam}
          teams={teams}
        />
        <MyStandingAdvancementCard
          standing={myStanding}
          division={division}
          totalTeams={teams.length}
        />
      </div>

      <RoundTabs
        rounds={rounds}
        activeRound={activeTab}
        onChange={setActiveTab}
        myMatchByRound={myMatchByRound}
      />

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="touch-pan-y"
      >
        {typeof activeTab === "number" ? (
          <RoundMatchList
            matches={matchesInActiveRound}
            teams={teams}
            myTeamId={myTeam?.id ?? null}
            round={activeTab}
          />
        ) : (
          <StandingsLeaderboard
            standings={standings}
            teams={teams}
            division={division}
            myTeamId={myTeam?.id ?? null}
          />
        )}
      </div>

      {/* Always show the leaderboard at the bottom for quick reference,
          unless the user is already on the standings tab. */}
      {activeTab !== "standings" && (
        <StandingsLeaderboard
          standings={standings}
          teams={teams}
          division={division}
          myTeamId={myTeam?.id ?? null}
        />
      )}
    </div>
  )
}
