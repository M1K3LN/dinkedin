import Link from "next/link"
import { LoginForm } from "./LoginForm"

export const metadata = { title: "Log in · Dinkedin" }

export default function LoginPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Log in to Dinkedin</h1>
        <p className="text-[15px] text-ink-2">
          Pick up where you left off. Tournaments, rankings, rewards.
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-center text-muted">
        New to Dinkedin?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 underline decoration-accent decoration-2 underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  )
}
