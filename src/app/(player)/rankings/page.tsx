import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { formatNumber, cn } from "@/lib/utils"

export const metadata = { title: "Rankings · Dinkedin" }

export default async function RankingsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: leaderboard } = await supabase
    .from("player_profiles")
    .select("user_id, display_name, total_ranking_points, wins, losses, skill_level")
    .order("total_ranking_points", { ascending: false })
    .limit(50)

  const myRank = leaderboard?.findIndex((r) => r.user_id === user.id) ?? -1

  const podium = leaderboard?.slice(0, 3) ?? []
  const rest = leaderboard?.slice(3) ?? []

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Community leaderboard"
        title="Rankings"
        description="Match results power the leaderboard. It goes live in Phase 3 — here&apos;s the shape of it."
      />

      {!leaderboard || leaderboard.length === 0 ? (
        <EmptyState
          title="Leaderboard is warming up"
          description="Players appear here as they earn ranking points from tournaments and matches."
        />
      ) : (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[1, 0, 2].map((slot) => {
                const row = podium[slot]
                if (!row) return <div key={slot} />
                const place = slot + 1
                return <Podium key={row.user_id} row={row} place={place} isYou={row.user_id === user.id} />
              })}
            </div>
          )}

          {/* Your standing */}
          {myRank >= 0 && (
            <Card tone="dark" className="flex items-center justify-between gap-4">
              <div>
                <CardEyebrow className="text-accent">Your standing</CardEyebrow>
                <p className="font-display text-2xl font-bold mt-1">
                  #{myRank + 1}{" "}
                  <span className="text-primary-ink/60 font-medium text-base">of {leaderboard.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-primary-ink/60">
                  Ranking points
                </p>
                <p className="font-display text-3xl font-bold tabular text-accent leading-none mt-1">
                  {formatNumber(leaderboard[myRank].total_ranking_points)}
                </p>
              </div>
            </Card>
          )}

          {/* List */}
          {rest.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
                <CardEyebrow>All players</CardEyebrow>
                <span className="text-xs text-muted">Top 50</span>
              </div>
              <ol>
                {rest.map((row, idx) => {
                  const isYou = row.user_id === user.id
                  const place = idx + 4
                  return (
                    <li
                      key={row.user_id}
                      className={cn(
                        "flex items-center justify-between gap-3 px-5 py-3 border-b border-hairline last:border-b-0",
                        isYou && "bg-accent/15",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-8 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold tabular text-ink-2 shrink-0">
                          {place}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold capitalize">
                            {row.display_name ?? "Unknown player"}
                            {isYou && (
                              <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">
                            {row.wins ?? 0}W · {row.losses ?? 0}L
                            {row.skill_level != null &&
                              ` · ${Number(row.skill_level).toFixed(1)}`}
                          </p>
                        </div>
                      </div>
                      <div className="font-display text-lg font-bold tabular text-ink">
                        {formatNumber(row.total_ranking_points)}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function Podium({
  row,
  place,
  isYou,
}: {
  row: { display_name: string | null; total_ranking_points: number; user_id: string }
  place: number
  isYou: boolean
}) {
  const heights = { 1: "h-44", 2: "h-36", 3: "h-32" }[place] ?? "h-32"
  const medal = { 1: "🥇", 2: "🥈", 3: "🥉" }[place] ?? ""

  return (
    <div
      className={cn(
        "rounded-2xl p-3 md:p-4 flex flex-col justify-end items-center text-center",
        heights,
        place === 1
          ? "bg-accent text-accent-ink"
          : place === 2
            ? "bg-surface border border-hairline"
            : "bg-surface-2",
      )}
    >
      <div className="text-2xl md:text-3xl mb-1">{medal}</div>
      <p className="text-xs font-semibold truncate w-full capitalize">
        {row.display_name ?? "Unknown"}
        {isYou && (
          <span className="block text-[10px] uppercase tracking-[0.14em] mt-0.5 opacity-70">You</span>
        )}
      </p>
      <p className="font-display text-xl md:text-2xl font-bold tabular mt-1 leading-none">
        {formatNumber(row.total_ranking_points)}
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] mt-0.5 opacity-60">pts</p>
    </div>
  )
}
