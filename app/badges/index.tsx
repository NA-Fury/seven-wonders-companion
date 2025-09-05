import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/playerStore';
import { BADGES } from '../../data/badges';

export default function BadgesScreen() {
  const profiles = usePlayerStore((s) => s.profiles);
  // Aggregate unlocked badges across all players for a fun overview
  const unlocked = new Set<string>();
  Object.values(profiles).forEach((p) => p.badges.forEach((b) => unlocked.add(b.id)));

  const items = BADGES.map((b) => ({ ...b, unlocked: unlocked.has(b.id) }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Badges</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Collectibles unlocked through play.</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, backgroundColor: 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: item.unlocked ? 'rgba(196,162,76,0.6)' : 'rgba(196,162,76,0.2)', borderRadius: 16, padding: 12, marginTop: 8, opacity: item.unlocked ? 1 : 0.5 }}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</Text>
            <Text style={{ color: '#FEF3C7', fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 2, fontSize: 12 }}>{item.description}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

