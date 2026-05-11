"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { logout } from "@/lib/auth/actions"
import { getInitials, cn } from "@/lib/utils"
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
  const pathname = usePathname()

  return (
    <div className="min-h-full flex flex-col lg:flex-row">
      <aside className="lg:w-72 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-hairline bg-surface-dark text-primary-ink">
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between border-b border-white/10">
            <Link
              href="/home"
              className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
            >
              <span className="grid place-items-center size-8 rounded-full bg-accent text-accent-ink">
                <PaddleMark className="size-4" />
              </span>
              Dinkedin
            </Link>
            <span className="text-[10px] uppercase tracking-[0.16em] text-primary-ink/60 font-semibold">
              {title}
            </span>
          </div>

          <nav aria-label="Dashboard" className="flex-1 p-3 overflow-x-auto lg:overflow-x-visible">
            <ul className="flex lg:flex-col gap-1">
              {links.map((l) => {
                const active =
                  pathname === l.href || pathname.startsWith(l.href + "/")
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        "block whitespace-nowrap px-3.5 py-2.5 text-sm font-semibold rounded-full transition-colors",
                        active
                          ? "bg-accent text-accent-ink"
                          : "text-primary-ink/80 hover:text-primary-ink hover:bg-white/5",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="hidden lg:flex p-3 border-t border-white/10 items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-9 rounded-full bg-accent text-accent-ink flex items-center justify-center text-sm font-semibold shrink-0">
                {getInitials(fullName)}
              </div>
              <span className="text-sm truncate">{fullName}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-primary-ink/70 hover:text-primary-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
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
