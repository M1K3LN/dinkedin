"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import {
  generateRedemptionCode,
  tierById,
} from "@/lib/rewards/tiers"
import { createDiscountCode } from "@/lib/shopify/client"

const EXPIRY_DAYS = 90

export type RedeemResult =
  | {
      ok: true
      code: string
      mocked: boolean
      tierName: string
      expiresAt: string
    }
  | { ok: false; error: string }

export async function redeemReward(tierId: string): Promise<RedeemResult> {
  await requireUser()
  const tier = tierById(tierId)
  if (!tier) return { ok: false, error: "Unknown reward tier." }

  const supabase = await createClient()
  const code = generateRedemptionCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  // 1. Atomic: deduct points + insert pending redemption row.
  const { data: redemptionId, error: dbErr } = await supabase.rpc(
    "redeem_reward_points",
    {
      p_points_required: tier.pointsCost,
      p_discount_type: tier.discountType,
      p_discount_value: tier.discountValue,
      p_code: code,
      p_expires_at: expiresAt.toISOString(),
    },
  )

  if (dbErr || !redemptionId) {
    const msg = dbErr?.message?.includes("Insufficient")
      ? "You don't have enough reward points yet."
      : dbErr?.message ?? "Could not start the redemption."
    return { ok: false, error: msg }
  }

  // 2. Create the discount on Shopify (or mock in dev).
  const shopifyResult = await createDiscountCode({
    code,
    discountType: tier.discountType,
    discountValue: tier.discountValue,
    expiresAt,
  })

  if (!shopifyResult.ok) {
    await supabase.rpc("mark_redemption_failed", {
      p_redemption_id: redemptionId,
    })
    revalidatePath("/rewards")
    revalidatePath("/home")
    return {
      ok: false,
      error: `Couldn't create the discount: ${shopifyResult.error}. Your points were refunded.`,
    }
  }

  // 3. Mark active with the Shopify (or mock) id.
  await supabase.rpc("mark_redemption_active", {
    p_redemption_id: redemptionId,
    p_shopify_discount_id: shopifyResult.shopifyId,
  })

  revalidatePath("/rewards")
  revalidatePath("/home")

  return {
    ok: true,
    code,
    mocked: shopifyResult.mocked,
    tierName: tier.name,
    expiresAt: expiresAt.toISOString(),
  }
}
