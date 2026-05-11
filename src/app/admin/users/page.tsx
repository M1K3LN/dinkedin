import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Users · Admin" }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, role, first_name, last_name, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="All accounts. Role management arrives in Phase 2."
      />

      {!users || users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Once players sign up, they'll appear here."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul>
            {users.map((u) => {
              const name = [u.first_name, u.last_name].filter(Boolean).join(" ")
              return (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {name || u.email}
                    </p>
                    {name && <p className="text-xs text-muted truncate">{u.email}</p>}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {u.role}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
