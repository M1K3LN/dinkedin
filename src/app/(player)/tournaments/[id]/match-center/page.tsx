import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/dal"
import { loadMatchCenter } from "@/lib/match-center/loader"
import { MatchCenter } from "@/components/match-center/MatchCenter"
import { Button } from "@/components/ui/Button"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data } = await supabase
    .from("tournaments")
    .select("name")
    .eq("id", id)
    .maybeSingle()
  return { title: `${data?.name ?? "Match Center"} · Dinkedin` }
}

export default async function MatchCenterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ division?: string }>
}) {
  const [{ id }, { division: divisionId }] = await Promise.all([
    params,
    searchParams,
  ])
  const user = await requireUser()

  const data = await loadMatchCenter(id, user.id, divisionId)
  if (!data) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/tournaments/${id}`}>
          <Button variant="ghost" size="sm">
            ← Tournament details
          </Button>
        </Link>
      </div>
      <MatchCenter data={data} />
    </div>
  )
}
