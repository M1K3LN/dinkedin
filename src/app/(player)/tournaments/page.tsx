import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export const metadata = { title: "Tournaments · Dinkedin" }

export default function TournamentsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Find your next match"
        title="Tournaments"
        description="Discover events near you, filter by skill, and lock in your spot. Live discovery ships in Phase 2."
      />

      {/* Sneak preview of the eventual card style */}
      <div className="space-y-3">
        <CardEyebrow>Preview of what&apos;s coming</CardEyebrow>
        <PreviewCard />
      </div>

      <EmptyState
        title="No tournaments published yet"
        description="When organizers publish events, you'll see them here with photos, distance, divisions, and one-tap registration."
      />
    </div>
  )
}

function PreviewCard() {
  return (
    <Card className="p-0 overflow-hidden grid sm:grid-cols-[1fr_1.4fr]">
      {/* Photo area (CSS gradient placeholder — no external image required) */}
      <div
        className="relative h-44 sm:h-auto sm:min-h-44 bg-gradient-to-br from-[#1F5B41] via-[#0F3D2E] to-[#0B2A1F]"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(198,255,61,0.5), transparent 40%), radial-gradient(circle at 80% 20%, rgba(247,245,238,0.18), transparent 35%)",
          }}
        />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-bg/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
          <span className="size-1.5 rounded-full bg-accent" />
          Sat · Apr 18
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">Spring Smash 2026</h3>
            <p className="text-sm text-muted mt-0.5">Riverside Courts · Austin, TX</p>
          </div>
          <Badge tone="accent">Open</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="outline">3.5 · Doubles</Badge>
          <Badge tone="outline">4.0 · Mixed</Badge>
          <Badge tone="outline">4.5 · Singles</Badge>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm">
            <span className="font-display text-lg font-bold tabular">11</span>
            <span className="text-muted"> spots left</span>
          </p>
          <span className="text-sm font-semibold text-muted">$25</span>
        </div>
      </div>
    </Card>
  )
}
