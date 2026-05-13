"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import {
  RegistrationSchema,
  type RegistrationFormState,
} from "@/lib/validation"

export async function registerForDivision(
  _state: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const user = await requireUser()

  const parsed = RegistrationSchema.safeParse({
    division_id: formData.get("division_id") ?? "",
    partner_email: formData.get("partner_email") ?? "",
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return {
      errors: { ...flat.fieldErrors, form: flat.formErrors },
    }
  }

  const { division_id, partner_email } = parsed.data
  const supabase = await createClient()

  const { data: division, error: divErr } = await supabase
    .from("tournament_divisions")
    .select("id, name, play_type, max_players, tournament_id")
    .eq("id", division_id)
    .maybeSingle()

  if (divErr || !division) {
    return { errors: { form: ["Division not found."] } }
  }

  const { data: tournament, error: tourErr } = await supabase
    .from("tournaments")
    .select("id, status, registration_deadline")
    .eq("id", division.tournament_id)
    .maybeSingle()

  if (tourErr || !tournament) {
    return { errors: { form: ["Tournament not found."] } }
  }

  if (!["published", "active"].includes(tournament.status)) {
    return { errors: { form: ["This tournament isn't accepting registrations."] } }
  }
  if (
    tournament.registration_deadline &&
    new Date(tournament.registration_deadline) < new Date()
  ) {
    return { errors: { form: ["Registration is closed for this tournament."] } }
  }

  const isDoubles =
    division.play_type === "doubles" || division.play_type === "mixed_doubles"

  // Look up partner (required for doubles divisions).
  let partner_player_id: string | null = null
  if (isDoubles) {
    if (!partner_email) {
      return {
        errors: {
          partner_email: ["Doubles divisions need a partner email."],
        },
      }
    }
    const { data: partnerId, error: lookupErr } = await supabase.rpc(
      "find_user_id_by_email",
      { p_email: partner_email },
    )
    if (lookupErr) {
      return { errors: { form: [lookupErr.message] } }
    }
    if (!partnerId) {
      return {
        errors: {
          partner_email: [
            "We couldn't find a Dinkedin account with that email. They'll need to sign up first.",
          ],
        },
      }
    }
    if (partnerId === user.id) {
      return {
        errors: { partner_email: ["You can't partner with yourself."] },
      }
    }
    partner_player_id = partnerId
  } else if (partner_email) {
    return {
      errors: { partner_email: ["Singles divisions don't take a partner."] },
    }
  }

  // Already registered?
  const { data: existing } = await supabase
    .from("tournament_registrations")
    .select("id, status")
    .eq("division_id", division_id)
    .eq("player_id", user.id)
    .neq("status", "canceled")
    .maybeSingle()

  if (existing) {
    return { errors: { form: ["You're already registered for this division."] } }
  }

  // Check capacity (max_players counts total slots, partners included).
  if (division.max_players != null) {
    const { count } = await supabase
      .from("tournament_registrations")
      .select("id", { count: "exact", head: true })
      .eq("division_id", division_id)
      .eq("status", "registered")

    const taken =
      (count ?? 0) * (isDoubles ? 2 : 1) + (isDoubles ? 2 : 1)
    if (taken > division.max_players) {
      return { errors: { form: ["This division is full."] } }
    }
  }

  const { error: insertErr } = await supabase
    .from("tournament_registrations")
    .insert({
      tournament_id: tournament.id,
      division_id,
      player_id: user.id,
      partner_player_id,
      status: "registered",
    })

  if (insertErr) {
    return { errors: { form: [insertErr.message] } }
  }

  revalidatePath(`/tournaments/${tournament.id}`)
  revalidatePath("/tournaments")
  revalidatePath("/home")
  revalidatePath("/rewards")
  revalidatePath("/rankings")
  revalidatePath(`/organizer/tournaments/${tournament.id}`)

  return {
    message: isDoubles
      ? `You and your partner are in. +50 reward points each.`
      : `You're in. +50 reward points.`,
  }
}

export async function cancelRegistration(
  registrationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser()
  const supabase = await createClient()

  // RLS already constrains this to your own registration.
  const { data, error } = await supabase
    .from("tournament_registrations")
    .update({ status: "canceled" })
    .eq("id", registrationId)
    .eq("player_id", user.id)
    .select("tournament_id")
    .maybeSingle()

  if (error) return { ok: false, error: error.message }

  if (data?.tournament_id) {
    revalidatePath(`/tournaments/${data.tournament_id}`)
    revalidatePath(`/organizer/tournaments/${data.tournament_id}`)
  }
  revalidatePath("/home")
  revalidatePath("/tournaments")
  return { ok: true }
}
