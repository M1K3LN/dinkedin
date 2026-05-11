import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Tournaments · Admin" }

export default async function AdminTournamentsPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, status, start_date, city, state, created_by")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        description="Every tournament on the platform."
      />

      {!tournaments || tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments created yet"
          description="Organizers can create tournaments starting in Phase 2."
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
