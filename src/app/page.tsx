import Link from "next/link"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/dal"
import { Button } from "@/components/ui/Button"

export default async function Landing() {
  const user = await getSessionUser()
  if (user) redirect("/home")

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="grid place-items-center size-8 rounded-full bg-primary text-accent">
            <PaddleMark className="size-4" />
          </span>
          Dinkedin
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-ink-2 hover:text-ink px-3 py-2">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center px-6 py-12 lg:py-24">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-ink px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
              <span className="size-1.5 rounded-full bg-accent-ink" />
              The pickleball platform built for players
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              Every dink counts.
              <br />
              <span className="text-primary">Climb the ranks.</span>
            </h1>
            <p className="text-lg text-ink-2 max-w-prose">
              Discover tournaments near you, earn ranking points from every
              match, and turn your reward points into perks you actually want.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/signup">
                <Button size="lg">Create your account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  I already have an account
                </Button>
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted pt-2">
              <li className="flex items-center gap-1.5">
                <Tick /> Free to join
              </li>
              <li className="flex items-center gap-1.5">
                <Tick /> 100 reward points on signup
              </li>
              <li className="flex items-center gap-1.5">
                <Tick /> Mobile-first
              </li>
            </ul>
          </div>

          {/* Right: visual card mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-accent/30 rounded-[40px] blur-3xl" aria-hidden />
            <div className="relative bg-surface-dark text-primary-ink rounded-[32px] p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-accent font-semibold">
                  Player rating
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-ink/70">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  Live
                </span>
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative size-32">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(247,245,238,0.1)" strokeWidth="3" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(74 / 100) * 289.03} 289.03`} />
                  </svg>
                  <div className="absolute inset-2 clip-hex bg-accent text-accent-ink flex flex-col items-center justify-center">
                    <span className="font-display font-bold tabular leading-none text-3xl">4.235</span>
                    <span className="text-[9px] uppercase font-semibold tracking-[0.16em] mt-1 opacity-80">Rating</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Mini label="Wins" value="42" />
                  <Mini label="Win rate" value="68%" />
                  <Mini label="Tournaments" value="11" />
                </div>
              </div>
              <div className="mt-8 rounded-2xl bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                  Up next
                </p>
                <p className="font-display text-lg font-bold">Spring Smash 2026 — 4.0 Mixed</p>
                <p className="text-sm text-primary-ink/70">Sat · Riverside Courts · 11 spots left</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Tick() {
  return (
    <span className="grid place-items-center size-4 rounded-full bg-accent text-accent-ink">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-2.5" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-primary-ink/60 font-semibold">{label}</p>
      <p className="font-display text-2xl font-bold tabular leading-none mt-0.5">{value}</p>
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
