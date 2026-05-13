"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { CopyButton } from "./CopyButton"

type Code = {
  id: string
  code: string
  status: string
  valueLabel: string
  pointsUsed: number
  expiresAt: string | null
  createdAt: string
  mocked: boolean
}

const STATUS_TONE: Record<
  string,
  "neutral" | "accent" | "primary" | "warn" | "gold" | "outline"
> = {
  pending: "neutral",
  active: "accent",
  used: "primary",
  expired: "warn",
  revoked: "warn",
}

export function CodesList({ codes }: { codes: Code[] }) {
  return (
    <Card className="p-0 overflow-hidden">
      <ul>
        {codes.map((c, i) => {
          const expired =
            c.expiresAt != null && new Date(c.expiresAt) < new Date()
          const isUsable = c.status === "active" && !expired
          return (
            <li
              key={c.id}
              className={`px-5 py-4 ${i < codes.length - 1 ? "border-b border-hairline" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>
                      {expired ? "expired" : c.status}
                    </Badge>
                    {c.mocked && <Badge tone="outline">practice</Badge>}
                    <span className="text-sm text-muted">
                      {c.valueLabel} ·{" "}
                      <span className="text-ink-2">{c.pointsUsed} pts</span>
                    </span>
                  </div>
                  <p className="font-display text-xl font-bold tabular tracking-[0.06em] mt-1.5">
                    {c.code}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Created{" "}
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {c.expiresAt && (
                      <>
                        {" "}
                        · {expired ? "Expired" : "Expires"}{" "}
                        {new Date(c.expiresAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                </div>
                <div className="shrink-0">
                  <CopyButton value={c.code} disabled={!isUsable} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
