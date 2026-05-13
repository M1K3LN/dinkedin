"use client"

import { useActionState, useState } from "react"
import { registerForDivision } from "@/lib/tournaments/register"
import {
  type RegistrationFormState,
  type PLAY_TYPE_OPTIONS,
} from "@/lib/validation"
import { Field } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

type PlayType = (typeof PLAY_TYPE_OPTIONS)[number]

type Division = {
  id: string
  name: string
  skill_level: number | null
  play_type: PlayType
  gender_type: string
  max_players: number | null
  entry_fee: number
  play_type_label: string
  gender_type_label: string
  filled: number
}

export function DivisionRegisterCard({
  division,
  youAreIn,
  registrationOpen,
}: {
  division: Division
  youAreIn: boolean
  registrationOpen: boolean
}) {
  const [open, setOpen] = useState(false)
  const isDoubles =
    division.play_type === "doubles" || division.play_type === "mixed_doubles"
  const isFull =
    division.max_players != null && division.filled >= division.max_players

  const [state, action, pending] = useActionState<
    RegistrationFormState,
    FormData
  >(registerForDivision, undefined)
  const success = !!state?.message && !state?.errors

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold truncate">
            {division.name}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge tone="outline">{division.play_type_label}</Badge>
            <Badge tone="outline">{division.gender_type_label}</Badge>
            {division.skill_level != null && (
              <Badge tone="outline">
                {division.skill_level.toFixed(1)} skill
              </Badge>
            )}
            {division.entry_fee > 0 && (
              <Badge tone="outline">${division.entry_fee.toFixed(0)}</Badge>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {division.max_players != null ? (
            <p className="text-sm tabular">
              <span className="font-display text-2xl font-bold">
                {division.filled}
              </span>
              <span className="text-muted">/{division.max_players}</span>
            </p>
          ) : (
            <p className="text-sm tabular">
              <span className="font-display text-2xl font-bold">
                {division.filled}
              </span>
              <span className="text-muted"> in</span>
            </p>
          )}
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
            registered
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {youAreIn ? (
          <Badge tone="accent">You&apos;re registered</Badge>
        ) : success ? (
          <Badge tone="accent">{state?.message}</Badge>
        ) : !registrationOpen ? (
          <Badge tone="warn">Registration closed</Badge>
        ) : isFull ? (
          <Badge tone="warn">Full</Badge>
        ) : (
          <span className="text-xs text-muted">
            +5 ranking & +50 reward points on register
          </span>
        )}

        {!youAreIn && !success && registrationOpen && !isFull && (
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Cancel" : "Register"}
          </Button>
        )}
      </div>

      {open && !youAreIn && !success && (
        <form action={action} className="space-y-3 pt-2 border-t border-hairline">
          <input type="hidden" name="division_id" value={division.id} />

          {isDoubles && (
            <Field
              label="Partner email"
              name="partner_email"
              type="email"
              required
              placeholder="partner@example.com"
              hint="They need a Dinkedin account. Both of you earn the registration points."
              error={state?.errors?.partner_email?.[0]}
            />
          )}

          {state?.errors?.form && (
            <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
              {state.errors.form[0]}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? (
                <LoadingSpinner className="text-current" />
              ) : (
                "Confirm registration"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
