import Link from "next/link"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatNumber } from "@/lib/utils"

export default async function HomePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: playerProfile } = await supabase
    .from("player_profiles")
    .select("display_name, total_ranking_points, total_reward_points, wins, losses")
    .eq("user_id", user.id)
    .maybeSingle()

  const greetingName =
    playerProfile?.display_name || user.firstName || user.email.split("@")[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${greetingName}`}
        description="Your pickleball home base."
      />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ranking points" value={playerProfile?.total_ranking_points ?? 0} />
        <Stat label="Reward points" value={playerProfile?.total_reward_points ?? 0} accent />
        <Stat label="Wins" value={playerProfile?.wins ?? 0} />
        <Stat label="Losses" value={playerProfile?.losses ?? 0} />
      </div>

      <Card>
        <h2 className="text-base font-semibold">Get started</h2>
        <p className="text-sm text-muted mt-1">
          Phase 1 ships the foundation. Profile editing, tournament registration,
          match results, and rewards come online in Phase 2 and 3.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tournaments">
            <Button variant="primary" size="sm">Browse tournaments</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary" size="sm">Set up profile</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted font-semibold">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-primary" : ""}`}>
        {formatNumber(value)}
      </p>
    </div>
  )
}
