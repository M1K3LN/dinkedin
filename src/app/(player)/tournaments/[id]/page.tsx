import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
  GENDER_TYPE_LABELS,
  PLAY_TYPE_LABELS,
  type PLAY_TYPE_OPTIONS,
} from "@/lib/validation"
import { DivisionRegisterCard } from "./DivisionRegisterCard"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await (await import("@/lib/supabase/server")).createClient()
  const { data } = await supabase
    .from("tournaments")
    .select("name")
    .eq("id", id)
    .maybeSingle()
  return { title: `${data?.name ?? "Tournament"} · Dinkedin` }
}

type PlayType = (typeof PLAY_TYPE_OPTIONS)[number]

export default async function PublicTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(
      "id, name, description, location_name, address, city, state, start_date, end_date, registration_deadline, status, created_by",
    )
    .eq("id", id)
    .maybeSingle()

  if (error || !tournament) notFound()

  const isPubliclyVisible =
    tournament.status === "published" ||
    tournament.status === "active" ||
    tournament.status === "completed"

  // Drafts/canceled are hidden from non-owners by RLS, but if they slip through
  // (e.g. organizer previewing their own draft) we still let them see it.
  if (!isPubliclyVisible && tournament.created_by !== user.id) {
    notFound()
  }

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select(
      "id, name, skill_level, play_type, gender_type, max_players, entry_fee",
    )
    .eq("tournament_id", id)
    .order("created_at", { ascending: true })

  // Counts per division.
  const divisionIds = (divisions ?? []).map((d) => d.id)
  const { data: regs } = divisionIds.length
    ? await supabase
        .from("tournament_registrations")
        .select("division_id, player_id, partner_player_id, status")
        .in("division_id", divisionIds)
        .neq("status", "canceled")
    : { data: [] }

  const countByDiv: Record<string, number> = {}
  const myDivIds = new Set<string>()
  for (const r of regs ?? []) {
    const seats =
      r.partner_player_id != null ? 2 : 1
    countByDiv[r.division_id] = (countByDiv[r.division_id] ?? 0) + seats
    if (r.player_id === user.id || r.partner_player_id === user.id) {
      myDivIds.add(r.division_id)
    }
  }

  const registrationOpen =
    (tournament.status === "published" || tournament.status === "active") &&
    (!tournament.registration_deadline ||
      new Date(tournament.registration_deadline) > new Date())

  const venue =
    tournament.location_name ||
    [tournament.city, tournament.state].filter(Boolean).join(", ") ||
    "Location TBA"

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={
          tournament.status === "draft"
            ? "Draft · only visible to you"
            : tournament.status
        }
        title={tournament.name}
        description={venue}
        action={
          <Link href="/tournaments">
            <Button variant="ghost" size="sm">All tournaments</Button>
          </Link>
        }
      />

      {/* Hero summary */}
      <Card tone="dark" className="overflow-hidden p-7">
        <div className="grid md:grid-cols-3 gap-6">
          <SummaryItem
            label="When"
            value={
              tournament.start_date
                ? formatRange(tournament.start_date, tournament.end_date)
                : "Date TBA"
            }
          />
          <SummaryItem
            label="Where"
            value={
              tournament.location_name
                ? `${tournament.location_name}${
                    tournament.city ? `, ${tournament.city}` : ""
                  }`
                : [tournament.city, tournament.state]
                    .filter(Boolean)
                    .join(", ") || "Location TBA"
            }
          />
          <SummaryItem
            label="Registration"
            value={
              registrationOpen
                ? tournament.registration_deadline
                  ? `Open until ${new Date(tournament.registration_deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                  : "Open"
                : "Closed"
            }
            tone={registrationOpen ? "accent" : "warn"}
          />
        </div>
        {tournament.description && (
          <p className="mt-6 pt-6 border-t border-white/10 text-primary-ink/80 leading-relaxed whitespace-pre-line">
            {tournament.description}
          </p>
        )}
      </Card>

      {/* Divisions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <CardEyebrow>Divisions</CardEyebrow>
          <span className="text-xs text-muted">
            {divisions?.length ?? 0} total
          </span>
        </div>

        {divisions?.length ? (
          <div className="space-y-3">
            {divisions.map((d) => (
              <DivisionRegisterCard
                key={d.id}
                division={{
                  ...d,
                  skill_level:
                    d.skill_level == null ? null : Number(d.skill_level),
                  entry_fee: d.entry_fee == null ? 0 : Number(d.entry_fee),
                  play_type: d.play_type as PlayType,
                  play_type_label: PLAY_TYPE_LABELS[d.play_type],
                  gender_type_label: GENDER_TYPE_LABELS[d.gender_type],
                  filled: countByDiv[d.id] ?? 0,
                }}
                youAreIn={myDivIds.has(d.id)}
                registrationOpen={registrationOpen}
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-muted">
              The organizer hasn&apos;t added any divisions yet.
            </p>
          </Card>
        )}
      </section>
    </div>
  )
}

function SummaryItem({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "accent" | "warn"
}) {
  const valueClass =
    tone === "accent"
      ? "text-accent"
      : tone === "warn"
        ? "text-warn"
        : "text-primary-ink"
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-primary-ink/60">
        {label}
      </p>
      <p className={`font-display text-xl font-bold mt-1 ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}

function formatRange(start: string, end: string | null) {
  const s = new Date(start)
  const sLabel = s.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  if (!end || end === start) return sLabel
  const e = new Date(end)
  return `${sLabel} – ${e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`
}
