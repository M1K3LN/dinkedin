"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import {
  TournamentCreateSchema,
  DivisionUpsertSchema,
  type TournamentFormState,
} from "@/lib/validation"

// =============================================================================
// Tournament create
// =============================================================================

export async function createTournament(
  _state: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  const user = await requireRole("organizer", "admin")

  const parsed = TournamentCreateSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    location_name: formData.get("location_name") ?? "",
    address: formData.get("address") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    start_date: formData.get("start_date") ?? "",
    end_date: formData.get("end_date") ?? "",
    registration_deadline: formData.get("registration_deadline") ?? "",
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { errors: { ...flat.fieldErrors, form: flat.formErrors } }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tournaments")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single()

  if (error) {
    return { errors: { form: [error.message] } }
  }

  revalidatePath("/organizer/tournaments")
  redirect(`/organizer/tournaments/${data.id}`)
}

// =============================================================================
// Tournament edit
// =============================================================================

export async function updateTournament(
  tournamentId: string,
  _state: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  await requireRole("organizer", "admin")

  const parsed = TournamentCreateSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    location_name: formData.get("location_name") ?? "",
    address: formData.get("address") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    start_date: formData.get("start_date") ?? "",
    end_date: formData.get("end_date") ?? "",
    registration_deadline: formData.get("registration_deadline") ?? "",
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { errors: { ...flat.fieldErrors, form: flat.formErrors } }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("tournaments")
    .update(parsed.data)
    .eq("id", tournamentId)

  if (error) return { errors: { form: [error.message] } }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  return { message: "Saved." }
}

// =============================================================================
// Publish / cancel / delete
// =============================================================================

export async function publishTournament(tournamentId: string): Promise<{
  ok: boolean
  error?: string
}> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { data: t, error: tErr } = await supabase
    .from("tournaments")
    .select("name, start_date")
    .eq("id", tournamentId)
    .single()

  if (tErr || !t) return { ok: false, error: tErr?.message ?? "Not found." }
  if (!t.name?.trim()) return { ok: false, error: "Set a tournament name first." }
  if (!t.start_date) return { ok: false, error: "Set a start date first." }

  const { count: divCount } = await supabase
    .from("tournament_divisions")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)

  if (!divCount || divCount === 0) {
    return { ok: false, error: "Add at least one division before publishing." }
  }

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "published" })
    .eq("id", tournamentId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  return { ok: true }
}

export async function cancelTournament(tournamentId: string): Promise<{
  ok: boolean
  error?: string
}> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "canceled" })
    .eq("id", tournamentId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  return { ok: true }
}

export async function unpublishTournament(tournamentId: string): Promise<{
  ok: boolean
  error?: string
}> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "draft" })
    .eq("id", tournamentId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  return { ok: true }
}

// =============================================================================
// Divisions
// =============================================================================

export async function upsertDivision(
  tournamentId: string,
  divisionId: string | null,
  _state: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  await requireRole("organizer", "admin")

  const parsed = DivisionUpsertSchema.safeParse({
    name: formData.get("name") ?? "",
    skill_level: formData.get("skill_level") ?? "",
    play_type: formData.get("play_type") ?? "",
    gender_type: formData.get("gender_type") ?? "",
    max_players: formData.get("max_players") ?? "",
    entry_fee: formData.get("entry_fee") ?? "",
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { errors: { ...flat.fieldErrors, form: flat.formErrors } }
  }

  const supabase = await createClient()

  const { error } = divisionId
    ? await supabase
        .from("tournament_divisions")
        .update(parsed.data)
        .eq("id", divisionId)
        .eq("tournament_id", tournamentId)
    : await supabase
        .from("tournament_divisions")
        .insert({ ...parsed.data, tournament_id: tournamentId })

  if (error) return { errors: { form: [error.message] } }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { message: divisionId ? "Division saved." : "Division added." }
}

export async function deleteDivision(
  tournamentId: string,
  divisionId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { error } = await supabase
    .from("tournament_divisions")
    .delete()
    .eq("id", divisionId)
    .eq("tournament_id", tournamentId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/organizer/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { ok: true }
}
