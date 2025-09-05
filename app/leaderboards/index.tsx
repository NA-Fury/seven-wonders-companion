import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetupStore } from '../../store/setupStore';
import { usePlayerStore } from '../../store/playerStore';

export default function LeaderboardsScreen() {
  const history = useSetupStore((s) => s.gameHistory);
  const profiles = usePlayerStore((s) => s.profiles);

  const flat = useMemo(() => {
    const items: Array<{ key: string; title: string; subtitle?: string }> = [];
    // Highest points (all time)
    let best: { playerId: string; total: number; gameId: string } | null = null;
    history.forEach((g) => {
      Object.entries(g.scores).forEach(([pid, total]) => {
        if (!best || total > best.total) best = { playerId: pid, total, gameId: g.id } as any;
      });
    });
    if (best) {
      const name = profiles[best.playerId]?.name || best.playerId;
      items.push({ key: 'best', title: `Highest Score: ${best.total}`, subtitle: `${name} (Game ${best.gameId})` });
    }
    // Most wins
    const wins: Record<string, number> = {};
    history.forEach((g) => { if (g.winner) wins[g.winner] = (wins[g.winner] || 0) + 1; });
    const topWins = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
    if (topWins) {
      const [pid, count] = topWins;
      const name = profiles[pid]?.name || pid;
      items.push({ key: 'wins', title: `Most Wins: ${count}`, subtitle: name });
    }
    // Average score leaders (min 3 games)
    const byPlayer: Record<string, { total: number; games: number }> = {};
    history.forEach((g) => {
      Object.entries(g.scores).forEach(([pid, total]) => {
        byPlayer[pid] = byPlayer[pid] || { total: 0, games: 0 };
        byPlayer[pid].total += total;
        byPlayer[pid].games += 1;
      });
    });
    const avg = Object.entries(byPlayer)
      .filter(([, v]) => v.games >= 3)
      .map(([pid, v]) => ({ pid, avg: Math.round((v.total / v.games) * 10) / 10 }))
      .sort((a, b) => b.avg - a.avg)[0];
    if (avg) {
      const name = profiles[avg.pid]?.name || avg.pid;
      items.push({ key: 'avg', title: `Best Average (3+): ${avg.avg}`, subtitle: name });
    }
    return items;
  }, [history, profiles]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Local Leaderboards</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Highlights and records across saved games.</Text>
      </View>
      <FlatList
        data={flat}
        keyExtractor={(x) => x.key}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: 'rgba(31,41,55,0.5)',
            borderWidth: 1,
            borderColor: 'rgba(196,162,76,0.25)',
            borderRadius: 16,
            padding: 14,
            marginHorizontal: 20,
            marginTop: 10,
          }}>
            <Text style={{ color: '#FEF3C7', fontSize: 16, fontWeight: '700' }}>{item.title}</Text>
            {!!item.subtitle && (<Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>{item.subtitle}</Text>)}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No games saved yet. Play a game to populate leaderboards.</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

