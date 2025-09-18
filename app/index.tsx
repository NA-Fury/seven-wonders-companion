// app/index.tsx
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuItem = {
  key: string;
  title: string;
  subtitle?: string;
  route: string;
};

const MENU: MenuItem[] = [
  { key: 'new', title: '🎲 New Game', subtitle: 'Start a new session', route: '/new-game' },
  { key: 'players', title: '🧑‍🤝‍🧑 Players', subtitle: 'Profiles & stats', route: '/players' },
  { key: 'leaderboards', title: '🏆 Local Leaderboards', subtitle: 'Top scores & records', route: '/leaderboards' },
  { key: 'badges', title: '🏅 Badges', subtitle: 'Collectibles & records', route: '/badges' },
  { key: 'ency', title: '📖 Encyclopaedia', subtitle: 'Rules & clarifications', route: '/encyclopaedia' },
  { key: 'ref', title: '📚 Reference & Notes', subtitle: 'FAQs and your notes', route: '/reference' },
  { key: 'news', title: '📰 News & Analysis', subtitle: 'Patch Notes and Updates', route: '/news' },
  { key: 'settings', title: '⚙️ Settings & Feedback', subtitle: 'Preferences & contact', route: '/settings' },
];

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
        <Text style={{ color: '#C4A24C', fontSize: 24, fontWeight: '800' }}>7 Wonders Companion</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Score faster. Learn deeper. Track progress.</Text>
      </View>
      <FlatList
        data={MENU}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)',
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.25)',
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
            })}
          >
            <Text style={{ color: '#FEF3C7', fontSize: 18, fontWeight: '700' }}>{item.title}</Text>
            {!!item.subtitle && (
              <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>{item.subtitle}</Text>
            )}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
