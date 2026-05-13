import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Temporary diagnostic endpoint. Visit /api/debug-session while logged in
 * to see exactly what auth.getUser() returns, what auth.uid() resolves to
 * inside Postgres, and what (if anything) RLS lets the profile lookup
 * return for the current user. Will be removed once the bug is fixed.
 */
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      stage: "no-user",
      authError: authError?.message ?? null,
    })
  }

  const [{ data: pgUid }, profileResult, profileById, profileByEmail] =
    await Promise.all([
      supabase.rpc("debug_auth_uid"),
      supabase
        .from("profiles")
        .select("id, user_id, email, role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("id, user_id, email, role").limit(5),
      supabase
        .from("profiles")
        .select("id, user_id, email, role")
        .eq("email", user.email ?? ""),
    ])

  return NextResponse.json({
    stage: "ok",
    auth: {
      userId: user.id,
      email: user.email,
    },
    pgAuthUid: pgUid ?? null,
    profileLookupByUserId: {
      row: profileResult.data ?? null,
      error: profileResult.error?.message ?? null,
    },
    profileLookupByEmail: {
      rows: profileByEmail.data ?? null,
      error: profileByEmail.error?.message ?? null,
    },
    visibleProfiles: profileById.data ?? null,
  })
}
