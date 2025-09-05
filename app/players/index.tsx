import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/playerStore';
import { router } from 'expo-router';

export default function PlayersScreen() {
  const profilesMap = usePlayerStore((s) => s.profiles);
  const addProfile = usePlayerStore((s) => s.addProfile);
  const removeProfile = usePlayerStore((s) => s.removeProfile);
  const [query, setQuery] = useState('');
  const data = useMemo(() => {
    const list = Object.values(profilesMap).sort((a, b) => a.name.localeCompare(b.name));
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [profilesMap, query]);

  const handleQuickAdd = async () => {
    const name = query.trim() || `Player ${Object.keys(profilesMap).length + 1}`;
    if (!name) return;
    addProfile(name);
    setQuery('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Players</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Profiles, performance, and badges.</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search or add player…"
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
              onSubmitEditing={handleQuickAdd}
            />
          </View>
          <Pressable onPress={handleQuickAdd} style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' })}>
            <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/players/${item.id}`)}
            style={{
              backgroundColor: 'rgba(31,41,55,0.5)',
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.25)',
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#FEF3C7', fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
              <Pressable onPress={() => removeProfile(item.id)}>
                <Text style={{ color: 'rgba(243,231,211,0.5)' }}>Remove</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Games {item.stats.gamesPlayed}</Text>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Wins {item.stats.wins}</Text>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Win% {Math.round(item.stats.winRate * 100)}%</Text>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Avg {item.stats.averageScore}</Text>
            </View>
            {item.badges.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {item.badges.slice(0, 6).map((b) => (
                  <View key={b.id} style={{
                    backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8,
                    borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)'
                  }}>
                    <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: '600' }}>{b.id}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>No profiles yet.</Text>
          </View>
        )}
      />
      
    </SafeAreaView>
  );
}
