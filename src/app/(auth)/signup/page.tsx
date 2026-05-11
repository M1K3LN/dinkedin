import Link from "next/link"
import { SignupForm } from "./SignupForm"

export const metadata = { title: "Sign up · Dinkedin" }

export default function SignupPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold">
          Get started — free
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Join Dinkedin</h1>
        <p className="text-[15px] text-ink-2">
          Create an account to enter tournaments, climb rankings, and earn rewards.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-center text-muted">
        Already on Dinkedin?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 underline decoration-accent decoration-2 underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  )
}
