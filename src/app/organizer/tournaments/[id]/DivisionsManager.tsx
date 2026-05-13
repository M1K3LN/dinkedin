"use client"

import { useState, useTransition } from "react"
import { useActionState } from "react"
import {
  upsertDivision,
  deleteDivision,
} from "@/lib/tournaments/actions"
import {
  type TournamentFormState,
  SKILL_LEVEL_OPTIONS,
  PLAY_TYPE_OPTIONS,
  GENDER_TYPE_OPTIONS,
  PLAY_TYPE_LABELS,
  GENDER_TYPE_LABELS,
} from "@/lib/validation"
import { Field, SelectField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

type Division = {
  id: string
  name: string
  skill_level: number | null
  play_type: (typeof PLAY_TYPE_OPTIONS)[number]
  gender_type: (typeof GENDER_TYPE_OPTIONS)[number]
  max_players: number | null
  entry_fee: number
  play_type_label: string
  gender_type_label: string
}

export function DivisionsManager({
  tournamentId,
  divisions,
  locked,
}: {
  tournamentId: string
  divisions: Division[]
  locked: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(divisions.length === 0)

  return (
    <div className="space-y-3">
      {divisions.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-hairline px-4 py-6 text-center">
          <p className="text-sm text-muted">No divisions yet.</p>
        </div>
      )}

      {divisions.map((d) =>
        editingId === d.id ? (
          <DivisionForm
            key={d.id}
            tournamentId={tournamentId}
            division={d}
            onCancel={() => setEditingId(null)}
            onSaved={() => setEditingId(null)}
          />
        ) : (
          <DivisionRow
            key={d.id}
            division={d}
            tournamentId={tournamentId}
            disabled={locked}
            onEdit={() => setEditingId(d.id)}
          />
        ),
      )}

      {adding && (
        <DivisionForm
          tournamentId={tournamentId}
          onCancel={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      )}

      {!adding && !locked && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            + Add division
          </Button>
        </div>
      )}
    </div>
  )
}

function DivisionRow({
  division,
  tournamentId,
  disabled,
  onEdit,
}: {
  division: Division
  tournamentId: string
  disabled: boolean
  onEdit: () => void
}) {
  const [pending, startTransition] = useTransition()
  const onDelete = () => {
    if (!confirm(`Delete "${division.name}"?`)) return
    startTransition(async () => {
      const res = await deleteDivision(tournamentId, division.id)
      if (!res.ok) alert(res.error ?? "Could not delete division.")
    })
  }
  return (
    <div className="rounded-2xl border border-hairline bg-surface px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{division.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge tone="outline">{division.play_type_label}</Badge>
          <Badge tone="outline">{division.gender_type_label}</Badge>
          {division.skill_level != null && (
            <Badge tone="outline">{division.skill_level.toFixed(1)} skill</Badge>
          )}
          {division.max_players != null && (
            <Badge tone="outline">Cap {division.max_players}</Badge>
          )}
          {division.entry_fee > 0 && (
            <Badge tone="outline">${division.entry_fee.toFixed(0)}</Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={disabled}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          disabled={disabled || pending}
        >
          {pending ? <LoadingSpinner className="text-current" /> : "Delete"}
        </Button>
      </div>
    </div>
  )
}

function DivisionForm({
  tournamentId,
  division,
  onCancel,
  onSaved,
}: {
  tournamentId: string
  division?: Division
  onCancel: () => void
  onSaved: () => void
}) {
  const boundAction = upsertDivision.bind(
    null,
    tournamentId,
    division?.id ?? null,
  )
  const [state, action, pending] = useActionState<
    TournamentFormState,
    FormData
  >(async (prev, formData) => {
    const result = await boundAction(prev, formData)
    if (result?.message && !result?.errors) onSaved()
    return result
  }, undefined)
  const err = (k: string) => state?.errors?.[k]?.[0]

  return (
    <form action={action} className="rounded-2xl bg-surface-2 px-4 py-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
        {division ? "Edit division" : "New division"}
      </p>

      <Field
        label="Name"
        name="name"
        defaultValue={division?.name}
        placeholder="e.g. 4.0 Mixed Doubles"
        required
        error={err("name")}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <SelectField
          label="Play type"
          name="play_type"
          defaultValue={division?.play_type ?? ""}
          placeholder="Pick one"
          required
          options={PLAY_TYPE_OPTIONS.map((v) => ({
            value: v,
            label: PLAY_TYPE_LABELS[v],
          }))}
          error={err("play_type")}
        />
        <SelectField
          label="Gender category"
          name="gender_type"
          defaultValue={division?.gender_type ?? "open"}
          options={GENDER_TYPE_OPTIONS.map((v) => ({
            value: v,
            label: GENDER_TYPE_LABELS[v],
          }))}
          error={err("gender_type")}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <SelectField
          label="Skill level"
          name="skill_level"
          defaultValue={
            division?.skill_level != null
              ? division.skill_level.toFixed(1)
              : ""
          }
          placeholder="Any"
          options={SKILL_LEVEL_OPTIONS.map((v) => ({ value: v, label: v }))}
          error={err("skill_level")}
        />
        <Field
          label="Max players"
          name="max_players"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={division?.max_players ?? ""}
          placeholder="—"
          error={err("max_players")}
        />
        <Field
          label="Entry fee ($)"
          name="entry_fee"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          defaultValue={division?.entry_fee ?? 0}
          error={err("entry_fee")}
        />
      </div>

      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <LoadingSpinner className="text-current" />
          ) : division ? (
            "Save division"
          ) : (
            "Add division"
          )}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
