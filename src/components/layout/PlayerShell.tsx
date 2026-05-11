import Link from "next/link"
import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"
import { logout } from "@/lib/auth/actions"
import { getInitials } from "@/lib/utils"
import type { SessionUser } from "@/lib/dal"

const DESKTOP_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/rankings", label: "Rankings" },
  { href: "/rewards", label: "Rewards" },
  { href: "/profile", label: "Profile" },
]

export function PlayerShell({
  user,
  children,
}: {
  user: SessionUser
  children: ReactNode
}) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/home" className="font-bold text-lg tracking-tight">
            Dinkedin
          </Link>
          <nav aria-label="Primary desktop" className="hidden lg:flex items-center gap-1">
            {DESKTOP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface-muted"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold"
              title={fullName}
            >
              {getInitials(fullName)}
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="hidden sm:inline-flex text-sm text-muted hover:text-foreground px-2 py-1"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
