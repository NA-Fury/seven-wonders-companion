// data/conflicts.ts
// Multi-player resolution for Military and Naval conflicts in detailed mode.
// Implements the rules as described, including Diplomacy and Boarding (military)
// and Forgotten Oasis opt-out (naval).

export type Age = 1 | 2 | 3;

export const MILITARY_VICTORY_POINTS: Record<Age, number> = { 1: 1, 2: 3, 3: 5 };
export const MILITARY_DEFEAT_POINTS = -1;

// The naval conflict tokens follow the same value structure as military in most references.
// If house rules differ, adjust here.
// Naval token values: Age I (first +3, second +1, last -1),
// Age II (first +5, second +3, last -2), Age III (first +7, second +5, last -3)
export const NAVAL_FIRST_POINTS: Record<Age, number> = { 1: 3, 2: 5, 3: 7 };
export const NAVAL_SECOND_POINTS: Record<Age, number> = { 1: 1, 2: 3, 3: 5 };
export const NAVAL_DEFEAT_POINTS: Record<Age, number> = { 1: -1, 2: -2, 3: -3 };

export interface MilitaryDetailedInput {
  ageI?: number;   // total military strength at end of Age I
  ageII?: number;  // total military strength at end of Age II
  ageIII?: number; // total military strength at end of Age III
  // Diplomacy (Cities) — if true for an age, player is removed from adjacency-based conflicts
  doveAgeI?: boolean;
  doveAgeII?: boolean;
  doveAgeIII?: boolean;
  // Boarding tokens from Armada red cards
  // Pontoon (Age I) and Pier (Age III) -> Right-of-right opponent; Ballista (Age II) -> Left-of-left opponent
  playedPontoon?: boolean;   // Age I
  playedBallista?: boolean;  // Age II
  playedPier?: boolean;      // Age III
}

export interface NavalDetailedInput {
  ageI?: number;   // total naval strength at end of Age I
  ageII?: number;  // total naval strength at end of Age II
  ageIII?: number; // total naval strength at end of Age III
  // Forgotten Oasis style opt-out (a per-age choice): if true, the player skips naval conflicts that age
  blueDoveI?: boolean;
  blueDoveII?: boolean;
  blueDoveIII?: boolean;
}

export interface ConflictTotals {
  byAge: Record<Age, number>; // points accrued in each age
  total: number;              // sum across ages
}

function getAgeStrength(d: { ageI?: number; ageII?: number; ageIII?: number }, age: Age): number {
  if (age === 1) return d.ageI ?? 0;
  if (age === 2) return d.ageII ?? 0;
  return d.ageIII ?? 0;
}

function hasMilitaryDove(d: MilitaryDetailedInput, age: Age): boolean {
  return age === 1 ? !!d.doveAgeI : age === 2 ? !!d.doveAgeII : !!d.doveAgeIII;
}

function hasNavalSkip(d: NavalDetailedInput, age: Age): boolean {
  return age === 1 ? !!d.blueDoveI : age === 2 ? !!d.blueDoveII : !!d.blueDoveIII;
}

/**
 * Resolve Military conflicts for all players in seating order for a given age.
 * - Removes players with Diplomacy for adjacency, connecting their neighbors.
 * - Adds additional conflict pairs from Boarding tokens (Pontoon/Ballista/Pier), ignoring Diplomacy.
 * - Ensures at most one conflict per pair per Age.
 */
function resolveMilitaryPairsForAge(
  playerOrder: string[],
  detailsByPlayer: Record<string, MilitaryDetailedInput>,
  age: Age
): Array<[string, string]> {
  const activeRing: string[] = playerOrder.filter((pid) => !hasMilitaryDove(detailsByPlayer[pid] || {}, age));

  const addPair = (pairs: Set<string>, a: string, b: string) => {
    if (!a || !b || a === b) return;
    const [x, y] = a < b ? [a, b] : [b, a];
    pairs.add(`${x}|${y}`);
  };

  const pairs = new Set<string>();

  // Adjacency-based conflicts on the active ring
  if (activeRing.length >= 2) {
    for (let i = 0; i < activeRing.length; i++) {
      const a = activeRing[i];
      const b = activeRing[(i + 1) % activeRing.length];
      addPair(pairs, a, b);
    }
  }

  // Boarding token conflicts (ignore diplomacy for this extra conflict)
  // Age I: right-of-right (Pontoon)
  // Age II: left-of-left (Ballista)
  // Age III: right-of-right (Pier)
  const n = playerOrder.length;
  const twoRight = (idx: number) => playerOrder[(idx + 2) % n];
  const twoLeft = (idx: number) => playerOrder[(idx - 2 + n) % n];

  for (let i = 0; i < n; i++) {
    const pid = playerOrder[i];
    const d = detailsByPlayer[pid] || {};
    if (age === 1 && d.playedPontoon) {
      addPair(pairs, pid, twoRight(i));
    }
    if (age === 2 && d.playedBallista) {
      addPair(pairs, pid, twoLeft(i));
    }
    if (age === 3 && d.playedPier) {
      addPair(pairs, pid, twoRight(i));
    }
  }

  // Emit resolved unique pairs
  return Array.from(pairs).map((key) => key.split('|') as [string, string]);
}

export function resolveMilitaryConflictsForAll(
  playerOrder: string[],
  detailsByPlayer: Record<string, MilitaryDetailedInput>
): Record<string, ConflictTotals> {
  const result: Record<string, ConflictTotals> = {};
  for (const pid of playerOrder) {
    result[pid] = { byAge: { 1: 0, 2: 0, 3: 0 }, total: 0 } as ConflictTotals;
  }

  const ages: Age[] = [1, 2, 3];
  for (const age of ages) {
    const pairs = resolveMilitaryPairsForAge(playerOrder, detailsByPlayer, age);
    for (const [a, b] of pairs) {
      const aStr = getAgeStrength(detailsByPlayer[a] || {}, age);
      const bStr = getAgeStrength(detailsByPlayer[b] || {}, age);
      if (aStr === bStr) continue; // no tokens on tie
      if (aStr > bStr) {
        result[a].byAge[age] += MILITARY_VICTORY_POINTS[age];
        result[b].byAge[age] += MILITARY_DEFEAT_POINTS;
      } else {
        result[b].byAge[age] += MILITARY_VICTORY_POINTS[age];
        result[a].byAge[age] += MILITARY_DEFEAT_POINTS;
      }
    }
  }

  // Totals
  for (const pid of playerOrder) {
    const byAge = result[pid].byAge;
    result[pid].total = (byAge[1] ?? 0) + (byAge[2] ?? 0) + (byAge[3] ?? 0);
  }
  return result;
}

export function resolveNavalConflictsForAll(
  playerOrder: string[],
  detailsByPlayer: Record<string, NavalDetailedInput>
): Record<string, ConflictTotals> {
  const result: Record<string, ConflictTotals> = {};
  for (const pid of playerOrder) {
    result[pid] = { byAge: { 1: 0, 2: 0, 3: 0 }, total: 0 } as ConflictTotals;
  }

  const ages: Age[] = [1, 2, 3];
  for (const age of ages) {
    // Build participants list (skip those choosing not to participate this age)
    const participants = playerOrder.filter((pid) => !hasNavalSkip(detailsByPlayer[pid] || {}, age));
    if (participants.length === 0) continue;

    const strengths = participants.map((pid) => ({ pid, s: getAgeStrength(detailsByPlayer[pid] || {}, age) }));
    if (strengths.length === 0) continue;

    const values = strengths.map((x) => x.s);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // If all equal, no one gets tokens
    if (min === max) {
      continue;
    }

    const lastGroup = strengths.filter((x) => x.s === min).map((x) => x.pid);
    // Apply last (defeat) first
    for (const pid of lastGroup) {
      result[pid].byAge[age] += NAVAL_DEFEAT_POINTS[age];
    }

    const firstGroup = strengths.filter((x) => x.s === max).map((x) => x.pid);

    // Determine second-place group only if there's a unique first
    if (firstGroup.length > 1) {
      // Tie for first: each tied player takes one Naval Victory token for the second position
      for (const pid of firstGroup) {
        result[pid].byAge[age] += NAVAL_SECOND_POINTS[age];
      }
      // Players in second position take no tokens in this case (per rules)
    } else {
      // Unique first gets victory token for the age
      result[firstGroup[0]].byAge[age] += NAVAL_FIRST_POINTS[age];

      // Identify second-highest value
      const uniqueSorted = Array.from(new Set(values)).sort((a, b) => b - a);
      if (uniqueSorted.length >= 2) {
        const secondVal = uniqueSorted[1];
        const secondGroup = strengths.filter((x) => x.s === secondVal).map((x) => x.pid);
        // In case of tie for second: concerned players don't take any Naval Conflict tokens
        if (secondGroup.length === 1) {
          // Only one player in second position gets a token
          result[secondGroup[0]].byAge[age] += NAVAL_SECOND_POINTS[age];
        }
      }
    }
  }

  // Totals
  for (const pid of playerOrder) {
    const byAge = result[pid].byAge;
    result[pid].total = (byAge[1] ?? 0) + (byAge[2] ?? 0) + (byAge[3] ?? 0);
  }
  return result;
}
