import Link from "next/link"
import { SignupForm } from "./SignupForm"

export const metadata = { title: "Sign up · Dinkedin" }

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Join Dinkedin</h1>
        <p className="text-sm text-muted">
          Create an account to enter tournaments, climb rankings, and earn rewards.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-center text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
