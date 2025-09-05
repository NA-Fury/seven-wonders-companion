import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LINKS = [
  { title: 'Base Rules (PDF)', url: 'https://www.rprod.com/downloads/en/7wonders_rulebook.pdf' },
  { title: 'Leaders Expansion', url: 'https://www.rprod.com' },
  { title: 'Cities Expansion', url: 'https://www.rprod.com' },
  { title: 'Armada Expansion', url: 'https://www.rprod.com' },
  { title: 'Edifice Expansion', url: 'https://www.rprod.com' },
];

export default function EncyclopaediaScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Encyclopaedia</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Curated rules references and clarifications.</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        {LINKS.map((link) => (
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
    </SafeAreaView>
  );
}

