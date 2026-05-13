"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

export function RoundTabs({
  rounds,
  activeRound,
  onChange,
  myMatchByRound,
}: {
  rounds: number[]
  activeRound: number | "standings"
  onChange: (round: number | "standings") => void
  /** Set of round numbers where the viewer team has a match */
  myMatchByRound: Set<number>
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollerRef}
      className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none sticky top-16 z-10 bg-bg/80 backdrop-blur py-2"
    >
      <ul className="flex gap-2 min-w-max">
        {rounds.map((r) => {
          const active = activeRound === r
          const myMatch = myMatchByRound.has(r)
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => onChange(r)}
                className={cn(
                  "relative h-9 px-4 rounded-full text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-ink"
                    : "bg-surface text-ink-2 border border-hairline hover:bg-surface-2",
                )}
              >
                Round {r}
                {myMatch && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 size-2 rounded-full",
                      active ? "bg-accent" : "bg-accent",
                    )}
                    aria-label="You have a match in this round"
                  />
                )}
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => onChange("standings")}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-semibold transition-colors",
              activeRound === "standings"
                ? "bg-primary text-primary-ink"
                : "bg-surface text-ink-2 border border-hairline hover:bg-surface-2",
            )}
          >
            Standings
          </button>
        </li>
      </ul>
    </div>
  )
}
