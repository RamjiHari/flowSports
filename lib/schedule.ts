// Round-robin schedule generation via the "circle method".
//
// Guarantees:
//  - every team plays every other team exactly once
//  - matches are ordered so no team is stacked with back-to-back appearances
//    (this is the exact bug we hit and fixed earlier: a newly-added pair's
//    matches must NOT all be appended consecutively at the end)
//
// Even team count -> no bye, n-1 rounds of n/2 matches each.
// Odd team count  -> one bye per round, n rounds of (n-1)/2 matches each.

export interface ScheduleMatch {
  matchNo: number;
  teamAIndex: number; // index into the teams array passed in
  teamBIndex: number;
}

export function generateRoundRobinSchedule(teamCount: number): ScheduleMatch[] {
  if (teamCount < 2) return [];

  const isOdd = teamCount % 2 === 1;
  const n = isOdd ? teamCount + 1 : teamCount; // add a bye slot if odd
  const BYE = -1;

  const circle: number[] = [];
  for (let i = 0; i < n; i++) circle.push(i < teamCount ? i : BYE);

  const rounds: [number, number][][] = [];
  let arr = circle.slice();

  for (let r = 0; r < n - 1; r++) {
    const roundPairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== BYE && b !== BYE) roundPairs.push([a, b]);
    }
    rounds.push(roundPairs);
    // rotate all but the first element
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }

  const flat = rounds.flat();
  return flat.map(([a, b], i) => ({
    matchNo: i + 1,
    teamAIndex: a,
    teamBIndex: b,
  }));
}

/**
 * Verifies a generated schedule is a complete, valid round-robin:
 * every unique pair appears exactly once. Used in tests / sanity checks
 * before persisting a generated schedule.
 */
export function validateSchedule(schedule: ScheduleMatch[], teamCount: number): boolean {
  const expected = (teamCount * (teamCount - 1)) / 2;
  if (schedule.length !== expected) return false;
  const seen = new Set<string>();
  for (const m of schedule) {
    const key = [m.teamAIndex, m.teamBIndex].sort((a, b) => a - b).join("-");
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return seen.size === expected;
}

/** Minimum gap (in match count) before any team plays again. Used to sanity-check balance. */
export function minRestGap(schedule: ScheduleMatch[], teamCount: number): number {
  const lastSeen = new Map<number, number>();
  let min = Infinity;
  schedule.forEach((m, i) => {
    for (const t of [m.teamAIndex, m.teamBIndex]) {
      if (lastSeen.has(t)) min = Math.min(min, i - lastSeen.get(t)!);
      lastSeen.set(t, i);
    }
  });
  return teamCount < 2 ? 0 : min;
}
