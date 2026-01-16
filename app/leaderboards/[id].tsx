import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Chip, H1, Screen } from '@/components/ui';
import { useSetupStore } from '../../store/setupStore';
import { usePlayerStore } from '../../store/playerStore';
import { Table } from '../../components/ui/Table';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { ALL_EDIFICE_PROJECTS } from '../../data/edificeDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';

const formatIdLabel = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const WONDER_NAME_BY_ID = new Map(WONDERS_DATABASE.map((w) => [w.id, w.name]));
const SHIPYARD_NAME_BY_ID = new Map(ARMADA_SHIPYARDS.map((s) => [s.id, s.name]));
const EDIFICE_NAME_BY_ID = new Map(ALL_EDIFICE_PROJECTS.map((p) => [p.id, p.name]));

const getDisplayName = (map: Map<string, string>, value?: string) => {
  if (!value) return '';
  return map.get(value) ?? formatIdLabel(value);
};

const formatSide = (side?: string) => {
  if (!side) return '';
  return side === 'night' ? 'Night' : 'Day';
};

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useSetupStore((s) => s.gameHistory);
  const profiles = usePlayerStore((s) => s.profiles);

  const game = useMemo(() => history.find((g) => String(g.id) === String(id)), [history, id]);

  if (!game) {
    return (
      <Screen>
        <H1>Game Not Found</H1>
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

  const playerOrder = (game.playerOrder && game.playerOrder.length > 0)
    ? game.playerOrder
    : (Object.keys(game.scores || {}));
  const scoreboard = [...Object.entries(game.scores || {})]
    .map(([pid, total]) => ({ pid, name: profiles[pid]?.name || pid, total }))
    .sort((a, b) => (b.total as number) - (a.total as number))
    .map((r, i) => ({ id: r.pid, rank: i + 1, name: r.name, total: r.total }));

  const exp = game.expansions || { leaders: false, cities: false, armada: false, edifice: false };
  const expChips = [
    exp.leaders && 'Leaders',
    exp.cities && 'Cities',
    exp.armada && 'Armada',
    exp.edifice && 'Edifice',
  ].filter(Boolean) as string[];

  return (
    <Screen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
      <H1>Game {String(game.id)}</H1>
      <Card>
        <Text style={{ color: '#F3E7D3' }}>Date: <Text style={{ color: '#C4A24C' }}>{dateText}</Text></Text>
        <Text style={{ color: '#F3E7D3', marginTop: 4 }}>Players: <Text style={{ color: '#C4A24C' }}>{playerOrder.length}</Text></Text>
        {!!game.duration && (
          <Text style={{ color: '#F3E7D3', marginTop: 4 }}>Duration: <Text style={{ color: '#C4A24C' }}>{game.duration} min</Text></Text>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {expChips.length > 0 ? expChips.map((t) => (
            <Chip key={t} label={t} active />
          )) : (
            <Text style={{ color: 'rgba(243,231,211,0.8)', marginTop: 6 }}>Base game only</Text>
          )}
        </View>
      </Card>

      {!!game.edificeProjects && (
        <Card>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 8 }}>Edifice Projects</Text>
          {(['age1','age2','age3'] as const).map((age) => (
            <View key={age} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ color: 'rgba(243,231,211,0.8)' }}>{age.toUpperCase()}</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>
                {getDisplayName(EDIFICE_NAME_BY_ID, (game.edificeProjects as any)[age])}
              </Text>
            </View>
          ))}
        </Card>
      )}

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
      </Card>

      {!!game.wonders && (
        <Card>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 8 }}>Wonders</Text>
          {playerOrder.map((pid) => {
            const w = game.wonders?.[pid];
            if (!w) return null;
            const sideLabel = formatSide(w.side);
            return (
              <View key={`w_${pid}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: '#F3E7D3', flex: 2 }}>{profiles[pid]?.name || pid}</Text>
                <Text style={{ color: '#C4A24C', flex: 3 }}>
                  {getDisplayName(WONDER_NAME_BY_ID, w.boardId)} {sideLabel ? `(${sideLabel})` : ''}
                </Text>
                {!!w.shipyardId && (
                  <Text style={{ color: 'rgba(243,231,211,0.8)', flex: 2 }}>
                    Shipyard: {getDisplayName(SHIPYARD_NAME_BY_ID, w.shipyardId)}
                  </Text>
                )}
              </View>
            );
          })}
        </Card>
      )}

      {!!game.categoryBreakdowns && (
        <Card>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 8 }}>Category Breakdown</Text>
          {playerOrder.map((pid) => {
            const b = game.categoryBreakdowns?.[pid] as any;
            if (!b) return null;
            const entries = Object.entries(b).filter(([,v]) => typeof v === 'number' && v !== 0) as [string, number][];
            entries.sort((a,b)=> b[1]-a[1]);
            return (
              <View key={`c_${pid}`} style={{ marginBottom: 8 }}>
                <Text style={{ color: '#F3E7D3', fontWeight: '700', marginBottom: 4 }}>{profiles[pid]?.name || pid}</Text>
                {entries.length === 0 ? (
                  <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No categories recorded.</Text>
                ) : (
                  entries.slice(0, 6).map(([k, v]) => (
                    <View key={`${pid}_${k}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
                      <Text style={{ color: 'rgba(243,231,211,0.8)' }}>{k}</Text>
                      <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{v}</Text>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </Card>
      )}
      </ScrollView>
    </Screen>
  );
}
