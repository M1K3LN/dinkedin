import Link from "next/link"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { RankBadge } from "@/components/ui/RankBadge"
import { Stat, StatRow } from "@/components/ui/Stat"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Home · Dinkedin" }

export default async function HomePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: playerProfile } = await supabase
    .from("player_profiles")
    .select(
      "display_name, skill_level, total_ranking_points, total_reward_points, wins, losses",
    )
    .eq("user_id", user.id)
    .maybeSingle()

  const greetingName =
    playerProfile?.display_name || user.firstName || user.email.split("@")[0]

  const wins = playerProfile?.wins ?? 0
  const losses = playerProfile?.losses ?? 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : null
  const skill = playerProfile?.skill_level != null
    ? Number(playerProfile.skill_level)
    : null
  const reliability = Math.min(100, total * 8) // 0–100 based on matches played

  return (
    <div className="space-y-7">
      {/* Hero card: rating + stat trio */}
      <Card tone="dark" className="overflow-hidden p-7 md:p-9">
        <div className="grid md:grid-cols-[auto_1fr] gap-7 items-center">
          <div className="flex md:block justify-center">
            <RankBadge
              rating={skill}
              reliability={reliability}
              verified={false}
              size="lg"
            />
          </div>
          <div className="space-y-4">
            <div>
              <CardEyebrow className="text-accent">Welcome back</CardEyebrow>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1 capitalize">
                {greetingName}
              </h2>
            </div>
            <p className="text-primary-ink/70 max-w-prose">
              Your home base. Track your rating, find your next match, and watch
              the reward points stack up.
            </p>
            <StatRow className="pt-2">
              <Stat label="Wins" value={formatNumber(wins)} tone="ink" className="text-primary-ink [&_p:first-child]:text-primary-ink/60" />
              <Stat
                label="Win rate"
                value={winRate == null ? "—" : `${winRate}%`}
                tone="ink"
                className="text-primary-ink [&_p:first-child]:text-primary-ink/60"
              />
              <Stat
                label="Matches"
                value={formatNumber(total)}
                tone="ink"
                className="text-primary-ink [&_p:first-child]:text-primary-ink/60"
              />
            </StatRow>
          </div>
        </div>
      </Card>

      {/* Points row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
          <CardEyebrow>Ranking points</CardEyebrow>
          <p className="font-display text-5xl font-bold tabular mt-1.5">
            {formatNumber(playerProfile?.total_ranking_points ?? 0)}
          </p>
          <p className="text-sm text-muted mt-2">
            Earn 5 for registering, 10 per match win, up to 50 for podium.
          </p>
        </Card>
        <Card tone="accent" className="relative overflow-hidden">
          <CardEyebrow className="!text-accent-ink/70">Reward points</CardEyebrow>
          <div className="flex items-end gap-2 mt-1.5">
            <p className="font-display text-5xl font-bold tabular">
              {formatNumber(playerProfile?.total_reward_points ?? 0)}
            </p>
            <Badge tone="primary" className="mb-2">unlock perks</Badge>
          </div>
          <p className="text-sm text-accent-ink/80 mt-2">
            Redeem reward points for Shopify perks. Coming in Phase 4.
          </p>
        </Card>
      </div>

      {/* What's next */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <CardEyebrow>Up next</CardEyebrow>
            <CardTitle className="mt-1">Find your first tournament</CardTitle>
          </div>
          <Badge tone="outline">Phase 1</Badge>
        </div>
        <p className="text-ink-2 text-[15px]">
          Tournament discovery, registration, and match results come online in
          Phase 2 and 3. For now, set up your profile so you&apos;re ready to play.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/tournaments">
            <Button size="md">Browse tournaments</Button>
          </Link>
          <Link href="/profile">
            <Button size="md" variant="outline">Set up profile</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
