// data/leadersResolver.ts
// Computes indirect VP from Leaders that score based on city composition or neighbors.

export type PlayerId = string;

export interface LeadersBreakdownItem {
  name: string;
  vp: number;
  missing?: string[];
}

export interface LeadersTotals {
  totalIndirect: number; // only indirect VP (exclude immediate VP handled elsewhere)
  breakdown: LeadersBreakdownItem[];
}

export interface PlayerCitySnapshot {
  // own counts
  brown?: number;
  grey?: number;
  blue?: number;
  yellow?: number;
  red?: number;
  green?: number;
  purple?: number;
  black?: number;
  coins?: number;
  // Science symbols for Aristotle
  compasses?: number;
  tablets?: number;
  gears?: number;
  mvTokensAge1?: number;
  mvTokensAge2?: number;
  mvTokensAge3?: number;
  wonderStagesBuilt?: number;
  // UI confirmations
  agrippinaOnly?: boolean;
  selectedLeaders?: string[]; // names
}

export interface LeadersResolverInput {
  order: PlayerId[];
  getSnapshot: (pid: PlayerId) => PlayerCitySnapshot;
}

const norm = (s: string) => s.trim().toLowerCase();

export function computeLeadersForAll(input: LeadersResolverInput): Record<PlayerId, LeadersTotals> {
  const { order, getSnapshot } = input;
  const n = order.length;
  const result: Record<PlayerId, LeadersTotals> = {};

  const leftIdx = (i: number) => (i - 1 + n) % n;
  const rightIdx = (i: number) => (i + 1) % n;

  for (let i = 0; i < n; i++) {
    const pid = order[i];
    const me = getSnapshot(pid) || {};
    const left = getSnapshot(order[leftIdx(i)]) || {};
    const right = getSnapshot(order[rightIdx(i)]) || {};
    const selected = (me.selectedLeaders || []).map(norm);
    let total = 0;
    const breakdown: LeadersBreakdownItem[] = [];

    const has = (name: string) => selected.includes(norm(name));

    // Per-color leaders
    if (has('Phidias')) {
      const vp = (me.brown || 0) * 1;
      breakdown.push({ name: 'Phidias', vp });
      total += vp;
    }
    if (has('Praxiteles')) {
      const vp = (me.grey || 0) * 2;
      breakdown.push({ name: 'Praxiteles', vp });
      total += vp;
    }
    if (has('Nebuchadnezzar')) {
      const vp = (me.blue || 0) * 1;
      breakdown.push({ name: 'Nebuchadnezzar', vp });
      total += vp;
    }
    if (has('Varro')) {
      const vp = (me.yellow || 0) * 1;
      breakdown.push({ name: 'Varro', vp });
      total += vp;
    }
    if (has('Pericles')) {
      const vp = (me.red || 0) * 2;
      breakdown.push({ name: 'Pericles', vp });
      total += vp;
    }
    if (has('Hypatia')) {
      const vp = (me.green || 0) * 1;
      breakdown.push({ name: 'Hypatia', vp });
      total += vp;
    }
    if (has('Hiram')) {
      const vp = (me.purple || 0) * 2;
      breakdown.push({ name: 'Hiram', vp });
      total += vp;
    }
    if (has('Darius')) {
      const vp = (me.black || 0) * 1;
      breakdown.push({ name: 'Darius', vp });
      total += vp;
    }

    // Gorgo: for each pair of identical MV tokens, gain VP equal to token value (1/3/5)
    if (has('Gorgo')) {
      const a1 = Math.floor((me.mvTokensAge1 || 0) / 2) * 1;
      const a2 = Math.floor((me.mvTokensAge2 || 0) / 2) * 3;
      const a3 = Math.floor((me.mvTokensAge3 || 0) / 2) * 5;
      const vp = a1 + a2 + a3;
      breakdown.push({ name: 'Gorgo', vp });
      total += vp;
    }

    // Conditional +5 if you have more of a color than each neighbor
    const moreThanNeighbors = (val: number | undefined, l: number | undefined, r: number | undefined) =>
      (val || 0) > (l || 0) && (val || 0) > (r || 0);

    if (has('Cornelia')) {
      const ok = moreThanNeighbors(me.yellow, left.yellow, right.yellow);
      const vp = ok ? 5 : 0;
      breakdown.push({ name: 'Cornelia', vp });
      total += vp;
    }
    if (has('Phryne')) {
      const ok = moreThanNeighbors(me.blue, left.blue, right.blue);
      const vp = ok ? 5 : 0;
      breakdown.push({ name: 'Phryne', vp });
      total += vp;
    }
    if (has('Euryptyle')) {
      const ok = moreThanNeighbors(me.red, left.red, right.red);
      const vp = ok ? 5 : 0;
      breakdown.push({ name: 'Euryptyle', vp });
      total += vp;
    }
    if (has('Theano')) {
      const ok = moreThanNeighbors(me.green, left.green, right.green);
      const vp = ok ? 5 : 0;
      breakdown.push({ name: 'Theano', vp });
      total += vp;
    }
    if (has('Makeda')) {
      const ok = moreThanNeighbors(me.coins, left.coins, right.coins);
      const vp = ok ? 5 : 0;
      breakdown.push({ name: 'Makeda', vp });
      total += vp;
    }

    // Set-collection leaders
    if (has('Justinian')) {
      const sets = Math.min(
        me.blue || 0,
        me.red || 0,
        me.green || 0,
      );
      const vp = Math.max(0, sets) * 3;
      breakdown.push({ name: 'Justinian', vp });
      total += vp;
    }
    if (has('Plato')) {
      const sets = Math.min(
        me.brown || 0,
        me.grey || 0,
        me.blue || 0,
        me.yellow || 0,
        me.red || 0,
        me.green || 0,
        me.purple || 0,
      );
      const vp = Math.max(0, sets) * 7;
      breakdown.push({ name: 'Plato', vp });
      total += vp;
    }
    if (has('Aristotle')) {
      const sets = Math.min(
        me.compasses || 0,
        me.tablets || 0,
        me.gears || 0,
      );
      const vp = Math.max(0, sets) * 3;
      breakdown.push({ name: 'Aristotle', vp });
      total += vp;
    }

    // Coins / Wonder / MV token based
    if (has('Midas')) {
      const vp = Math.floor((me.coins || 0) / 3);
      breakdown.push({ name: 'Midas', vp });
      total += vp;
    }
    if (has('Amytis')) {
      const vp = ((me.wonderStagesBuilt || 0) * 2);
      breakdown.push({ name: 'Amytis', vp });
      total += vp;
    }
    if (has('Alexander')) {
      const totalTokens = (me.mvTokensAge1 || 0) + (me.mvTokensAge2 || 0) + (me.mvTokensAge3 || 0);
      const vp = totalTokens * 1;
      breakdown.push({ name: 'Alexander', vp });
      total += vp;
    }

    // Cynisca: +6 VP if you have no Military Defeat tokens.
    // Per user request, require explicit 0/0/0 MV tokens entered as a check.
    if (has('Cynisca')) {
      const missing: string[] = [];
      const a1 = me.mvTokensAge1;
      const a2 = me.mvTokensAge2;
      const a3 = me.mvTokensAge3;
      if (a1 == null) missing.push('mvTokensAge1');
      if (a2 == null) missing.push('mvTokensAge2');
      if (a3 == null) missing.push('mvTokensAge3');
      const ok = missing.length === 0 && a1 === 0 && a2 === 0 && a3 === 0;
      const vp = ok ? 6 : 0;
      breakdown.push({ name: 'Cynisca', vp, ...(missing.length ? { missing } : {}) });
      total += vp;
    }

    // Agrippina: award +7 only if user confirmed (UI flag)
    if (has('Agrippina')) {
      const vp = me.agrippinaOnly ? 7 : 0;
      breakdown.push({ name: 'Agrippina', vp });
      total += vp;
    }

    result[pid] = { totalIndirect: total, breakdown };
  }

  return result;
}
