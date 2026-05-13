"use client"

import { useTransition } from "react"
import {
  cancelTournament,
  publishTournament,
  unpublishTournament,
} from "@/lib/tournaments/actions"
import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export function PublishCard({
  tournamentId,
  status,
  divisionsCount,
}: {
  tournamentId: string
  status: string
  divisionsCount: number
}) {
  const [pending, startTransition] = useTransition()

  const handle = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) alert(res.error ?? "Something went wrong.")
    })

  if (status === "canceled") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handle(() => unpublishTournament(tournamentId))}
        disabled={pending}
      >
        {pending ? <LoadingSpinner className="text-current" /> : "Restore as draft"}
      </Button>
    )
  }

  if (status === "draft") {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          size="sm"
          onClick={() => handle(() => publishTournament(tournamentId))}
          disabled={pending || divisionsCount === 0}
        >
          {pending ? <LoadingSpinner className="text-current" /> : "Publish"}
        </Button>
        {divisionsCount === 0 && (
          <span className="text-xs text-primary-ink/70">
            Add a division to publish
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {status === "published" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handle(() => unpublishTournament(tournamentId))}
          disabled={pending}
        >
          Move to draft
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          if (!confirm("Cancel this tournament? Players will see it as canceled.")) return
          handle(() => cancelTournament(tournamentId))
        }}
        disabled={pending}
        className="text-warn hover:bg-warn/10"
      >
        Cancel
      </Button>
    </div>
  )
}
