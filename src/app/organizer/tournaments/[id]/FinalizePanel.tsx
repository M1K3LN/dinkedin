"use client"

import { useState, useTransition } from "react"
import { finalizeTournament } from "@/lib/tournaments/matches"
import { SelectField } from "@/components/ui/Field"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

type Team = {
  registrationId: string
  player_ids: string[]
  label: string
}

type Division = {
  id: string
  name: string
  play_type: string
  play_type_label: string
  teams: Team[]
}

type Picks = Record<
  string, // divisionId
  { first?: string; second?: string; third?: string } // registrationIds
>

export function FinalizePanel({
  tournamentId,
  divisions,
  locked,
}: {
  tournamentId: string
  divisions: Division[]
  locked: boolean
}) {
  const [picks, setPicks] = useState<Picks>({})
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const setPick = (
    divisionId: string,
    place: "first" | "second" | "third",
    regId: string,
  ) => {
    setPicks((prev) => ({
      ...prev,
      [divisionId]: { ...prev[divisionId], [place]: regId || undefined },
    }))
  }

  const onSubmit = () => {
    setError(null)
    // Build payload: registrationId → player_ids[]
    const placements = divisions
      .map((d) => {
        const p = picks[d.id] ?? {}
        const resolve = (regId?: string) => {
          if (!regId) return []
          return d.teams.find((t) => t.registrationId === regId)?.player_ids ?? []
        }
        return {
          divisionId: d.id,
          first: resolve(p.first),
          second: resolve(p.second),
          third: resolve(p.third),
        }
      })
      .filter(
        (d) =>
          d.first.length > 0 || d.second.length > 0 || d.third.length > 0,
      )

    if (placements.length === 0) {
      setError("Pick at least one placement before finalizing.")
      return
    }

    if (
      !confirm(
        "Finalize this tournament? Placement points are awarded immediately and the tournament will be marked completed.",
      )
    )
      return

    startTransition(async () => {
      const res = await finalizeTournament(tournamentId, placements)
      if (!res.ok) setError(res.error ?? "Could not finalize.")
    })
  }

  if (locked) {
    return (
      <p className="text-sm text-muted">
        Finalization is locked while the tournament is canceled or already
        completed.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {divisions.map((d) => {
        const usedRegIds = new Set(
          Object.values(picks[d.id] ?? {}).filter(Boolean) as string[],
        )
        const availableFor = (current?: string) =>
          d.teams.filter((t) => !usedRegIds.has(t.registrationId) || t.registrationId === current)

        const noTeams = d.teams.length === 0
        return (
          <div
            key={d.id}
            className="rounded-2xl border border-hairline bg-surface-2 p-4 space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-semibold">{d.name}</p>
              <Badge tone="outline">{d.play_type_label}</Badge>
            </div>
            {noTeams ? (
              <p className="text-sm text-muted">No registrations in this division.</p>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                <PlacementPick
                  label="🥇 1st"
                  options={availableFor(picks[d.id]?.first)}
                  value={picks[d.id]?.first ?? ""}
                  onChange={(v) => setPick(d.id, "first", v)}
                />
                <PlacementPick
                  label="🥈 2nd"
                  options={availableFor(picks[d.id]?.second)}
                  value={picks[d.id]?.second ?? ""}
                  onChange={(v) => setPick(d.id, "second", v)}
                />
                <PlacementPick
                  label="🥉 3rd"
                  options={availableFor(picks[d.id]?.third)}
                  value={picks[d.id]?.third ?? ""}
                  onChange={(v) => setPick(d.id, "third", v)}
                />
              </div>
            )}
          </div>
        )
      })}

      {error && (
        <p className="text-sm text-warn bg-warn/10 rounded-2xl px-3.5 py-2.5 font-medium">
          {error}
        </p>
      )}

      <Button onClick={onSubmit} disabled={pending}>
        {pending ? (
          <LoadingSpinner className="text-current" />
        ) : (
          "Finalize tournament"
        )}
      </Button>
    </div>
  )
}

function PlacementPick({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Team[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <SelectField
      label={label}
      name="placement"
      placeholder="No placement"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      options={[
        { value: "", label: "— No placement —" },
        ...options.map((t) => ({ value: t.registrationId, label: t.label })),
      ]}
    />
  )
}
