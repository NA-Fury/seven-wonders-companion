// data/guildsResolver.ts
// Computes Purple (Guild) end-game VP for all players, using neighbors' data.

export type PlayerId = string;

export interface GuildBreakdownItem {
  name: string;
  vp: number;
  missing?: string[];
}

export interface GuildTotals {
  total: number;
  breakdown: GuildBreakdownItem[];
}

export interface PlayerCitySnapshot {
  // Own counts
  brown?: number;
  grey?: number;
  blue?: number;
  yellow?: number;
  red?: number;
  green?: number;
  purple?: number;
  black?: number;
  leaders?: number;
  wonderStagesBuilt?: number;
  coins?: number;
  edificePawns?: { age1?: boolean; age2?: boolean; age3?: boolean };
  // Selected guild card names (by display name)
  selectedGuilds?: string[];
}

export interface GuildResolverInput {
  order: PlayerId[]; // seating order
  // Return own snapshot for a player id
  getSnapshot: (pid: PlayerId) => PlayerCitySnapshot;
}

const norm = (s: string) => s.trim().toLowerCase();

export function computeGuildsForAll(input: GuildResolverInput): Record<PlayerId, GuildTotals> {
  const { order, getSnapshot } = input;
  const n = order.length;
  const result: Record<PlayerId, GuildTotals> = {};

  const leftIdx = (i: number) => (i - 1 + n) % n;
  const rightIdx = (i: number) => (i + 1) % n;

  for (let i = 0; i < n; i++) {
    const pid = order[i];
    const me = getSnapshot(pid) || {};
    const left = getSnapshot(order[leftIdx(i)]) || {};
    const right = getSnapshot(order[rightIdx(i)]) || {};
    const breakdown: GuildBreakdownItem[] = [];
    let total = 0;

    const selected = (me.selectedGuilds || []).map(norm);
    const has = (name: string) => selected.includes(norm(name));

    // Utility to collect missing fields
    const miss = (...fields: (keyof PlayerCitySnapshot | string)[]) => fields.map(String);

    // 1 VP per neighbor brown
    if (has('Workers Guild')) {
      const m: string[] = [];
      if (left.brown == null) m.push('left.brown');
      if (right.brown == null) m.push('right.brown');
      const vp = (left.brown || 0) + (right.brown || 0);
      breakdown.push({ name: 'Workers Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Craftsmens Guild')) {
      const m: string[] = [];
      if (left.grey == null) m.push('left.grey');
      if (right.grey == null) m.push('right.grey');
      const vp = (left.grey || 0) + (right.grey || 0);
      breakdown.push({ name: 'Craftsmens Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Magistrates Guild')) {
      const m: string[] = [];
      if (left.blue == null) m.push('left.blue');
      if (right.blue == null) m.push('right.blue');
      const vp = (left.blue || 0) + (right.blue || 0);
      breakdown.push({ name: 'Magistrates Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Traders Guild')) {
      const m: string[] = [];
      if (left.yellow == null) m.push('left.yellow');
      if (right.yellow == null) m.push('right.yellow');
      const vp = (left.yellow || 0) + (right.yellow || 0);
      breakdown.push({ name: 'Traders Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Spies Guild')) {
      const m: string[] = [];
      if (left.red == null) m.push('left.red');
      if (right.red == null) m.push('right.red');
      const vp = (left.red || 0) + (right.red || 0);
      breakdown.push({ name: 'Spies Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Philosophers Guild')) {
      const m: string[] = [];
      if (left.green == null) m.push('left.green');
      if (right.green == null) m.push('right.green');
      const vp = (left.green || 0) + (right.green || 0);
      breakdown.push({ name: 'Philosophers Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Architects Guild')) {
      const m: string[] = [];
      if (left.purple == null) m.push('left.purple');
      if (right.purple == null) m.push('right.purple');
      const vp = (left.purple || 0) + (right.purple || 0);
      breakdown.push({ name: 'Architects Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Shadow Guild')) {
      const m: string[] = [];
      if (left.black == null) m.push('left.black');
      if (right.black == null) m.push('right.black');
      const vp = (left.black || 0) + (right.black || 0);
      breakdown.push({ name: 'Shadow Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    if (has('Diplomats Guild')) {
      const m: string[] = [];
      if (left.leaders == null) m.push('left.leaders');
      if (right.leaders == null) m.push('right.leaders');
      const vp = (left.leaders || 0) + (right.leaders || 0);
      breakdown.push({ name: 'Diplomats Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Shipowners: own brown+grey+purple
    if (has('Shipowners Guild')) {
      const m: string[] = [];
      if (me.brown == null) m.push('brown');
      if (me.grey == null) m.push('grey');
      if (me.purple == null) m.push('purple');
      const vp = (me.brown || 0) + (me.grey || 0) + (me.purple || 0);
      breakdown.push({ name: 'Shipowners Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Builders: wonder stages (you + neighbors)
    if (has('Builders Guild')) {
      const m: string[] = [];
      if (me.wonderStagesBuilt == null) m.push('self.wonderStagesBuilt');
      if (left.wonderStagesBuilt == null) m.push('left.wonderStagesBuilt');
      if (right.wonderStagesBuilt == null) m.push('right.wonderStagesBuilt');
      const vp = (me.wonderStagesBuilt || 0) + (left.wonderStagesBuilt || 0) + (right.wonderStagesBuilt || 0);
      breakdown.push({ name: 'Builders Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Decorators: 1 VP if all stages (we treat as 1 to match generic list)
    if (has('Decorators Guild')) {
      const m: string[] = [];
      if (me.wonderStagesBuilt == null) m.push('self.wonderStagesBuilt');
      const allBuilt = (me.wonderStagesBuilt || 0) >= 3; // assume 3 total stages typical
      const vp = allBuilt ? 1 : 0;
      breakdown.push({ name: 'Decorators Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Gamers: 1 VP per 3 coins in neighbors (cap 10)
    if (has('Gamers Guild')) {
      const m: string[] = [];
      if (left.coins == null) m.push('left.coins');
      if (right.coins == null) m.push('right.coins');
      const coins = (left.coins || 0) + (right.coins || 0);
      const vp = Math.min(10, Math.floor(coins / 3));
      breakdown.push({ name: 'Gamers Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Scientists Guild: grants science choice symbol (no direct VP here)
    if (has('Scientists Guild')) {
      breakdown.push({ name: 'Scientists Guild', vp: 0 });
    }

    // Engineers Guild: 1 VP if you have edifice pawns age I, II, III
    if (has('Engineers Guild')) {
      const m: string[] = [];
      if (!me.edificePawns) m.push('edifice.pawns (Age I/II/III)');
      const hasAll = !!(me.edificePawns?.age1 && me.edificePawns?.age2 && me.edificePawns?.age3);
      const vp = hasAll ? 1 : 0;
      breakdown.push({ name: 'Engineers Guild', vp, missing: m.length ? m : undefined });
      total += vp;
    }

    // Forgers Guild: treat as +1 VP; (coins loss effect ignored here, handled in Treasury by user)
    if (has('Forgers Guild')) {
      breakdown.push({ name: 'Forgers Guild', vp: 1 });
      total += 1;
    }

    result[pid] = { total, breakdown };
  }

  return result;
}

