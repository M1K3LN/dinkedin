import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { formatNumber } from "@/lib/utils"
import { REWARD_TIERS, formatDiscount } from "@/lib/rewards/tiers"
import { isShopifyConfigured } from "@/lib/shopify/client"
import { RedeemPanel } from "./RedeemPanel"
import { CodesList } from "./CodesList"

export const metadata = { title: "Rewards · Dinkedin" }
export const dynamic = "force-dynamic"

const REASON_LABELS: Record<string, string> = {
  account_created: "Welcome bonus",
  tournament_registration: "Tournament registration",
  match_win: "Match win",
  tournament_placement: "Tournament placement",
  referral_signup: "Referral signup",
  admin_adjustment: "Admin adjustment",
  shopify_redemption: "Redeemed for discount",
}

export default async function RewardsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const [{ data: playerProfile }, { data: events }, { data: codes }] = await Promise.all([
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
    supabase
      .from("shopify_discount_codes")
      .select(
        "id, code, discount_type, discount_value, reward_points_used, status, expires_at, created_at, shopify_discount_id",
      )
      .eq("player_id", user.id)
      .neq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(25),
  ])

  const balance = playerProfile?.total_reward_points ?? 0
  const shopifyLive = isShopifyConfigured()

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Cash in your reward points"
        title="Rewards"
        description="Trade reward points for Shopify discounts. Earn more by playing tournaments and winning matches."
      />

      {/* Balance hero */}
      <Card tone="dark" className="relative overflow-hidden p-7">
        <div
          aria-hidden
          className="absolute -top-16 -right-12 size-64 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative">
          <CardEyebrow className="text-accent">Reward balance</CardEyebrow>
          <p className="font-display text-6xl md:text-7xl font-bold tabular text-accent leading-none mt-2">
            {formatNumber(balance)}
          </p>
          <p className="text-primary-ink/70 mt-3 text-sm">
            Each registration, win, and podium adds to your balance.
          </p>
          {!shopifyLive && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-bg/10 px-3 py-1 text-xs font-semibold text-primary-ink/80">
              <span className="size-1.5 rounded-full bg-warn" />
              Practice mode — connect Shopify to mint real codes
            </p>
          )}
        </div>
      </Card>

      {/* Redeem */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <CardEyebrow>Redeem</CardEyebrow>
          <span className="text-xs text-muted">{REWARD_TIERS.length} tiers</span>
        </div>
        <RedeemPanel
          balance={balance}
          tiers={REWARD_TIERS.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            pointsCost: t.pointsCost,
            valueLabel: formatDiscount(t),
            featured: !!t.featured,
          }))}
          shopifyLive={shopifyLive}
        />
      </section>

      {/* My codes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <CardEyebrow>Your codes</CardEyebrow>
          <span className="text-xs text-muted">
            {codes?.length ?? 0} redeemed
          </span>
        </div>
        {!codes || codes.length === 0 ? (
          <EmptyState
            title="No codes yet"
            description="Redeem reward points above to mint your first discount code."
          />
        ) : (
          <CodesList
            codes={codes.map((c) => ({
              id: c.id,
              code: c.code,
              status: c.status,
              valueLabel:
                c.discount_type === "percentage"
                  ? `${Number(c.discount_value)}% off`
                  : `$${Number(c.discount_value).toFixed(0)} off`,
              pointsUsed: c.reward_points_used,
              expiresAt: c.expires_at,
              createdAt: c.created_at,
              mocked: c.shopify_discount_id?.startsWith("mock:") ?? false,
            }))}
          />
        )}
      </section>

      {/* Activity */}
      <section className="space-y-3">
        <CardEyebrow>Activity</CardEyebrow>
        {!events || events.length === 0 ? (
          <EmptyState
            title="No reward activity yet"
            description="Sign up gave you 100 points. Win matches or place on the podium to earn more."
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
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
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
                    className={`font-display text-lg font-bold tabular shrink-0 ${
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
      </section>
    </div>
  )
}
