import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBadgeById } from '../../data/badges';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { usePlayerStore, type PlayerProfile } from '../../store/playerStore';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profiles = usePlayerStore((s) => s.profiles);
  const updateProfile = usePlayerStore((s) => s.updateProfile);
  const removeProfile = usePlayerStore((s) => s.removeProfile);

  const profile: PlayerProfile | undefined = profiles[id!];
  const [name, setName] = useState(profile?.name || '');

  const neighborsList = useMemo(() => {
    const counts = profile?.stats.neighborCounts || {};
    const entries = Object.entries(counts)
      .filter(([pid]) => pid !== profile?.id)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, count]) => ({
        id: pid,
        name: profiles[pid]?.name || 'Unknown',
        count,
      }));
    return entries;
  }, [profile?.stats.neighborCounts, profile?.id, profiles]);

  const wondersPlayed = useMemo(() => {
    const played = profile?.stats.wondersPlayed || {};
    const playedArr = Object.entries(played)
      .map(([wid, data]) => ({
        id: wid,
        name: WONDERS_DATABASE.find((w) => w.id === wid)?.name || wid,
        day: data.day || 0,
        night: data.night || 0,
        total: data.total || 0,
      }))
      .sort((a, b) => b.total - a.total);
    const notPlayed = WONDERS_DATABASE
      .filter((w) => !played[w.id])
      .map((w) => w.name)
      .sort((a, b) => a.localeCompare(b));
    const favorite = playedArr[0];
    return { playedArr, notPlayed, favorite };
  }, [profile?.stats.wondersPlayed]);

  const categories = useMemo(() => {
    const avg = profile?.stats.categoryAverages || {};
    const entries = Object.entries(avg).filter(([, v]) => typeof v === 'number') as [string, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const strongest = sorted.slice(0, 3);
    const weakest = sorted.slice(-3).reverse();
    return { strongest, weakest, all: sorted };
  }, [profile?.stats.categoryAverages]);

  const expansionsUsage = useMemo(() => {
    const e = profile?.stats.expansionsUseCounts || { leaders: 0, cities: 0, armada: 0, edifice: 0, baseOnly: 0 };
    return [
      { key: 'Base', value: e.baseOnly || 0 },
      { key: 'Leaders', value: e.leaders || 0 },
      { key: 'Cities', value: e.cities || 0 },
      { key: 'Armada', value: e.armada || 0 },
      { key: 'Edifice', value: e.edifice || 0 },
    ];
  }, [profile?.stats.expansionsUseCounts]);

  // Move this hook ABOVE any early returns to satisfy rules-of-hooks
  const displayBadges = useMemo(() => {
    const resolveName = (id: string) => {
      const fromDb = getBadgeById(id);
      if (fromDb) return { name: fromDb.name, icon: fromDb.icon };
      if (id.startsWith('wonder_victor_')) {
        const wid = id.replace('wonder_victor_', '');
        const w = WONDERS_DATABASE.find((x) => x.id.toLowerCase() === wid.toLowerCase());
        if (w) return { name: `${w.name} Victor`, icon: '🏛️' };
      }
      const human = id
        .split('_')
        .map((s) => (s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join(' ');
      return { name: human, icon: '🏅' };
    };

    const badgesArr = profile?.badges || [];
    return badgesArr.map((b) => {
      const { name, icon } = resolveName(b.id);
      return { id: b.id, name, icon, unlockedAt: b.unlockedAt };
    });
  }, [profile?.badges]);

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1A1A' }}>
        <Text style={{ color: '#FEF3C7' }}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  const saveRename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === profile.name) return;
    updateProfile(profile.id, { name: trimmed });
  };

  const StatsRow = ({ label, value }: { label: string; value: string | number }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ color: 'rgba(243,231,211,0.7)' }}>{label}</Text>
      <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{`${value}`}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header + rename */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.8 : 1, marginBottom: 8 })}>
            <Text style={{ color: '#C4A24C' }}>← Back</Text>
          </Pressable>
          <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Player Profile</Text>
          <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 2 }}>Edit name and review performance.</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)' }}>
            <Text style={{ color: 'rgba(243,231,211,0.8)', marginBottom: 6 }}>Name</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Player name"
                  placeholderTextColor="#F3E7D380"
                  style={{
                    backgroundColor: 'rgba(28,26,26,0.6)',
                    color: '#F3E7D3',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(196,162,76,0.25)'
                  }}
                  returnKeyType="done"
                  onSubmitEditing={saveRename}
                />
              </View>
              <Pressable onPress={saveRename} style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' })}>
                <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Summary metrics */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}>
            <Text style={{ color: '#818CF8', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Summary</Text>
            <StatsRow label="Games Played" value={profile.stats.gamesPlayed} />
            <StatsRow label="Wins" value={profile.stats.wins} />
            <StatsRow label="Runner Up" value={profile.stats.runnerUp ?? 0} />
            <StatsRow label="Third Place" value={profile.stats.thirdPlace ?? 0} />
            <StatsRow label="Win %" value={`${Math.round((profile.stats.winRate || 0) * 100)}%`} />
            <StatsRow label="Average" value={profile.stats.averageScore} />
            {profile.stats.highestScore && (
              <StatsRow label="High Score" value={`${profile.stats.highestScore.score} (Game ${profile.stats.highestScore.gameId})`} />
            )}
            {profile.stats.lowestScore && (
              <StatsRow label="Low Score" value={`${profile.stats.lowestScore.score} (Game ${profile.stats.lowestScore.gameId})`} />
            )}
          </View>
        </View>

        {/* Wonders played */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(196,162,76,0.1)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(196,162,76,0.3)' }}>
            <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Wonders Played</Text>
            {wondersPlayed.favorite && (
              <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 6 }}>Favorite: {wondersPlayed.favorite.name} ({wondersPlayed.favorite.total})</Text>
            )}
            {wondersPlayed.playedArr.length > 0 ? (
              <View>
                {wondersPlayed.playedArr.map((w) => (
                  <View key={w.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#FEF3C7' }}>{w.name}</Text>
                    <Text style={{ color: 'rgba(243,231,211,0.8)' }}>Day {w.day} · Night {w.night} · Total {w.total}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No wonders played yet.</Text>
            )}
            {wondersPlayed.notPlayed.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: 'rgba(243,231,211,0.7)', marginBottom: 4 }}>Not yet played:</Text>
                <Text style={{ color: 'rgba(243,231,211,0.7)' }}>{wondersPlayed.notPlayed.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Strategy profile */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)' }}>
            <Text style={{ color: '#86EFAC', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Strategy Profile</Text>
            {categories.all.length > 0 ? (
              <>
                <Text style={{ color: 'rgba(243,231,211,0.8)', marginBottom: 6 }}>Strongest:</Text>
                {categories.strongest.map(([k, v]) => (
                  <Text key={k} style={{ color: '#FEF3C7' }}>• {capitalize(k)}: {v}</Text>
                ))}
                <View style={{ height: 8 }} />
                <Text style={{ color: 'rgba(243,231,211,0.8)', marginBottom: 6 }}>Weakest:</Text>
                {categories.weakest.map(([k, v]) => (
                  <Text key={k} style={{ color: 'rgba(243,231,211,0.7)' }}>• {capitalize(k)}: {v}</Text>
                ))}
              </>
            ) : (
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No category data yet.</Text>
            )}
          </View>
        </View>

        {/* Neighbors */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)' }}>
            <Text style={{ color: '#F87171', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Frequent Neighbors</Text>
            {neighborsList.length > 0 ? neighborsList.map((n) => (
              <Pressable key={n.id} onPress={() => router.push(`/players/${n.id}`)} style={({ pressed }) => ({ paddingVertical: 6, opacity: pressed ? 0.7 : 1 })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FEF3C7' }}>{n.name}</Text>
                  <Text style={{ color: 'rgba(243,231,211,0.8)' }}>{n.count}x</Text>
                </View>
              </Pressable>
            )) : (
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No neighbor data yet.</Text>
            )}
          </View>
        </View>

        {/* Expansions usage */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(250,204,21,0.08)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(250,204,21,0.25)' }}>
            <Text style={{ color: '#FACC15', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Expansions Usage</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {expansionsUsage.map((e) => (
                <View key={e.key} style={{
                  backgroundColor: e.value === 0 ? 'rgba(243,231,211,0.06)' : 'rgba(196,162,76,0.2)',
                  borderWidth: 1,
                  borderColor: e.value === 0 ? 'rgba(243,231,211,0.1)' : 'rgba(196,162,76,0.35)',
                  borderRadius: 12,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}>
                  <Text style={{ color: e.value === 0 ? 'rgba(243,231,211,0.5)' : '#C4A24C' }}>{e.key}: {e.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}>
            <Text style={{ color: '#818CF8', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Badges ({displayBadges.length})</Text>
            {displayBadges.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {displayBadges.map((b) => (
                  <View
                    key={b.id}
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.2)',
                      borderRadius: 12,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(99,102,241,0.3)'
                    }}
                  >
                    <Text style={{ color: '#818CF8', fontWeight: '600' }}>
                      {b.icon} {b.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No badges yet.</Text>
            )}
          </View>
        </View>

        {/* Danger zone */}
        <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 24 }}>
          <Pressable onPress={() => { removeProfile(profile.id); router.back(); }}
            style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,1)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' })}
          >
            <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Remove Player</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
