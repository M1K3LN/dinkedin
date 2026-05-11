import { requireRole } from "@/lib/dal"
import { DashboardShell } from "@/components/layout/DashboardShell"

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/rankings", label: "Rankings" },
  { href: "/admin/rewards", label: "Rewards" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/home", label: "Player view" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("admin")
  return (
    <DashboardShell title="Admin" links={LINKS} user={user}>
      {children}
    </DashboardShell>
  )
}
