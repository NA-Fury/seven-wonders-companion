import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/playerStore';
import { useSetupStore } from '../../store/setupStore';

export default function NewGameScreen() {
  const { getAllProfiles, toggleSelected, selectedForGame, addProfile } = usePlayerStore();
  const { clearPlayers, addExistingPlayer } = useSetupStore();
  const [query, setQuery] = useState('');

  const profiles = useMemo(() => {
    const list = getAllProfiles();
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [getAllProfiles, query, usePlayerStore.getState().profiles]);

  const handleStart = () => {
    const ids = selectedForGame;
    if (ids.length === 0) return;
    // Reset any previous seating/wonders/edifice and clear prior players
    const setup = useSetupStore.getState();
    setup.resetGame();
    clearPlayers();
    ids.forEach((id) => {
      const p = usePlayerStore.getState().profiles[id];
      if (p) addExistingPlayer({ id: p.id, name: p.name, avatar: p.avatar });
    });
    router.push('/setup/expansions');
  };

  const handleQuickAdd = () => {
    if (!query.trim()) return;
    const id = addProfile(query.trim());
    setQuery('');
    if (id) toggleSelected(id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Players</Text>
          <Pressable onPress={() => router.push('/')}
            style={({ pressed }) => ({ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: pressed ? 'rgba(243,231,211,0.06)' : 'transparent' })}>
            <Text style={{ color: '#FEF3C7', fontSize: 18 }}>☰</Text>
          </Pressable>
        </View>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>
          Load players from your profiles and select up to 7.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search or quick add…"
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
          <Pressable
            onPress={handleQuickAdd}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C',
              borderRadius: 12,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 8 }}>
          Selected: {selectedForGame.length}/7
        </Text>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const isSelected = selectedForGame.includes(item.id);
          return (
            <Pressable
              onPress={() => toggleSelected(item.id)}
              style={({ pressed }) => ({
                backgroundColor: isSelected
                  ? 'rgba(196,162,76,0.2)'
                  : pressed
                  ? 'rgba(243,231,211,0.06)'
                  : 'rgba(31,41,55,0.5)',
                borderWidth: 1,
                borderColor: isSelected ? '#C4A24C' : 'rgba(196,162,76,0.25)',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#FEF3C7', fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: isSelected ? '#C4A24C' : 'rgba(243,231,211,0.6)' }}>
                  {isSelected ? 'Selected' : 'Tap to select'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                <Text style={{ color: 'rgba(243,231,211,0.7)' }}>GP {item.stats.gamesPlayed}</Text>
                <Text style={{ color: 'rgba(243,231,211,0.7)' }}>W {item.stats.wins}</Text>
                <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Avg {item.stats.averageScore}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={{ color: 'rgba(243,231,211,0.7)' }}>
              No profiles yet. Use the field above to add players quickly.
            </Text>
          </View>
        )}
      />

      {/* Manage Players quick link */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable onPress={() => router.push('/players')} style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.8 : 1 })}>
          <Text style={{ color: '#C4A24C' }}>Manage Players →</Text>
        </Pressable>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          paddingBottom: 24,
          backgroundColor: '#1C1A1A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(196,162,76,0.25)'
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              // Ensure same height and vertical centering as expansions footer buttons
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.4)',
              backgroundColor: pressed ? 'rgba(243,231,211,0.06)' : 'transparent',
            })}
          >
            <Text style={{ color: '#C4A24C', fontWeight: '700', textAlign: 'center' }}>
              Back to Main Menu
            </Text>
          </Pressable>
          <Pressable
            onPress={handleStart}
            disabled={selectedForGame.length === 0 || selectedForGame.length > 7}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              // Match height and centering with the Back button and expansions footer
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C',
              opacity: selectedForGame.length === 0 || selectedForGame.length > 7 ? 0.5 : 1,
            })}
          >
            <Text style={{ color: '#1C1A1A', fontWeight: '800', textAlign: 'center' }}>
              Continue to Expansions
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
