"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import {
  MatchCreateSchema,
  MatchScoreSchema,
  type MatchFormState,
} from "@/lib/validation"
import {
  generateRoundRobinPairings,
  scheduleMatches,
} from "@/lib/match-center/scheduler"

// -----------------------------------------------------------------------------
// Create a new match (organizer)
// -----------------------------------------------------------------------------

export async function createMatch(
  tournamentId: string,
  divisionId: string,
  _state: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const parsed = MatchCreateSchema.safeParse({
    team_1_registration_id: formData.get("team_1_registration_id") ?? "",
    team_2_registration_id: formData.get("team_2_registration_id") ?? "",
    round_name: formData.get("round_name") ?? "",
  })
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { errors: { ...flat.fieldErrors, form: flat.formErrors } }
  }

  // Look up both registrations to extract player/partner ids.
  const { data: regs, error: regErr } = await supabase
    .from("tournament_registrations")
    .select("id, player_id, partner_player_id, tournament_id, division_id, status")
    .in("id", [
      parsed.data.team_1_registration_id,
      parsed.data.team_2_registration_id,
    ])

  if (regErr || !regs || regs.length !== 2) {
    return { errors: { form: ["Could not load the selected teams."] } }
  }
  if (regs.some((r) => r.tournament_id !== tournamentId || r.division_id !== divisionId)) {
    return { errors: { form: ["Teams must be in this division."] } }
  }

  const team1 = regs.find((r) => r.id === parsed.data.team_1_registration_id)!
  const team2 = regs.find((r) => r.id === parsed.data.team_2_registration_id)!

  const { error: insertErr } = await supabase.from("matches").insert({
    tournament_id: tournamentId,
    division_id: divisionId,
    round_name: parsed.data.round_name,
    player_1_id: team1.player_id,
    team_1_partner_id: team1.partner_player_id,
    player_2_id: team2.player_id,
    team_2_partner_id: team2.partner_player_id,
    status: "scheduled",
  })
  if (insertErr) return { errors: { form: [insertErr.message] } }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { message: "Match added." }
}

// -----------------------------------------------------------------------------
// Enter a score + complete a match (organizer)
// -----------------------------------------------------------------------------

export async function scoreMatch(
  matchId: string,
  _state: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  await requireRole("organizer", "admin")

  const parsed = MatchScoreSchema.safeParse({
    team_1_score: formData.get("team_1_score") ?? "",
    team_2_score: formData.get("team_2_score") ?? "",
  })
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { errors: { ...flat.fieldErrors, form: flat.formErrors } }
  }

  const supabase = await createClient()

  const { data: match, error: mErr } = await supabase
    .from("matches")
    .select(
      "id, tournament_id, division_id, player_1_id, player_2_id, team_1_partner_id, team_2_partner_id",
    )
    .eq("id", matchId)
    .maybeSingle()

  if (mErr || !match) return { errors: { form: ["Match not found."] } }

  const isDoubles =
    match.team_1_partner_id != null || match.team_2_partner_id != null
  const winner_team: "team_1" | "team_2" =
    parsed.data.team_1_score > parsed.data.team_2_score ? "team_1" : "team_2"
  const winner_player_id =
    winner_team === "team_1" ? match.player_1_id : match.player_2_id

  const { error } = await supabase
    .from("matches")
    .update({
      team_1_score: parsed.data.team_1_score,
      team_2_score: parsed.data.team_2_score,
      score: `${parsed.data.team_1_score}-${parsed.data.team_2_score}`,
      winner_team,
      winner_player_id: isDoubles ? null : winner_player_id,
      status: "completed",
      played_at: new Date().toISOString(),
    })
    .eq("id", matchId)

  if (error) return { errors: { form: [error.message] } }

  revalidatePath(`/organizer/tournaments/${match.tournament_id}`)
  revalidatePath(`/tournaments/${match.tournament_id}`)
  revalidatePath("/home")
  revalidatePath("/rankings")
  revalidatePath("/rewards")
  return { message: "Score saved." }
}

// -----------------------------------------------------------------------------
// Delete a match (organizer). Only allowed when not yet completed.
// -----------------------------------------------------------------------------

export async function deleteMatch(
  matchId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { data: match } = await supabase
    .from("matches")
    .select("status, tournament_id")
    .eq("id", matchId)
    .maybeSingle()

  if (!match) return { ok: false, error: "Match not found." }
  if (match.status === "completed") {
    return {
      ok: false,
      error: "Can't delete a completed match — points have already been awarded.",
    }
  }

  const { error } = await supabase.from("matches").delete().eq("id", matchId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/organizer/tournaments/${match.tournament_id}`)
  revalidatePath(`/tournaments/${match.tournament_id}`)
  return { ok: true }
}

// -----------------------------------------------------------------------------
// Toggle tournament 'active' state (organizer-driven)
// -----------------------------------------------------------------------------

export async function activateTournament(tournamentId: string): Promise<{
  ok: boolean
  error?: string
}> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "active" })
    .eq("id", tournamentId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { ok: true }
}

// -----------------------------------------------------------------------------
// Finalize tournament with placements. Uses SECURITY DEFINER RPC.
// `placements` is an array of { divisionId, first?, second?, third? } where
// each placement is an array of 1 (singles) or 2 (doubles) player UUIDs.
// -----------------------------------------------------------------------------

type Placement = {
  divisionId: string
  first?: string[]
  second?: string[]
  third?: string[]
}

export async function finalizeTournament(
  tournamentId: string,
  placements: Placement[],
): Promise<{ ok: boolean; error?: string }> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const payload = placements.map((p) => ({
    division_id: p.divisionId,
    first: p.first ?? [],
    second: p.second ?? [],
    third: p.third ?? [],
  }))

  const { error } = await supabase.rpc("award_tournament_placements", {
    p_tournament_id: tournamentId,
    p_placements: payload,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  revalidatePath("/rankings")
  revalidatePath("/rewards")
  revalidatePath("/home")
  return { ok: true }
}

// -----------------------------------------------------------------------------
// Round-robin match generation (organizer)
// -----------------------------------------------------------------------------
// Builds a full round-robin schedule for a division. Each registered team
// plays every other team exactly once. Matches are inserted as 'scheduled',
// distributed across the requested number of courts, starting at the given
// time. Refuses to run if matches already exist for the division so we
// don't double-up.
//
// Usage from the UI: call this from the organizer matches section once
// teams are registered. Players can then enter the Match Center and see
// the full bracket immediately.

export async function generateRoundRobin(
  tournamentId: string,
  divisionId: string,
  opts: {
    courts?: number
    startTime?: string
    intervalMinutes?: number
  } = {},
): Promise<{ ok: boolean; error?: string; matchCount?: number }> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { count: existing } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("division_id", divisionId)

  if ((existing ?? 0) > 0) {
    return {
      ok: false,
      error:
        "This division already has matches. Delete them first if you want a fresh schedule.",
    }
  }

  const { data: registrations, error: regErr } = await supabase
    .from("tournament_registrations")
    .select("id, player_id, partner_player_id, status")
    .eq("division_id", divisionId)
    .neq("status", "canceled")
    .order("registered_at", { ascending: true })

  if (regErr) return { ok: false, error: regErr.message }
  if (!registrations || registrations.length < 2) {
    return {
      ok: false,
      error: "Need at least 2 registered teams to generate a round robin.",
    }
  }

  const regById = new Map(registrations.map((r) => [r.id, r]))
  const pairings = generateRoundRobinPairings(registrations.map((r) => r.id))

  const scheduled = scheduleMatches({
    pairings,
    courts: opts.courts ?? 4,
    startTime: opts.startTime ?? defaultStartTime(),
    intervalMinutes: opts.intervalMinutes ?? 30,
  })

  const rows = scheduled.map((p) => {
    const t1 = regById.get(p.team1Id)!
    const t2 = regById.get(p.team2Id)!
    return {
      tournament_id: tournamentId,
      division_id: divisionId,
      round_number: p.round,
      round_name: `Round ${p.round}`,
      court_number: p.courtNumber,
      scheduled_time: p.scheduledTime,
      player_1_id: t1.player_id,
      team_1_partner_id: t1.partner_player_id,
      player_2_id: t2.player_id,
      team_2_partner_id: t2.partner_player_id,
      status: "scheduled" as const,
    }
  })

  const { error: insertErr } = await supabase.from("matches").insert(rows)
  if (insertErr) return { ok: false, error: insertErr.message }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}/match-center`)
  return { ok: true, matchCount: rows.length }
}

function defaultStartTime(): string {
  // Tomorrow at 9 AM local time.
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}
