import Link from "next/link"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/dal"

export default async function Landing() {
  const user = await getSessionUser()
  if (user) redirect("/home")

  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-primary" />
            Pickleball, leveled up
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Dinkedin
          </h1>
          <p className="text-muted text-base">
            Tournaments, rankings, and rewards — built mobile-first for the
            pickleball community.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-5 hover:opacity-90 transition"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center rounded-xl border border-border font-semibold py-3 px-5 hover:bg-surface-muted transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
