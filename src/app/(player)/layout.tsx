import { requireUser } from "@/lib/dal"
import { PlayerShell } from "@/components/layout/PlayerShell"

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  return <PlayerShell user={user}>{children}</PlayerShell>
}
