"use client"

import { useActionState, useState, useTransition } from "react"
import {
  createMatch,
  deleteMatch,
  scoreMatch,
} from "@/lib/tournaments/matches"
import { type MatchFormState } from "@/lib/validation"
import { Field, SelectField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { cn } from "@/lib/utils"

type Registration = { id: string; label: string }
type Match = {
  id: string
  round_name: string | null
  status: string
  score: string | null
  winner_team: "team_1" | "team_2" | null
  team_1_label: string
  team_2_label: string
}

export function MatchesPanel({
  tournamentId,
  division,
  locked,
  registrations,
  matches,
}: {
  tournamentId: string
  division: {
    id: string
    name: string
    play_type: string
    play_type_label: string
  }
  locked: boolean
  registrations: Registration[]
  matches: Match[]
}) {
  const [adding, setAdding] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const completedCount = matches.filter((m) => m.status === "completed").length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">{division.name}</p>
          <Badge tone="outline">{division.play_type_label}</Badge>
        </div>
        <p className="text-xs text-muted tabular">
          {completedCount}/{matches.length} done
        </p>
      </div>

      {matches.length === 0 && !adding && (
        <p className="text-sm text-muted">No matches yet.</p>
      )}

      <ul className="space-y-2">
        {matches.map((m) =>
          scoringId === m.id ? (
            <ScoreForm
              key={m.id}
              match={m}
              onCancel={() => setScoringId(null)}
              onSaved={() => setScoringId(null)}
            />
          ) : (
            <MatchRow
              key={m.id}
              match={m}
              tournamentId={tournamentId}
              locked={locked}
              onScore={() => setScoringId(m.id)}
            />
          ),
        )}
      </ul>

      {adding && (
        <AddMatchForm
          tournamentId={tournamentId}
          divisionId={division.id}
          registrations={registrations}
          onCancel={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      )}

      {!adding && !locked && registrations.length >= 2 && (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          + Add match
        </Button>
      )}
      {registrations.length < 2 && !locked && (
        <p className="text-xs text-muted">
          Need at least two teams registered in this division to add a match.
        </p>
      )}
    </div>
  )
}

function MatchRow({
  match,
  tournamentId,
  locked,
  onScore,
}: {
  match: Match
  tournamentId: string
  locked: boolean
  onScore: () => void
}) {
  const [pending, startTransition] = useTransition()
  const isComplete = match.status === "completed"

  const winnerLabel = !match.winner_team
    ? null
    : match.winner_team === "team_1"
      ? match.team_1_label
      : match.team_2_label

  const onDelete = () => {
    if (!confirm("Delete this scheduled match?")) return
    startTransition(async () => {
      const res = await deleteMatch(match.id)
      if (!res.ok) alert(res.error ?? "Could not delete match.")
    })
  }

  return (
    <li className="rounded-2xl border border-hairline bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {match.round_name && (
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
              {match.round_name}
            </p>
          )}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-1">
            <p
              className={cn(
                "truncate text-sm",
                match.winner_team === "team_1" && "font-bold text-primary",
              )}
            >
              {match.team_1_label}
            </p>
            <span className="text-xs text-muted font-bold tabular">vs</span>
            <p
              className={cn(
                "truncate text-sm text-right",
                match.winner_team === "team_2" && "font-bold text-primary",
              )}
            >
              {match.team_2_label}
            </p>
          </div>
          {isComplete && match.score && (
            <p className="text-xs text-muted tabular mt-1.5">
              {match.score}
              {winnerLabel && (
                <> · <span className="font-semibold text-primary">{winnerLabel}</span> won</>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {isComplete ? (
            <Badge tone="primary">Final</Badge>
          ) : (
            <Badge tone="outline">Scheduled</Badge>
          )}
        </div>
      </div>

      {!locked && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-hairline">
          <Button
            size="sm"
            variant={isComplete ? "ghost" : "primary"}
            onClick={onScore}
          >
            {isComplete ? "Edit score" : "Enter score"}
          </Button>
          {!isComplete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={pending}
              className="text-warn hover:bg-warn/10"
            >
              {pending ? <LoadingSpinner className="text-current" /> : "Delete"}
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

function AddMatchForm({
  tournamentId,
  divisionId,
  registrations,
  onCancel,
  onSaved,
}: {
  tournamentId: string
  divisionId: string
  registrations: Registration[]
  onCancel: () => void
  onSaved: () => void
}) {
  const bound = createMatch.bind(null, tournamentId, divisionId)
  const [state, action, pending] = useActionState<MatchFormState, FormData>(
    async (prev, formData) => {
      const result = await bound(prev, formData)
      if (result?.message && !result.errors) onSaved()
      return result
    },
    undefined,
  )
  const err = (k: string) => state?.errors?.[k]?.[0]

  return (
    <form action={action} className="rounded-2xl bg-surface-2 p-4 space-y-3">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
        New match
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <SelectField
          label="Team 1"
          name="team_1_registration_id"
          placeholder="Pick a team"
          required
          options={registrations.map((r) => ({ value: r.id, label: r.label }))}
          error={err("team_1_registration_id")}
        />
        <SelectField
          label="Team 2"
          name="team_2_registration_id"
          placeholder="Pick a team"
          required
          options={registrations.map((r) => ({ value: r.id, label: r.label }))}
          error={err("team_2_registration_id")}
        />
      </div>
      <Field
        label="Round"
        name="round_name"
        placeholder="Optional, e.g. Pool A, Semifinal"
        error={err("round_name")}
      />
      {state?.errors?.form && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {state.errors.form[0]}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <LoadingSpinner className="text-current" /> : "Add match"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ScoreForm({
  match,
  onCancel,
  onSaved,
}: {
  match: Match
  onCancel: () => void
  onSaved: () => void
}) {
  const bound = scoreMatch.bind(null, match.id)
  const [state, action, pending] = useActionState<MatchFormState, FormData>(
    async (prev, formData) => {
      const result = await bound(prev, formData)
      if (result?.message && !result.errors) onSaved()
      return result
    },
    undefined,
  )
  const err = (k: string) => state?.errors?.[k]?.[0]

  return (
    <li className="rounded-2xl bg-surface-2 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
          Enter score
        </p>
        <p className="text-xs text-muted truncate max-w-[60%] text-right">
          {match.team_1_label} vs {match.team_2_label}
        </p>
      </div>

      <form action={action} className="space-y-3">
        <Field
          label="Score"
          name="score"
          required
          defaultValue={match.score ?? ""}
          placeholder="11-7, 8-11, 11-3"
          error={err("score")}
        />

        <fieldset>
          <legend className="text-sm font-medium text-ink-2 mb-2">
            Who won?
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <WinnerRadio
              name="winner_team"
              value="team_1"
              label={match.team_1_label}
              defaultChecked={match.winner_team === "team_1"}
            />
            <WinnerRadio
              name="winner_team"
              value="team_2"
              label={match.team_2_label}
              defaultChecked={match.winner_team === "team_2"}
            />
          </div>
          {err("winner_team") && (
            <p className="text-xs text-warn font-medium mt-1.5">
              {err("winner_team")}
            </p>
          )}
        </fieldset>

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
              "Save score"
            )}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </li>
  )
}

function WinnerRadio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string
  value: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="cursor-pointer rounded-2xl border border-hairline bg-surface px-3 py-2.5 text-sm font-semibold text-ink-2 has-[:checked]:bg-accent has-[:checked]:text-accent-ink has-[:checked]:border-accent transition-colors flex items-center gap-2">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-primary"
      />
      <span className="truncate">{label}</span>
    </label>
  )
}
