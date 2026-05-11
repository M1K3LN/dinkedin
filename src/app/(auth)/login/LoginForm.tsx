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
        required
        error={state?.errors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state?.errors?.password?.[0]}
      />

      {state?.errors?.form && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
          {state.errors.form[0]}
        </p>
      )}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? <LoadingSpinner className="text-current" /> : "Log in"}
      </Button>
    </form>
  )
}
