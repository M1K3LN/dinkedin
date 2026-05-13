"use client"

import { useActionState } from "react"
import { updateProfile } from "@/lib/profile/actions"
import {
  type ProfileFormState,
  SKILL_LEVEL_OPTIONS,
  PLAY_TYPE_OPTIONS,
  PLAY_TYPE_LABELS,
} from "@/lib/validation"
import { Field, SelectField, TextareaField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

type Defaults = {
  first_name: string
  last_name: string
  phone: string
  city: string
  state: string
  display_name: string
  skill_level: string
  home_court: string
  preferred_play_type: string
  bio: string
}

export function ProfileEditForm({ defaultValues }: { defaultValues: Defaults }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined,
  )
  const err = (k: keyof Defaults) =>
    (state?.errors as Record<string, string[]> | undefined)?.[k]?.[0]

  return (
    <form action={action} className="space-y-5">
      <Card className="space-y-5">
        <CardEyebrow>Public on Dinkedin</CardEyebrow>

        <Field
          label="Display name"
          name="display_name"
          defaultValue={defaultValues.display_name}
          placeholder="e.g. The Dink King"
          hint="What other players see on the leaderboard and rosters."
          error={err("display_name")}
        />

        <SelectField
          label="Skill level"
          name="skill_level"
          defaultValue={defaultValues.skill_level}
          placeholder="Pick your level"
          options={SKILL_LEVEL_OPTIONS.map((v) => ({ value: v, label: v }))}
          hint="Your DUPR-style rating (2.0–6.0)."
          error={err("skill_level")}
        />

        <SelectField
          label="Preferred play"
          name="preferred_play_type"
          defaultValue={defaultValues.preferred_play_type}
          placeholder="Pick a format"
          options={PLAY_TYPE_OPTIONS.map((v) => ({
            value: v,
            label: PLAY_TYPE_LABELS[v],
          }))}
          error={err("preferred_play_type")}
        />

        <Field
          label="Home court"
          name="home_court"
          defaultValue={defaultValues.home_court}
          placeholder="e.g. Riverside Pickleball Club"
          error={err("home_court")}
        />

        <TextareaField
          label="Bio"
          name="bio"
          defaultValue={defaultValues.bio}
          rows={4}
          placeholder="A few words about your game…"
          error={err("bio")}
        />
      </Card>

      <Card className="space-y-5">
        <CardEyebrow>Personal — only visible to you</CardEyebrow>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="First name"
            name="first_name"
            defaultValue={defaultValues.first_name}
            placeholder="Jane"
            error={err("first_name")}
          />
          <Field
            label="Last name"
            name="last_name"
            defaultValue={defaultValues.last_name}
            placeholder="Doe"
            error={err("last_name")}
          />
        </div>

        <Field
          label="Phone"
          name="phone"
          defaultValue={defaultValues.phone}
          placeholder="(555) 123-4567"
          type="tel"
          error={err("phone")}
        />

        <div className="grid sm:grid-cols-[1.5fr_1fr] gap-4">
          <Field
            label="City"
            name="city"
            defaultValue={defaultValues.city}
            placeholder="Austin"
            error={err("city")}
          />
          <Field
            label="State"
            name="state"
            defaultValue={defaultValues.state}
            placeholder="TX"
            error={err("state")}
          />
        </div>
      </Card>

      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <LoadingSpinner className="text-current" /> : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
