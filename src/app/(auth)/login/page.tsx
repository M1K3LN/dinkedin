import Link from "next/link"
import { LoginForm } from "./LoginForm"

export const metadata = { title: "Log in · Dinkedin" }

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted">Log in to continue to Dinkedin.</p>
      </div>
      <LoginForm />
      <p className="text-sm text-center text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
