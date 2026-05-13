"use client"

import { useActionState } from "react"
import { updateTournament } from "@/lib/tournaments/actions"
import { type TournamentFormState } from "@/lib/validation"
import { Field, TextareaField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

type Defaults = {
  name: string
  description: string
  location_name: string
  address: string
  city: string
  state: string
  start_date: string
  end_date: string
  registration_deadline: string
}

export function EditTournamentBasics({
  tournamentId,
  defaultValues,
  locked,
}: {
  tournamentId: string
  defaultValues: Defaults
  locked: boolean
}) {
  const boundAction = updateTournament.bind(null, tournamentId)
  const [state, action, pending] = useActionState<TournamentFormState, FormData>(
    boundAction,
    undefined,
  )
  const err = (k: string) => state?.errors?.[k]?.[0]

  return (
    <form action={action} className="space-y-5">
      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <CardEyebrow>Basics</CardEyebrow>
            <CardTitle className="mt-1">Details &amp; location</CardTitle>
          </div>
          {locked && (
            <p className="text-xs text-muted">
              Move back to draft to edit.
            </p>
          )}
        </div>

        <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
          <Field
            label="Tournament name"
            name="name"
            required
            defaultValue={defaultValues.name}
            error={err("name")}
          />
          <TextareaField
            label="Description"
            name="description"
            rows={4}
            defaultValue={defaultValues.description}
            error={err("description")}
          />

          <div className="border-t border-hairline pt-5 space-y-5">
            <CardEyebrow>Location</CardEyebrow>
            <Field
              label="Venue"
              name="location_name"
              defaultValue={defaultValues.location_name}
              error={err("location_name")}
            />
            <Field
              label="Address"
              name="address"
              defaultValue={defaultValues.address}
              error={err("address")}
            />
            <div className="grid sm:grid-cols-[1.5fr_1fr] gap-4">
              <Field
                label="City"
                name="city"
                defaultValue={defaultValues.city}
                error={err("city")}
              />
              <Field
                label="State"
                name="state"
                defaultValue={defaultValues.state}
                error={err("state")}
              />
            </div>
          </div>

          <div className="border-t border-hairline pt-5 space-y-5">
            <CardEyebrow>Dates</CardEyebrow>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Start date"
                name="start_date"
                type="date"
                required
                defaultValue={defaultValues.start_date}
                error={err("start_date")}
              />
              <Field
                label="End date"
                name="end_date"
                type="date"
                defaultValue={defaultValues.end_date}
                error={err("end_date")}
              />
            </div>
            <Field
              label="Registration deadline"
              name="registration_deadline"
              type="datetime-local"
              defaultValue={defaultValues.registration_deadline}
              error={err("registration_deadline")}
            />
          </div>
        </fieldset>

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

        {!locked && (
          <div className="flex gap-3 pt-1">
            <Button type="submit" size="md" disabled={pending}>
              {pending ? <LoadingSpinner className="text-current" /> : "Save changes"}
            </Button>
          </div>
        )}
      </Card>
    </form>
  )
}
