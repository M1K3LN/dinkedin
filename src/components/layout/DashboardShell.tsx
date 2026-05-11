import Link from "next/link"
import type { ReactNode } from "react"
import { logout } from "@/lib/auth/actions"
import { getInitials } from "@/lib/utils"
import type { SessionUser } from "@/lib/dal"

type NavLink = { href: string; label: string }

export function DashboardShell({
  title,
  links,
  user,
  children,
}: {
  title: string
  links: NavLink[]
  user: SessionUser
  children: ReactNode
}) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

  return (
    <div className="min-h-full flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface">
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between border-b border-border">
            <Link href="/home" className="font-bold text-lg tracking-tight">
              Dinkedin
            </Link>
            <span className="text-xs uppercase tracking-wide text-muted font-semibold">
              {title}
            </span>
          </div>
          <nav aria-label="Dashboard" className="flex-1 p-3 overflow-x-auto lg:overflow-x-visible">
            <ul className="flex lg:flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface-muted"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden lg:flex p-3 border-t border-border items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {getInitials(fullName)}
              </div>
              <span className="text-sm truncate">{fullName}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-xs text-muted hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
