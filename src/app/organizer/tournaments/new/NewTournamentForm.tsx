"use client"

import { useActionState } from "react"
import { createTournament } from "@/lib/tournaments/actions"
import { type TournamentFormState } from "@/lib/validation"
import { Field, TextareaField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export function NewTournamentForm() {
  const [state, action, pending] = useActionState<TournamentFormState, FormData>(
    createTournament,
    undefined,
  )
  const err = (k: string) => state?.errors?.[k]?.[0]

  return (
    <form action={action} className="space-y-5">
      <Card className="space-y-5">
        <CardEyebrow>Basics</CardEyebrow>
        <Field
          label="Tournament name"
          name="name"
          required
          placeholder="Spring Smash 2026"
          error={err("name")}
        />
        <TextareaField
          label="Description"
          name="description"
          rows={4}
          placeholder="Round robin format, prizes for top 3 in each division."
          error={err("description")}
        />
      </Card>

      <Card className="space-y-5">
        <CardEyebrow>Location</CardEyebrow>
        <Field
          label="Venue"
          name="location_name"
          placeholder="Riverside Pickleball Club"
          error={err("location_name")}
        />
        <Field
          label="Address"
          name="address"
          placeholder="123 Court St"
          error={err("address")}
        />
        <div className="grid sm:grid-cols-[1.5fr_1fr] gap-4">
          <Field
            label="City"
            name="city"
            placeholder="Austin"
            error={err("city")}
          />
          <Field
            label="State"
            name="state"
            placeholder="TX"
            error={err("state")}
          />
        </div>
      </Card>

      <Card className="space-y-5">
        <CardEyebrow>Dates</CardEyebrow>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Start date"
            name="start_date"
            type="date"
            required
            error={err("start_date")}
          />
          <Field
            label="End date"
            name="end_date"
            type="date"
            hint="Optional. Single-day tournament? Leave blank."
            error={err("end_date")}
          />
        </div>
        <Field
          label="Registration deadline"
          name="registration_deadline"
          type="datetime-local"
          hint="Optional. After this, no new sign-ups."
          error={err("registration_deadline")}
        />
      </Card>

      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <LoadingSpinner className="text-current" /> : "Save draft"}
        </Button>
        <p className="text-sm text-muted self-center">
          You can add divisions and publish on the next screen.
        </p>
      </div>
    </form>
  )
}
