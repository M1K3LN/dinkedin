import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { formatNumber } from "@/lib/utils"

export const metadata = { title: "Rewards · Dinkedin" }

const REASON_LABELS: Record<string, string> = {
  account_created: "Welcome bonus",
  tournament_registration: "Tournament registration",
  match_win: "Match win",
  tournament_placement: "Tournament placement",
  referral_signup: "Referral signup",
  admin_adjustment: "Admin adjustment",
  shopify_redemption: "Shopify redemption",
}

export default async function RewardsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const [{ data: playerProfile }, { data: events }] = await Promise.all([
    supabase
      .from("player_profiles")
      .select("total_reward_points")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("reward_events")
      .select("id, points, reason, source, created_at")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ])

  const balance = playerProfile?.total_reward_points ?? 0
  // Progress toward an imaginary 500-pt redemption tier
  const tierTarget = 500
  const tierProgress = Math.min(100, (balance / tierTarget) * 100)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Earn perks for showing up"
        title="Rewards"
        description="Earn points playing, redeem for Shopify perks. Redemption goes live in Phase 4."
      />

      {/* Balance hero */}
      <Card tone="dark" className="relative overflow-hidden p-7">
        <div
          aria-hidden
          className="absolute -top-16 -right-12 size-64 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative grid sm:grid-cols-[1fr_auto] gap-5 items-end">
          <div>
            <CardEyebrow className="text-accent">Reward balance</CardEyebrow>
            <p className="font-display text-6xl md:text-7xl font-bold tabular text-accent leading-none mt-2">
              {formatNumber(balance)}
            </p>
            <p className="text-primary-ink/70 mt-3 text-sm max-w-prose">
              Tournament wins, registrations, and referrals all add to your balance.
            </p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-primary-ink/60 font-semibold">
              Next reward tier
            </p>
            <p className="font-display text-2xl font-bold tabular">
              {formatNumber(balance)} <span className="text-primary-ink/40">/ {tierTarget}</span>
            </p>
            <div className="h-2 w-full sm:w-44 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ways to earn */}
      <div>
        <CardEyebrow>Ways to earn</CardEyebrow>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <EarnTile points={100} label="Account created" tone="accent" />
          <EarnTile points={50} label="Register for a tournament" />
          <EarnTile points={100} label="Win a match" />
          <EarnTile points={250} label="Referral signup" />
          <EarnTile points={500} label="1st place finish" tone="gold" />
          <EarnTile points={300} label="2nd place finish" />
        </div>
      </div>

      {/* Activity */}
      <div>
        <CardEyebrow>Recent activity</CardEyebrow>
        <div className="mt-3">
          {!events || events.length === 0 ? (
            <EmptyState
              title="No reward activity yet"
              description="Sign up gave you 100 points. Register for tournaments or win matches to earn more."
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <ul>
                {events.map((e, i) => (
                  <li
                    key={e.id}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < events.length - 1 ? "border-b border-hairline" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {REASON_LABELS[e.reason] ?? e.reason}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(e.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-display text-lg font-bold tabular ${
                        e.points >= 0 ? "text-primary" : "text-warn"
                      }`}
                    >
                      {e.points >= 0 ? "+" : ""}
                      {formatNumber(e.points)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function EarnTile({
  points,
  label,
  tone = "neutral",
}: {
  points: number
  label: string
  tone?: "neutral" | "accent" | "gold"
}) {
  return (
    <div className="rounded-2xl bg-surface border border-hairline p-4 flex items-center gap-3">
      <div className="font-display text-2xl font-bold tabular text-primary min-w-14">
        +{points}
      </div>
      <p className="text-sm font-semibold text-ink-2 flex-1">{label}</p>
      {tone === "gold" && <Badge tone="gold">Podium</Badge>}
      {tone === "accent" && <Badge tone="accent">Easy</Badge>}
    </div>
  )
}
