import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Screen, H1, Card } from '../../components/ui';
import { useSetupStore } from '../../store/setupStore';
import { usePlayerStore } from '../../store/playerStore';
import { Table } from '../../components/ui/Table';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useSetupStore((s) => s.gameHistory);
  const profiles = usePlayerStore((s) => s.profiles);

  const game = useMemo(() => history.find((g) => String(g.id) === String(id)), [history, id]);

  if (!game) {
    return (
      <Screen>
        <H1>📄 Game Not Found</H1>
        <Text style={{ color: 'rgba(243,231,211,0.8)' }}>No game with id {String(id)} found.</Text>
      </Screen>
    );
  }

  const dateText = (() => {
    try {
      const d = game.date instanceof Date ? game.date : new Date(game.date);
      return d.toLocaleString();
    } catch {
      return String(game.date);
    }
  })();

  const playerOrder = game.players && game.players.length > 0
    ? game.players
    : Object.keys(game.scores || {});
  const scoreboard = [...Object.entries(game.scores || {})]
    .map(([pid, total]) => ({ pid, name: profiles[pid]?.name || pid, total }))
    .sort((a, b) => (b.total as number) - (a.total as number))
    .map((r, i) => ({ id: r.pid, rank: i + 1, name: r.name, total: r.total }));

  const exp = game.expansions || { leaders: false, cities: false, armada: false, edifice: false };
  const expChips = [
    exp.leaders && '👑 Leaders',
    exp.cities && '🏙️ Cities',
    exp.armada && '🚢 Armada',
    exp.edifice && '🏛️ Edifice',
  ].filter(Boolean) as string[];

  return (
    <Screen>
      <H1>📊 Game {String(game.id)}</H1>
      <Card>
        <Text style={{ color: '#F3E7D3' }}>Date: <Text style={{ color: '#C4A24C' }}>{dateText}</Text></Text>
        <Text style={{ color: '#F3E7D3', marginTop: 4 }}>Players: <Text style={{ color: '#C4A24C' }}>{playerOrder.length}</Text></Text>
        {!!game.duration && (
          <Text style={{ color: '#F3E7D3', marginTop: 4 }}>Duration: <Text style={{ color: '#C4A24C' }}>{game.duration} min</Text></Text>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {expChips.length > 0 ? expChips.map((t) => (
            <View key={t} style={{ marginRight: 8, marginTop: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(196,162,76,0.15)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.4)' }}>
              <Text style={{ color: '#C4A24C', fontWeight: '700' }}>{t}</Text>
            </View>
          )) : (
            <Text style={{ color: 'rgba(243,231,211,0.8)', marginTop: 6 }}>Base game only</Text>
          )}
        </View>
      </Card>

      <Card>
        <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 10 }}>Scoreboard</Text>
        <Table
          columns={[
            { key: 'rank', title: '#', width: 30, align: 'right' },
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'total', title: 'Points', flex: 1, align: 'right' },
          ]}
          rows={scoreboard}
          emptyText={'No scores recorded.'}
        />
      </Card>

      <Card>
        <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 8 }}>Seating Order</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {playerOrder.map((pid, idx) => (
            <View key={pid} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#C4A24C', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                <Text style={{ color: '#1C1A1A', fontWeight: '800', fontSize: 12 }}>{idx + 1}</Text>
              </View>
              <Text style={{ color: '#F3E7D3' }}>{profiles[pid]?.name || pid}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 8 }}>
          Wonders and per-category breakdowns not recorded in history yet.
        </Text>
      </Card>
    </Screen>
  );
}

