"use client"

import { useMemo, useState } from "react"
import { TournamentHeader } from "./TournamentHeader"
import { MyNextMatchCard } from "./MyNextMatchCard"
import { MyStandingAdvancementCard } from "./MyStandingAdvancementCard"
import { RoundTabs } from "./RoundTabs"
import { RoundMatchList } from "./RoundMatchList"
import { StandingsLeaderboard } from "./StandingsLeaderboard"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { calculatePointsEligibility } from "@/lib/match-center/eligibility"
import type { MatchCenterData } from "@/lib/match-center/types"

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
