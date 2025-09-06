import type { GameHistoryEntry } from '../store/setupStore';

export type TopScoreRow = {
  id: string; // unique row id
  playerId: string;
  name: string;
  score: number;
  gameId: string;
  date?: string;
  playerCount: number;
};

export function computeTopScores(history: GameHistoryEntry[], profiles: Record<string, { name: string }>): TopScoreRow[] {
  const rows: TopScoreRow[] = [];
  history.forEach((g) => {
    const pc = g.players?.length || Object.keys(g.scores || {}).length || 0;
    Object.entries(g.scores || {}).forEach(([pid, total]) => {
      rows.push({
        id: `${g.id}_${pid}`,
        playerId: pid,
        name: profiles[pid]?.name || pid,
        score: total,
        gameId: g.id,
        date: g.date ? new Date(g.date).toISOString().slice(0, 10) : undefined,
        playerCount: pc,
      });
    });
  });
  rows.sort((a, b) => b.score - a.score || a.gameId.localeCompare(b.gameId));
  return rows;
}

export function computeTopScoresGroupedByGame(history: GameHistoryEntry[], profiles: Record<string, { name: string }>): TopScoreRow[] {
  const rows = computeTopScores(history, profiles);
  rows.sort((a, b) => a.gameId.localeCompare(b.gameId) || b.score - a.score);
  return rows;
}

export type CountRow = { id: string; playerId: string; name: string; count: number };

export function computeMostWins(history: GameHistoryEntry[], profiles: Record<string, { name: string }>): CountRow[] {
  const wins: Record<string, number> = {};
  history.forEach((g) => {
    if (g.winner) wins[g.winner] = (wins[g.winner] || 0) + 1;
  });
  const rows: CountRow[] = Object.entries(wins)
    .map(([pid, c]) => ({ id: pid, playerId: pid, name: profiles[pid]?.name || pid, count: c }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return rows;
}

export type AverageRow = { id: string; playerId: string; name: string; avg: number; games: number };

export function computeBestAverages(history: GameHistoryEntry[], profiles: Record<string, { name: string }>, minGames = 3): AverageRow[] {
  const by: Record<string, { total: number; games: number }> = {};
  history.forEach((g) => {
    Object.entries(g.scores || {}).forEach(([pid, total]) => {
      by[pid] = by[pid] || { total: 0, games: 0 };
      by[pid].total += total;
      by[pid].games += 1;
    });
  });
  const rows: AverageRow[] = Object.entries(by)
    .filter(([, v]) => v.games >= minGames)
    .map(([pid, v]) => ({ id: pid, playerId: pid, name: profiles[pid]?.name || pid, avg: Math.round((v.total / v.games) * 10) / 10, games: v.games }))
    .sort((a, b) => b.avg - a.avg || b.games - a.games || a.name.localeCompare(b.name));
  return rows;
}

export type MarginRow = { id: string; playerId: string; name: string; margin: number; gameId: string };

export function computeBiggestWinMargins(history: GameHistoryEntry[], profiles: Record<string, { name: string }>): MarginRow[] {
  const rows: MarginRow[] = [];
  history.forEach((g) => {
    const scores = Object.entries(g.scores || {}).map(([pid, total]) => ({ pid, total }));
    if (scores.length < 2) return;
    scores.sort((a, b) => b.total - a.total);
    const top = scores[0];
    const second = scores[1];
    const margin = top.total - second.total;
    rows.push({ id: `${g.id}_${top.pid}`, playerId: top.pid, name: profiles[top.pid]?.name || top.pid, margin, gameId: g.id });
  });
  rows.sort((a, b) => b.margin - a.margin || a.gameId.localeCompare(b.gameId));
  return rows;
}

export function filterByPlayerCount<T extends { playerCount?: number }>(rows: T[], n: number): T[] {
  return rows.filter((r) => r.playerCount === n);
}

// ---- Player profile driven leaderboards ------------------------------------

type Profiles = Record<string, { name: string; stats?: any }>;

export function computePersonalBests(history: GameHistoryEntry[], profiles: Profiles): Array<{ id: string; playerId: string; name: string; best: number; gameId: string }>{
  const bestBy: Record<string, { score: number; gameId: string }> = {};
  history.forEach((g) => {
    Object.entries(g.scores || {}).forEach(([pid, total]) => {
      const cur = bestBy[pid];
      if (!cur || total > cur.score) bestBy[pid] = { score: total, gameId: g.id };
    });
  });
  const rows = Object.entries(bestBy).map(([pid, v]) => ({ id: pid, playerId: pid, name: profiles[pid]?.name || pid, best: v.score, gameId: v.gameId }));
  rows.sort((a, b) => b.best - a.best || a.name.localeCompare(b.name));
  return rows;
}

export function computeWinRateRows(profiles: Profiles, minGames = 3): Array<{ id: string; name: string; winRate: number; games: number }>{
  return Object.values(profiles)
    .map((p) => ({ id: (p as any).id || p.name, name: p.name, winRate: p.stats?.winRate ?? 0, games: p.stats?.gamesPlayed ?? 0 }))
    .filter((r) => r.games >= minGames)
    .sort((a, b) => b.winRate - a.winRate || b.games - a.games || a.name.localeCompare(b.name));
}

export function computeGamesPlayedRows(profiles: Profiles): Array<{ id: string; name: string; games: number }>{
  return Object.values(profiles)
    .map((p) => ({ id: (p as any).id || p.name, name: p.name, games: p.stats?.gamesPlayed ?? 0 }))
    .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name));
}

export function computeTop3RateRows(profiles: Profiles, minGames = 3): Array<{ id: string; name: string; top3Rate: number; games: number }>{
  return Object.values(profiles)
    .map((p) => ({ id: (p as any).id || p.name, name: p.name, top3Rate: p.stats?.top3Rate ?? 0, games: p.stats?.gamesPlayed ?? 0 }))
    .filter((r) => r.games >= minGames)
    .sort((a, b) => b.top3Rate - a.top3Rate || b.games - a.games || a.name.localeCompare(b.name));
}

export function computeConsistencyRows(profiles: Profiles, minGames = 3): Array<{ id: string; name: string; floor: number; games: number }>{
  return Object.values(profiles)
    .map((p) => ({ id: (p as any).id || p.name, name: p.name, floor: p.stats?.lowestScore?.score ?? 0, games: p.stats?.gamesPlayed ?? 0 }))
    .filter((r) => r.games >= minGames)
    .sort((a, b) => b.floor - a.floor || b.games - a.games || a.name.localeCompare(b.name));
}

export function computeWonderWinsFromProfiles(profiles: Record<string, { name: string; badges?: { id: string }[] }>): Array<{ id: string; wonderId: string; playerId: string; name: string; wins: number }>{
  // Note: current data model stores each wonder_victor_{wonderId} at most once per player (unique badge),
  // so this counts unique wins per wonder, not cumulative wins.
  const rows: Array<{ id: string; wonderId: string; playerId: string; name: string; wins: number }> = [];
  Object.entries(profiles).forEach(([pid, p]) => {
    const badges = p as any;
    const arr: { id: string }[] = badges?.badges || [];
    const counts: Record<string, number> = {};
    arr.forEach((b) => {
      if (b.id && b.id.startsWith('wonder_victor_')) {
        const wid = b.id.replace('wonder_victor_', '');
        counts[wid] = (counts[wid] || 0) + 1;
      }
    });
    Object.entries(counts).forEach(([wid, c]) => {
      rows.push({ id: `${wid}_${pid}`, wonderId: wid, playerId: pid, name: p.name || pid, wins: c });
    });
  });
  rows.sort((a, b) => a.wonderId.localeCompare(b.wonderId) || b.wins - a.wins || a.name.localeCompare(b.name));
  return rows;
}
