"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, SignupSchema, type FormState } from "@/lib/validation"

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { errors: { form: [error.message] } }
  }

  // When "Confirm email" is enabled in Supabase Auth, signUp returns a user
  // without a session. Don't redirect to /home — the proxy would bounce us
  // back to /login (no session cookie). Tell the user to check their email.
  if (!data.session) {
    return {
      message: "Check your email to confirm your account, then log in.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/home")
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Surface Supabase's specific reasons (e.g. "Email not confirmed") so
    // users can act on them; fall back to a generic message otherwise.
    const message =
      error.code === "email_not_confirmed"
        ? "Please confirm your email before logging in. Check your inbox."
        : error.code === "invalid_credentials"
          ? "Invalid email or password."
          : error.message
    return { errors: { form: [message] } }
  }

  revalidatePath("/", "layout")
  redirect("/home")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
