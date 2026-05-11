import Link from "next/link"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 grid lg:grid-cols-[1.1fr_1fr] min-h-screen">
      {/* Left: dark court-green hero (visual only on lg+) */}
      <aside className="relative hidden lg:flex bg-surface-dark text-primary-ink p-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 23px, rgba(247,245,238,0.4) 24px, transparent 25px), linear-gradient(45deg, transparent 23px, rgba(247,245,238,0.4) 24px, transparent 25px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-32 size-[28rem] rounded-full bg-accent/15 blur-3xl"
        />

        <div className="relative flex flex-col h-full justify-between w-full">
          <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold">
            <span className="grid place-items-center size-9 rounded-full bg-accent text-accent-ink">
              <PaddleMark className="size-5" />
            </span>
            Dinkedin
          </Link>

          <div className="space-y-6 max-w-md">
            <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">
              Pickleball · leveled up
            </p>
            <h2 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
              The community where every dink counts.
            </h2>
            <p className="text-primary-ink/70 text-lg">
              Find tournaments, climb the rankings, and earn rewards. Built for
              players, not spreadsheets.
            </p>
          </div>

          <p className="text-xs text-primary-ink/50">
            © {new Date().getFullYear()} Dinkedin
          </p>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex flex-col">
        <header className="lg:hidden px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span className="grid place-items-center size-8 rounded-full bg-primary text-accent">
              <PaddleMark className="size-4" />
            </span>
            Dinkedin
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
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
