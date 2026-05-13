"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { AdvancementBadge } from "./AdvancementBadge"
import { cn } from "@/lib/utils"
import type { DivisionView, Standing, Team } from "@/lib/match-center/types"

type View = "card" | "table"

export function StandingsLeaderboard({
  standings,
  teams,
  division,
  myTeamId,
}: {
  standings: Standing[]
  teams: Team[]
  division: DivisionView
  myTeamId: string | null
}) {
  const [view, setView] = useState<View>("card")
  const teamMap = new Map(teams.map((t) => [t.id, t]))
  const advancingCut = division.teamsAdvancing

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Standings
        </h2>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "card" ? (
        <CardView
          standings={standings}
          teamMap={teamMap}
          myTeamId={myTeamId}
          advancingCut={advancingCut}
        />
      ) : (
        <TableView
          standings={standings}
          teamMap={teamMap}
          myTeamId={myTeamId}
          advancingCut={advancingCut}
        />
      )}
    </section>
  )
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View
  onChange: (v: View) => void
}) {
  return (
    <div className="inline-flex rounded-full bg-surface-2 p-1 text-xs font-semibold">
      {(["card", "table"] as View[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-3 py-1.5 rounded-full capitalize transition-colors",
            view === v
              ? "bg-primary text-primary-ink"
              : "text-ink-2 hover:text-ink",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

function CardView({
  standings,
  teamMap,
  myTeamId,
  advancingCut,
}: {
  standings: Standing[]
  teamMap: Map<string, Team>
  myTeamId: string | null
  advancingCut: number | null
}) {
  return (
    <div className="space-y-2">
      {standings.map((s, idx) => {
        const team = teamMap.get(s.teamId)
        const isMine = !!myTeamId && s.teamId === myTeamId
        const showCutLine =
          advancingCut != null &&
          idx === advancingCut - 1 &&
          standings.length > advancingCut
        return (
          <div key={s.teamId} className="space-y-2">
            <Card
              className={cn(
                "p-4",
                isMine && "ring-2 ring-accent",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "size-9 rounded-full grid place-items-center font-display font-bold tabular shrink-0",
                      isMine
                        ? "bg-accent text-accent-ink"
                        : "bg-surface-2 text-ink-2",
                    )}
                  >
                    {s.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {team?.label ?? "Team"}
                      {isMine && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-primary font-bold">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted tabular">
                      {s.wins}-{s.losses} ·{" "}
                      {s.avgPointDifferential >= 0 ? "+" : ""}
                      {s.avgPointDifferential.toFixed(1)} avg
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-lg font-bold tabular">
                    {s.pointDifferential >= 0 ? "+" : ""}
                    {s.pointDifferential}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                    diff
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted">
                  PF {s.pointsFor} · PA {s.pointsAgainst} · {s.matchesPlayed} played
                </div>
                <AdvancementBadge status={s.advancementStatus} />
              </div>
            </Card>
            {showCutLine && (
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 border-t border-dashed border-primary/40" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-primary">
                  Cut line · Top {advancingCut} advance
                </span>
                <div className="flex-1 border-t border-dashed border-primary/40" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TableView({
  standings,
  teamMap,
  myTeamId,
  advancingCut,
}: {
  standings: Standing[]
  teamMap: Map<string, Team>
  myTeamId: string | null
  advancingCut: number | null
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2 text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
            <tr>
              <Th className="text-left">#</Th>
              <Th className="text-left">Team</Th>
              <Th>W</Th>
              <Th>L</Th>
              <Th>PF</Th>
              <Th>PA</Th>
              <Th>Diff</Th>
              <Th>Avg</Th>
              <Th>Played</Th>
              <Th className="text-right">Status</Th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const team = teamMap.get(s.teamId)
              const isMine = !!myTeamId && s.teamId === myTeamId
              const isCutLineRow =
                advancingCut != null && idx === advancingCut - 1
              return (
                <tr
                  key={s.teamId}
                  className={cn(
                    "border-t border-hairline",
                    isMine && "bg-accent/15",
                    isCutLineRow && "border-b-2 border-b-primary/40",
                  )}
                >
                  <Td className="text-left font-bold tabular">{s.rank}</Td>
                  <Td className="text-left">
                    <span className="font-semibold">{team?.label}</span>
                    {isMine && (
                      <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-primary font-bold">
                        You
                      </span>
                    )}
                  </Td>
                  <Td>{s.wins}</Td>
                  <Td>{s.losses}</Td>
                  <Td>{s.pointsFor}</Td>
                  <Td>{s.pointsAgainst}</Td>
                  <Td
                    className={
                      s.pointDifferential >= 0 ? "text-primary" : "text-warn"
                    }
                  >
                    {s.pointDifferential >= 0 ? "+" : ""}
                    {s.pointDifferential}
                  </Td>
                  <Td
                    className={
                      s.avgPointDifferential >= 0 ? "text-primary" : "text-warn"
                    }
                  >
                    {s.avgPointDifferential >= 0 ? "+" : ""}
                    {s.avgPointDifferential.toFixed(1)}
                  </Td>
                  <Td>{s.matchesPlayed}</Td>
                  <Td className="text-right">
                    <AdvancementBadge status={s.advancementStatus} />
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 whitespace-nowrap text-center",
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 whitespace-nowrap text-center tabular",
        className,
      )}
    >
      {children}
    </td>
  )
}
