import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LinkItem = { title: string; url: string };

const OFFICIAL: LinkItem[] = [
  { title: 'Official Site — 7 Wonders (Repos Production)', url: 'https://www.rprod.com/en/games/7-wonders/' },
];

const WIKI: LinkItem[] = [
  { title: '7 Wonders Wiki — Home', url: 'https://7-wonders.fandom.com/wiki/7_Wonders_Wiki' }
];

function Section({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: '#C4A24C', fontWeight: '800', marginBottom: 8 }}>{title}</Text>
      {items.map((link) => (
        <Pressable
          key={link.title}
          onPress={() => Linking.openURL(link.url)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)',
            borderWidth: 1,
            borderColor: 'rgba(196,162,76,0.25)',
            borderRadius: 16,
            padding: 14,
            marginBottom: 10,
          })}
        >
          <Text style={{ color: '#FEF3C7', fontWeight: '700' }}>{link.title}</Text>
          <Text style={{ color: 'rgba(243,231,211,0.6)', fontSize: 12, marginTop: 4 }}>{link.url}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function EncyclopaediaScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Encyclopaedia</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>
          Curated rules references, links, and clarifications for quick lookup.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Section title="Official Resources" items={OFFICIAL} />
        <Section title="Community Wiki" items={WIKI} />

        <View style={{ marginTop: 16, backgroundColor: 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 16, padding: 14 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '700' }}>Credits & Attribution</Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)', marginTop: 6, lineHeight: 20 }}>
            7 Wonders is a property of Repos Production. This app is an unofficial, fan-made companion built for learning and scoring convenience.
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.8)', marginTop: 6, lineHeight: 20 }}>
            Rules, terminology, and card data referenced from the official rulebooks and the community-maintained 7 Wonders Wiki. Please support the official releases and the wiki contributors.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
