import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// OAuth / email-link callback. Phase 1 uses password auth, so this is a
// forward-compatible placeholder ready for Phase 2 social/magic-link flows.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
