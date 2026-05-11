import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/database"

export type SessionUser = {
  id: string
  email: string
  role: UserRole
  firstName: string | null
  lastName: string | null
}

/**
 * Returns the authenticated user with their role joined from `profiles`,
 * or null when no session is present. Cached per-request via React.cache.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, email")
    .eq("user_id", user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    role: profile?.role ?? "player",
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
  }
})

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(...allowed: UserRole[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!allowed.includes(user.role)) redirect("/home")
  return user
}
