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
      <header className="sticky top-0 z-20 border-b border-hairline bg-bg/85 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
          >
            <span className="grid place-items-center size-8 rounded-full bg-primary text-accent">
              <PaddleMark className="size-4" />
            </span>
            Dinkedin
          </Link>

          <nav aria-label="Primary desktop" className="hidden lg:flex items-center gap-1">
            {DESKTOP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-semibold rounded-full hover:bg-surface-2 text-ink-2"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="size-9 rounded-full bg-primary text-accent flex items-center justify-center text-sm font-semibold ring-2 ring-bg"
              title={fullName}
            >
              {getInitials(fullName)}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="hidden sm:inline-flex text-sm text-muted hover:text-ink px-2 py-1"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-12">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}

function PaddleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <ellipse cx="10" cy="9" rx="6" ry="7" />
      <path d="M14 14l5 6" />
    </svg>
  )
}
