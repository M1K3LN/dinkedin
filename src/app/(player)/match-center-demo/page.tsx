import Link from "next/link"
import { requireUser } from "@/lib/dal"
import {
  moneyBallDivision,
  trackedOnlyDivision,
} from "@/lib/match-center/mock"
import { MatchCenter } from "@/components/match-center/MatchCenter"
import { Button } from "@/components/ui/Button"

export const metadata = { title: "Match Center · Demo · Dinkedin" }
export const dynamic = "force-dynamic"

export default async function MatchCenterDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>
}) {
  await requireUser()
  const { scenario } = await searchParams
  const data =
    scenario === "tracked-only" ? trackedOnlyDivision() : moneyBallDivision()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted">
          Demo data · this isn&apos;t a real tournament
        </p>
        <div className="flex gap-2">
          <Link href="/match-center-demo">
            <Button
              variant={!scenario ? "primary" : "outline"}
              size="sm"
            >
              20-team
            </Button>
          </Link>
          <Link href="/match-center-demo?scenario=tracked-only">
            <Button
              variant={scenario === "tracked-only" ? "primary" : "outline"}
              size="sm"
            >
              6-team (tracked only)
            </Button>
          </Link>
        </div>
      </div>
      <MatchCenter data={data} />
    </div>
  )
}
