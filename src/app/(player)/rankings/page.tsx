import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Rankings · Dinkedin" }

export default async function RankingsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: leaderboard } = await supabase
    .from("player_profiles")
    .select("user_id, display_name, total_ranking_points, wins, losses")
    .order("total_ranking_points", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rankings"
        description="The Dinkedin community leaderboard. Match results will populate it in Phase 3."
      />

      {!leaderboard || leaderboard.length === 0 ? (
        <EmptyState
          title="Leaderboard is warming up"
          description="Players will appear here as they earn ranking points from tournaments and matches."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ol>
            {leaderboard.map((row, idx) => {
              const isYou = row.user_id === user.id
              return (
                <li
                  key={row.user_id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="size-8 rounded-full bg-surface-muted flex items-center justify-center text-sm font-semibold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className={`truncate text-sm font-medium ${isYou ? "text-primary" : ""}`}>
                      {row.display_name ?? "Unknown player"}
                      {isYou && <span className="ml-2 text-xs text-muted">(you)</span>}
                    </span>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatNumber(row.total_ranking_points)}
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      )}
    </div>
  )
}
