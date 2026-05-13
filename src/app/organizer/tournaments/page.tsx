import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export const metadata = { title: "My tournaments · Organizer" }
export const dynamic = "force-dynamic"

const STATUS_TONE = {
  draft: "neutral",
  published: "accent",
  active: "primary",
  completed: "gold",
  canceled: "warn",
} as const

export default async function OrganizerTournamentsPage() {
  const user = await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, status, start_date, end_date, city, state")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Organizer"
        title="My tournaments"
        description="Drafts, published events, and history."
        action={
          <Link href="/organizer/tournaments/new">
            <Button size="sm">+ New tournament</Button>
          </Link>
        }
      />

      {!tournaments || tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          description="Create your first tournament to get started. Save it as a draft, add divisions, and publish when you're ready."
          action={
            <Link href="/organizer/tournaments/new">
              <Button>Create tournament</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/organizer/tournaments/${t.id}`}
              className="block group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-[0_8px_30px_-12px_rgba(15,61,46,0.25)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold truncate">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {[t.city, t.state].filter(Boolean).join(", ") ||
                        "Location TBA"}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[t.status as keyof typeof STATUS_TONE]}>
                    {t.status}
                  </Badge>
                </div>
                <div className="mt-4 text-sm text-ink-2">
                  {t.start_date
                    ? formatRange(t.start_date, t.end_date)
                    : "Dates TBA"}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function formatRange(start: string, end: string | null) {
  const s = new Date(start)
  const sLabel = s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  if (!end || end === start) return sLabel
  const e = new Date(end)
  return `${s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`
}
