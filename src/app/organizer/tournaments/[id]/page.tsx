import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { EditTournamentBasics } from "./EditTournamentBasics"
import { DivisionsManager } from "./DivisionsManager"
import { PublishCard } from "./PublishCard"
import { RosterSection } from "./RosterSection"
import { MatchesSection } from "./MatchesSection"
import { FinalizeSection } from "./FinalizeSection"
import { GENDER_TYPE_LABELS, PLAY_TYPE_LABELS } from "@/lib/validation"

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
  return { title: `${data?.name ?? "Tournament"} · Organizer` }
}

export default async function OrganizerTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(
      "id, name, description, location_name, address, city, state, start_date, end_date, registration_deadline, status, created_by",
    )
    .eq("id", id)
    .maybeSingle()

  if (error || !tournament) notFound()
  if (tournament.created_by !== user.id && user.role !== "admin") {
    redirect("/organizer/tournaments")
  }

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select(
      "id, name, skill_level, play_type, gender_type, max_players, entry_fee",
    )
    .eq("tournament_id", id)
    .order("created_at", { ascending: true })

  const { count: registrationCount } = await supabase
    .from("tournament_registrations")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", id)
    .neq("status", "canceled")

  const isDraft = tournament.status === "draft"

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Tournament · ${tournament.status}`}
        title={tournament.name}
        description={
          [tournament.city, tournament.state].filter(Boolean).join(", ") ||
          "Location to be confirmed"
        }
        action={
          <div className="flex gap-2">
            <Link href={`/tournaments/${id}`}>
              <Button variant="outline" size="sm">
                Public page
              </Button>
            </Link>
            <Link href="/organizer/tournaments">
              <Button variant="ghost" size="sm">All tournaments</Button>
            </Link>
          </div>
        }
      />

      {/* Status bar */}
      <Card tone="dark" className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge tone={statusTone(tournament.status)}>{tournament.status}</Badge>
          <div className="text-primary-ink/80 text-sm">
            <span className="font-semibold text-primary-ink">
              {divisions?.length ?? 0}
            </span>{" "}
            division{divisions?.length === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-primary-ink">
              {registrationCount ?? 0}
            </span>{" "}
            registered
          </div>
        </div>
        <PublishCard
          tournamentId={id}
          status={tournament.status}
          divisionsCount={divisions?.length ?? 0}
        />
      </Card>

      <EditTournamentBasics
        tournamentId={id}
        defaultValues={{
          name: tournament.name ?? "",
          description: tournament.description ?? "",
          location_name: tournament.location_name ?? "",
          address: tournament.address ?? "",
          city: tournament.city ?? "",
          state: tournament.state ?? "",
          start_date: tournament.start_date ?? "",
          end_date: tournament.end_date ?? "",
          registration_deadline: tournament.registration_deadline
            ? new Date(tournament.registration_deadline)
                .toISOString()
                .slice(0, 16)
            : "",
        }}
        locked={!isDraft}
      />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardEyebrow>Divisions</CardEyebrow>
            <CardTitle className="mt-1">
              Skill levels &amp; play types
            </CardTitle>
          </div>
        </div>
        <DivisionsManager
          tournamentId={id}
          divisions={(divisions ?? []).map((d) => ({
            ...d,
            skill_level: d.skill_level == null ? null : Number(d.skill_level),
            entry_fee: d.entry_fee == null ? 0 : Number(d.entry_fee),
            play_type_label: PLAY_TYPE_LABELS[d.play_type],
            gender_type_label: GENDER_TYPE_LABELS[d.gender_type],
          }))}
          locked={false}
        />
      </Card>

      <RosterSection tournamentId={id} />

      {tournament.status !== "draft" && (
        <>
          <MatchesSection
            tournamentId={id}
            locked={
              tournament.status === "completed" ||
              tournament.status === "canceled"
            }
          />
          {tournament.status !== "completed" &&
            tournament.status !== "canceled" && (
              <FinalizeSection
                tournamentId={id}
                tournamentStatus={tournament.status}
              />
            )}
        </>
      )}
    </div>
  )
}

function statusTone(status: string) {
  switch (status) {
    case "draft":
      return "neutral" as const
    case "published":
      return "accent" as const
    case "active":
      return "primary" as const
    case "completed":
      return "gold" as const
    case "canceled":
      return "warn" as const
    default:
      return "neutral" as const
  }
}
