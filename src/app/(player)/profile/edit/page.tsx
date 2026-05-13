import Link from "next/link"
import { requireUser } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { ProfileEditForm } from "./ProfileEditForm"

export const metadata = { title: "Edit profile · Dinkedin" }

export default async function ProfileEditPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const [{ data: profile }, { data: player }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, phone, city, state")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("player_profiles")
      .select("display_name, skill_level, home_court, preferred_play_type, bio")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  return (
    <div className="space-y-7 max-w-2xl">
      <PageHeader
        eyebrow="Edit profile"
        title="Make it yours"
        description="Set your name, skill level, and how opponents will see you."
        action={
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
        }
      />

      <ProfileEditForm
        defaultValues={{
          first_name: profile?.first_name ?? "",
          last_name: profile?.last_name ?? "",
          phone: profile?.phone ?? "",
          city: profile?.city ?? "",
          state: profile?.state ?? "",
          display_name: player?.display_name ?? "",
          skill_level:
            player?.skill_level != null ? String(player.skill_level) : "",
          home_court: player?.home_court ?? "",
          preferred_play_type: player?.preferred_play_type ?? "",
          bio: player?.bio ?? "",
        }}
      />
    </div>
  )
}
