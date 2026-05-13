"use client"

import { useState, useTransition } from "react"
import { redeemReward, type RedeemResult } from "@/lib/rewards/actions"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { cn } from "@/lib/utils"
import { CopyButton } from "./CopyButton"

type Tier = {
  id: string
  name: string
  description: string
  pointsCost: number
  valueLabel: string
  featured: boolean
}

type Success = Extract<RedeemResult, { ok: true }>

export function RedeemPanel({
  balance,
  tiers,
  shopifyLive,
}: {
  balance: number
  tiers: Tier[]
  shopifyLive: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Success | null>(null)

  const redeem = (tier: Tier) => {
    if (!confirm(`Redeem ${tier.pointsCost} points for ${tier.name}?`)) return
    setError(null)
    setSuccess(null)
    setPendingId(tier.id)
    startTransition(async () => {
      const res = await redeemReward(tier.id)
      setPendingId(null)
      if (res.ok) setSuccess(res)
      else setError(res.error)
    })
  }

  return (
    <div className="space-y-3">
      {success && (
        <Card tone="accent" className="relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] font-semibold opacity-70">
                Redeemed
              </p>
              <p className="font-display text-2xl font-bold tracking-tight mt-0.5">
                {success.tierName} unlocked
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="text-xs font-semibold opacity-60 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-accent-ink text-accent px-4 py-4 flex items-center justify-between gap-3">
            <p className="font-display text-2xl md:text-3xl font-bold tabular tracking-[0.08em] truncate">
              {success.code}
            </p>
            <CopyButton value={success.code} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-accent-ink/80 flex-wrap gap-2">
            <span>
              Expires{" "}
              {new Date(success.expiresAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {success.mocked && (
              <Badge tone="primary">Practice — not a live code</Badge>
            )}
          </div>
        </Card>
      )}

      {error && (
        <Card className="bg-warn/10 border-warn/30">
          <p className="text-sm text-warn font-medium">{error}</p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {tiers.map((t) => {
          const canAfford = balance >= t.pointsCost
          const isThisPending = pendingId === t.id
          const progress = Math.min(100, Math.round((balance / t.pointsCost) * 100))

          return (
            <Card
              key={t.id}
              className={cn(
                "relative flex flex-col gap-3",
                t.featured && "ring-2 ring-accent",
              )}
            >
              {t.featured && (
                <span className="absolute -top-2 -right-2 rounded-full bg-accent text-accent-ink text-[10px] uppercase tracking-[0.14em] font-bold px-2 py-1 shadow-md">
                  Best value
                </span>
              )}
              <div>
                <p className="font-display text-3xl font-bold tracking-tight">
                  {t.valueLabel}
                </p>
                <p className="text-sm text-muted mt-1">{t.description}</p>
              </div>

              <div className="mt-1">
                <div className="flex items-end justify-between gap-2">
                  <p className="text-sm tabular">
                    <span className="font-display text-xl font-bold">
                      {t.pointsCost.toLocaleString()}
                    </span>
                    <span className="text-muted"> pts</span>
                  </p>
                  {!canAfford && (
                    <p className="text-xs text-muted tabular">
                      {(t.pointsCost - balance).toLocaleString()} pts to go
                    </p>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      canAfford ? "bg-primary" : "bg-accent",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button
                size="sm"
                disabled={!canAfford || pending}
                onClick={() => redeem(t)}
                variant={canAfford ? "primary" : "outline"}
                className="mt-1"
              >
                {isThisPending ? (
                  <LoadingSpinner className="text-current" />
                ) : canAfford ? (
                  "Redeem"
                ) : (
                  "Not yet"
                )}
              </Button>
            </Card>
          )
        })}
      </div>

      {!shopifyLive && (
        <p className="text-xs text-muted">
          Practice mode: codes are generated locally and won&apos;t work at
          checkout. Set <code className="text-ink-2">SHOPIFY_STORE</code> and{" "}
          <code className="text-ink-2">SHOPIFY_ADMIN_TOKEN</code> to mint real
          Shopify discount codes.
        </p>
      )}
    </div>
  )
}
