/**
 * Round-robin pairing generator.
 *
 * Uses the circle method: fix the first team and rotate the rest. Handles
 * odd team counts with a virtual bye that gets dropped from output so the
 * caller can render N(N-1)/2 matches across (N-1) rounds for even N, or N
 * rounds with one bye per team for odd N.
 *
 * Pure function — no DB calls. The server action in
 * `src/lib/tournaments/matches.ts` consumes its output and writes
 * the rows.
 */

export type Pairing = {
  round: number
  team1Id: string
  team2Id: string
}

const BYE = "__BYE__"

export function generateRoundRobinPairings(teamIds: string[]): Pairing[] {
  if (teamIds.length < 2) return []

  const teams = [...teamIds]
  if (teams.length % 2 !== 0) teams.push(BYE)

  const n = teams.length
  const rounds = n - 1
  const half = n / 2
  const pairings: Pairing[] = []

  // Working array: index 0 stays fixed, indices 1..n-1 rotate each round.
  let arr = [...teams]
  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      if (a === BYE || b === BYE) continue
      pairings.push({ round: r, team1Id: a, team2Id: b })
    }
    // Rotate everything except the first slot clockwise by one.
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)]
  }
  return pairings
}

/**
 * Assign scheduled times + courts to a list of pairings.
 * Matches in the same round are placed across the available courts in
 * parallel; when a round needs more courts than are available, the
 * overflow matches are pushed to the next time slot.
 */
export function scheduleMatches(input: {
  pairings: Pairing[]
  /** Number of physical courts available */
  courts: number
  /** ISO start time of the first match */
  startTime: string
  /** Minutes between time slots */
  intervalMinutes: number
}): Array<Pairing & { courtNumber: number; scheduledTime: string }> {
  const { pairings, courts, startTime, intervalMinutes } = input
  if (pairings.length === 0) return []
  const start = new Date(startTime).getTime()
  const slotMs = intervalMinutes * 60 * 1000
  const courtsAvail = Math.max(1, courts)

  const byRound = new Map<number, Pairing[]>()
  for (const p of pairings) {
    if (!byRound.has(p.round)) byRound.set(p.round, [])
    byRound.get(p.round)!.push(p)
  }

  const out: Array<Pairing & { courtNumber: number; scheduledTime: string }> = []
  let slotIdx = 0
  for (const round of Array.from(byRound.keys()).sort((a, b) => a - b)) {
    const matches = byRound.get(round)!
    for (let i = 0; i < matches.length; i++) {
      const courtNumber = (i % courtsAvail) + 1
      const offsetSlots = Math.floor(i / courtsAvail)
      const scheduledTime = new Date(
        start + (slotIdx + offsetSlots) * slotMs,
      ).toISOString()
      out.push({ ...matches[i], courtNumber, scheduledTime })
    }
    slotIdx += Math.ceil(matches.length / courtsAvail)
  }
  return out
}
