export type DiscountType = "percentage" | "fixed_amount"

export type RewardTier = {
  id: string
  name: string
  description: string
  pointsCost: number
  discountType: DiscountType
  discountValue: number
  featured?: boolean
}

/**
 * The Dinkedin reward ladder. Hard-coded for v1; could migrate to a DB
 * table later if organizers/admins want to tune values from the dashboard.
 */
export const REWARD_TIERS: RewardTier[] = [
  {
    id: "fixed_5",
    name: "$5 off",
    description: "A solid starter perk. Stack on top of any sale.",
    pointsCost: 500,
    discountType: "fixed_amount",
    discountValue: 5,
  },
  {
    id: "percent_10",
    name: "10% off",
    description: "Save on your full cart.",
    pointsCost: 1000,
    discountType: "percentage",
    discountValue: 10,
  },
  {
    id: "fixed_25",
    name: "$25 off",
    description: "New paddle money.",
    pointsCost: 2500,
    discountType: "fixed_amount",
    discountValue: 25,
    featured: true,
  },
  {
    id: "percent_25",
    name: "25% off",
    description: "The big one. Treat yourself.",
    pointsCost: 5000,
    discountType: "percentage",
    discountValue: 25,
  },
]

export function tierById(id: string): RewardTier | undefined {
  return REWARD_TIERS.find((t) => t.id === id)
}

export function formatDiscount(tier: Pick<RewardTier, "discountType" | "discountValue">) {
  return tier.discountType === "percentage"
    ? `${tier.discountValue}% off`
    : `$${tier.discountValue.toFixed(0)} off`
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I, O, 0, 1

export function generateRedemptionCode(): string {
  const seg = (n: number) =>
    Array.from(
      { length: n },
      () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    ).join("")
  return `DINK-${seg(4)}-${seg(4)}`
}
