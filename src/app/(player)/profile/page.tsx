import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { logout } from "@/lib/auth/actions"
import { Button } from "@/components/ui/Button"

export const metadata = { title: "Profile · Dinkedin" }

export default async function ProfilePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: playerProfile } = await supabase
    .from("player_profiles")
    .select("display_name, skill_level, home_court, preferred_play_type, bio")
    .eq("user_id", user.id)
    .maybeSingle()

  const rows: { label: string; value: string }[] = [
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Display name", value: playerProfile?.display_name ?? "Not set" },
    { label: "Skill level", value: playerProfile?.skill_level?.toString() ?? "Not set" },
    { label: "Home court", value: playerProfile?.home_court ?? "Not set" },
    {
      label: "Preferred play",
      value: playerProfile?.preferred_play_type ?? "Not set",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account. Editing arrives in Phase 2."
      />

      <Card className="p-0 overflow-hidden">
        <dl>
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
            >
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="text-sm font-medium capitalize">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <form action={logout}>
        <Button type="submit" variant="secondary" fullWidth>
          Sign out
        </Button>
      </form>
    </div>
  )
}
