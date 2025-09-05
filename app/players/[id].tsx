import React, { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useSetupStore } from '../../store/setupStore';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = usePlayerStore((s) => (id ? s.profiles[id] : undefined));
  const profilesMap = usePlayerStore((s) => s.profiles);
  const updateProfile = usePlayerStore((s) => s.updateProfile);
  const gameHistory = useSetupStore((s) => s.gameHistory);
  const [name, setName] = useState(profile?.name || '');

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FEF3C7' }}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  const stats = profile.stats;
  const favoriteWonder = useMemo(() => {
    let best: { id: string; total: number } | null = null;
    Object.entries(stats.wondersPlayed).forEach(([wid, val]) => {
      if (!best || val.total > best.total) best = { id: wid, total: val.total };
    });
    return best?.id || '—';
  }, [stats.wondersPlayed]);

  const strongest = useMemo(() => {
    const entries = Object.entries(stats.categoryAverages || {});
    return entries.sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 2);
  }, [stats.categoryAverages]);

  const weakest = useMemo(() => {
    const entries = Object.entries(stats.categoryAverages || {});
    return entries.sort((a, b) => (a[1] || 0) - (b[1] || 0)).slice(0, 2);
  }, [stats.categoryAverages]);

  const favoriteNeighbors = useMemo(() => {
    const arr = Object.entries(stats.neighborCounts || {}).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 3);
    return arr.map(([pid, count]) => ({ id: pid, name: profilesMap[pid]?.name || pid, count }));
  }, [stats.neighborCounts, profilesMap]);

  const notPlayedWonders = useMemo(() => {
    const playedIds = new Set(Object.keys(stats.wondersPlayed || {}));
    const all = (WONDERS_DATABASE || []).map((w: any) => w.id);
    return all.filter((wid) => !playedIds.has(wid)).slice(0, 12);
  }, [stats.wondersPlayed]);

  const winRateRank = useMemo(() => {
    const all = Object.values(profilesMap);
    if (all.length === 0) return null;
    const sorted = all.slice().sort((a, b) => (b.stats.winRate || 0) - (a.stats.winRate || 0));
    const rank = Math.max(1, sorted.findIndex((p) => p.id === profile.id) + 1);
    return { rank, total: all.length };
  }, [profilesMap, profile.id]);

  const saveName = () => {
    const n = name.trim();
    if (!n) return Alert.alert('Name required');
    updateProfile(profile.id, { name: n });
    Alert.alert('Updated', 'Profile name updated.');
  };

  const findGameById = (gid?: string) => gameHistory.find((g) => g.id === gid);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Player Profile</Text>
        </View>

        {/* Edit name */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: 'rgba(243,231,211,0.8)', marginBottom: 6 }}>Name</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Player name"
                placeholderTextColor="#F3E7D380"
                style={{ backgroundColor: 'rgba(28,26,26,0.6)', color: '#F3E7D3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)' }}
              />
            </View>
            <Pressable onPress={saveName} style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' })}>
              <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Save</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary stats */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Overview</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Games: {stats.gamesPlayed}</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Wins: {stats.wins}  •  Win% {Math.round((stats.winRate || 0) * 100)}%</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Runner Up: {stats.runnerUp}  •  Third: {stats.thirdPlace}</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Average: {stats.averageScore}</Text>
        </View>

        {/* High/Low */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Highs & Lows</Text>
          <Text style={{ color: '#C4A24C' }}>Highest: {stats.highestScore?.score ?? '—'}</Text>
          {stats.highestScore && (
            <Text style={{ color: 'rgba(243,231,211,0.7)', fontSize: 12 }}>Game ID: {stats.highestScore.gameId}{findGameById(stats.highestScore.gameId) ? '' : ' (not in history)'}
            </Text>
          )}
          <View style={{ height: 8 }} />
          <Text style={{ color: '#C4A24C' }}>Lowest: {stats.lowestScore?.score ?? '—'}</Text>
          {stats.lowestScore && (
            <Text style={{ color: 'rgba(243,231,211,0.7)', fontSize: 12 }}>Game ID: {stats.lowestScore.gameId}{findGameById(stats.lowestScore.gameId) ? '' : ' (not in history)'}
            </Text>
          )}
        </View>

        {/* Wonders played */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Wonders Played</Text>
          {Object.keys(stats.wondersPlayed).length === 0 && (
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No data yet.</Text>
          )}
          {Object.entries(stats.wondersPlayed).map(([wid, v]) => (
            <Text key={wid} style={{ color: 'rgba(243,231,211,0.8)' }}>{wid}: Day {v.day} / Night {v.night} (Total {v.total})</Text>
          ))}
          <View style={{ height: 8 }} />
          <Text style={{ color: '#C4A24C' }}>Favorite Wonder: {favoriteWonder}</Text>
          {notPlayedWonders.length > 0 && (
            <>
              <View style={{ height: 6 }} />
              <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Not yet played: {notPlayedWonders.join(', ')}</Text>
            </>
          )}
        </View>

        {/* Strategies */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Strategies</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Strongest: {strongest.map(([k]) => k).join(', ') || '—'}</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Weakest: {weakest.map(([k]) => k).join(', ') || '—'}</Text>
        </View>

        {/* Neighbors */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Neighbors</Text>
          {favoriteNeighbors.length === 0 && (
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No data yet.</Text>
          )}
          {favoriteNeighbors.map((n) => (
            <Text key={n.id} style={{ color: 'rgba(243,231,211,0.8)' }}>{n.name} • {n.count} times</Text>
          ))}
        </View>

        {/* Expansion usage */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Expansions</Text>
          {(() => {
            const ex = stats.expansionsUseCounts;
            const line = (label: string, v: number) => (
              <Text key={label} style={{ color: v > 0 ? 'rgba(243,231,211,0.9)' : 'rgba(243,231,211,0.4)' }}>{label}: {v}</Text>
            );
            return (
              <>
                {line('Base only', ex.baseOnly)}
                {line('Leaders', ex.leaders)}
                {line('Cities', ex.cities)}
                {line('Armada', ex.armada)}
                {line('Edifice', ex.edifice)}
              </>
            );
          })()}
          {winRateRank && (
            <Text style={{ color: '#C4A24C', marginTop: 8 }}>Win rate rank: {winRateRank.rank}/{winRateRank.total}</Text>
          )}
        </View>

        {/* Badges */}
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', padding: 14 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700', marginBottom: 6 }}>Badges ({profile.badges.length})</Text>
          {profile.badges.length === 0 && (
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No badges yet.</Text>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {profile.badges.map((b) => (
              <View key={b.id} style={{ backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}>
                <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: '600' }}>{b.id}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
