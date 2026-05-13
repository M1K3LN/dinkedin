"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import {
  ProfileUpdateSchema,
  type ProfileFormState,
} from "@/lib/validation"

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser()

  const parsed = ProfileUpdateSchema.safeParse({
    first_name: formData.get("first_name") ?? "",
    last_name: formData.get("last_name") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    display_name: formData.get("display_name") ?? "",
    skill_level: formData.get("skill_level") ?? "",
    home_court: formData.get("home_court") ?? "",
    preferred_play_type: formData.get("preferred_play_type") ?? "",
    bio: formData.get("bio") ?? "",
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as NonNullable<ProfileFormState>["errors"],
    }
  }

  const {
    first_name,
    last_name,
    phone,
    city,
    state,
    display_name,
    skill_level,
    home_court,
    preferred_play_type,
    bio,
  } = parsed.data

  const supabase = await createClient()

  const [profileRes, playerRes] = await Promise.all([
    supabase
      .from("profiles")
      .update({ first_name, last_name, phone, city, state })
      .eq("user_id", user.id),
    supabase
      .from("player_profiles")
      .update({
        display_name,
        skill_level,
        home_court,
        preferred_play_type,
        bio,
      })
      .eq("user_id", user.id),
  ])

  if (profileRes.error || playerRes.error) {
    return {
      errors: {
        form: [
          profileRes.error?.message ??
            playerRes.error?.message ??
            "Could not save profile.",
        ],
      },
    }
  }

  revalidatePath("/profile")
  revalidatePath("/home")
  redirect("/profile")
}
