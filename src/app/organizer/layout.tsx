import { requireRole } from "@/lib/dal"
import { DashboardShell } from "@/components/layout/DashboardShell"

const LINKS = [
  { href: "/organizer", label: "Dashboard" },
  { href: "/organizer/tournaments", label: "My tournaments" },
  { href: "/organizer/tournaments/new", label: "Create tournament" },
  { href: "/home", label: "Player view" },
]

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("organizer", "admin")
  return (
    <DashboardShell title="Organizer" links={LINKS} user={user}>
      {children}
    </DashboardShell>
  )
}
