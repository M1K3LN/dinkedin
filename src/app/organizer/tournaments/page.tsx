import { requireRole } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card } from "@/components/ui/Card"

export const metadata = { title: "My Tournaments · Organizer" }

export default async function OrganizerTournamentsPage() {
  const user = await requireRole("organizer", "admin")
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, status, start_date, city, state")
    .eq("created_by", user.id)
    .order("start_date", { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="My tournaments"
        description="Tournaments you created."
      />

      {!tournaments || tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          description="Use the 'Create tournament' page to draft your first event. Full creation flow ships in Phase 2."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul>
            {tournaments.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted">
                    {[t.city, t.state].filter(Boolean).join(", ") || "Location TBA"}
                    {t.start_date && ` · ${new Date(t.start_date).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
