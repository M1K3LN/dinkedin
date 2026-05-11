"use client"

import { useActionState } from "react"
import { login } from "@/lib/auth/actions"
import type { FormState } from "@/lib/validation"
import { Field } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    login,
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
        autoComplete="current-password"
        placeholder="••••••••"
        required
        error={state?.errors?.password?.[0]}
      />

      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? <LoadingSpinner className="text-current" /> : "Log in"}
      </Button>
    </form>
  )
}
