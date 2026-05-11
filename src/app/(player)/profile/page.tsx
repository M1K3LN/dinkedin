import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { RankBadge } from "@/components/ui/RankBadge"
import { logout } from "@/lib/auth/actions"
import { getInitials } from "@/lib/utils"

export const metadata = { title: "Profile · Dinkedin" }

export default async function ProfilePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: playerProfile } = await supabase
    .from("player_profiles")
    .select(
      "display_name, skill_level, home_court, preferred_play_type, bio, wins, losses",
    )
    .eq("user_id", user.id)
    .maybeSingle()

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    playerProfile?.display_name ||
    user.email.split("@")[0]

  const total = (playerProfile?.wins ?? 0) + (playerProfile?.losses ?? 0)
  const reliability = Math.min(100, total * 8)
  const skill = playerProfile?.skill_level != null
    ? Number(playerProfile.skill_level)
    : null

  const rows: { label: string; value: string }[] = [
    { label: "Display name", value: playerProfile?.display_name ?? "Not set" },
    { label: "Skill level", value: playerProfile?.skill_level?.toString() ?? "Not set" },
    { label: "Home court", value: playerProfile?.home_court ?? "Not set" },
    {
      label: "Preferred play",
      value: playerProfile?.preferred_play_type?.replace("_", " ") ?? "Not set",
    },
    { label: "Bio", value: playerProfile?.bio ?? "Not set" },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your profile"
        title="You"
        description="Manage how you show up to opponents and tournament organizers."
      />

      {/* Identity card */}
      <Card className="overflow-hidden p-7">
        <div className="flex items-center gap-5">
          <div className="grid place-items-center size-20 rounded-full bg-primary text-accent font-display text-2xl font-bold ring-4 ring-bg shrink-0">
            {getInitials(fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold tracking-tight capitalize truncate">
              {fullName}
            </h2>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="primary">{user.role}</Badge>
              {skill != null && <Badge tone="accent">{skill.toFixed(1)} skill</Badge>}
            </div>
          </div>
          <div className="hidden sm:block shrink-0">
            <RankBadge rating={skill} reliability={reliability} size="sm" />
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline">
          <CardEyebrow>Player details</CardEyebrow>
        </div>
        <dl>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                i < rows.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <dt className="text-sm text-muted shrink-0">{row.label}</dt>
              <dd className="text-sm font-semibold text-ink-2 text-right truncate min-w-0">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="px-5 py-4 border-t border-hairline bg-surface-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Editing arrives in Phase 2 with onboarding.
          </p>
          <Button size="sm" variant="outline" disabled>
            Edit profile
          </Button>
        </div>
      </Card>

      <form action={logout}>
        <Button type="submit" variant="outline" fullWidth>
          Sign out
        </Button>
      </form>
    </div>
  )
}
