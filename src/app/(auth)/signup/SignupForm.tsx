"use client"

import { useActionState } from "react"
import { signup } from "@/lib/auth/actions"
import type { FormState } from "@/lib/validation"
import { Field } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signup,
    undefined,
  )

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state?.errors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        hint="At least 8 characters."
        error={state?.errors?.password?.[0]}
      />

      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}

      {state?.message && (
        <p className="text-sm text-primary bg-accent/30 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.message}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? <LoadingSpinner className="text-current" /> : "Create my account"}
      </Button>

      <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3.5 py-2.5">
        <span className="grid place-items-center size-6 rounded-full bg-accent text-accent-ink shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
            <path d="M12 2v20M2 12h20" />
          </svg>
        </span>
        <p className="text-xs text-ink-2">
          We&apos;ll drop <span className="font-semibold text-ink">100 reward points</span> in your account to start.
        </p>
      </div>
    </form>
  )
}
