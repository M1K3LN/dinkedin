import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
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

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards" description="Earn points. Redeem for gear later." />

      <Card className="bg-primary/5 border-primary/20">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Balance</p>
        <p className="mt-1 text-4xl font-bold text-primary">
          {formatNumber(playerProfile?.total_reward_points ?? 0)}
        </p>
        <p className="mt-2 text-sm text-muted">
          Shopify redemption goes live in Phase 4.
        </p>
      </Card>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-2">
          Recent activity
        </h2>
        {!events || events.length === 0 ? (
          <EmptyState
            title="No reward activity yet"
            description="Earn points by registering for tournaments, winning matches, and referring friends."
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <ul>
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">{REASON_LABELS[e.reason] ?? e.reason}</p>
                    <p className="text-xs text-muted">
                      {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    +{formatNumber(e.points)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
