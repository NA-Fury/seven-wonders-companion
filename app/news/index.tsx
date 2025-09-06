import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LINKS = [
  { label: 'Report bugs → GitHub Issues', url: 'https://github.com/NA-Fury/seven-wonders-companion/issues' },
  { label: 'Share ideas → GitHub Discussions', url: 'https://github.com/NA-Fury/seven-wonders-companion/discussions' },
  { label: 'Email feedback', url: 'mailto:naziha2305@gmail.com' },
  { label: 'My GitHub Profile', url: 'https://github.com/NA-Fury' },
];

export default function NewsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>News & Analysis</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>
          Announcements, patch notes, meta-analysis — and ways to get involved.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ backgroundColor: 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 16, padding: 14 }}>
          <Text style={{ color: '#FEF3C7', fontWeight: '800', fontSize: 16 }}>Hello everyone 👋</Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 8, lineHeight: 22 }}>
            This is my first-ever public app launch — a smart scoring and analysis companion app for 7 Wonders and its expansions. It’s free, open-source, and still very much a work in progress. Expect bugs (especially around Armada + Leaders scoring) — please try it, break it, and tell me where it fails!
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 10, lineHeight: 22 }}>
            What makes it different:
            {'\n'}• Handles base + expansions
            {'\n'}• Allows saves & history
            {'\n'}• Offers deeper analysis of results
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 10, lineHeight: 22 }}>
            Why I built this: during family games, my mum kept beating us at 7 Wonders 🤯. I wanted to track and understand how she kept pulling it off. That curiosity grew into… this companion (unofficial, fan-based) app.
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 10, lineHeight: 22 }}>
            Use it however detailed (or not) you want — it’s about fun, learning, and building something the community can grow together.
          </Text>
          <Text style={{ color: '#C4A24C', fontWeight: '700', marginTop: 12 }}>What you can do now</Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 6, lineHeight: 22 }}>
            • Try it out{\n}
            • Report bugs → GitHub Issues{\n}
            • Share feedback / ideas → GitHub Discussions
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 10, lineHeight: 22 }}>
            If there’s interest, I’d love to explore online leaderboards and deeper meta-analysis down the road.
          </Text>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginTop: 10, lineHeight: 22 }}>
            Be gentle — it’s my first app launch (with lots of AI help 🙈). Criticism welcome; positive feedback appreciated 💙.
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          {LINKS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => Linking.openURL(item.url)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)',
                borderWidth: 1,
                borderColor: 'rgba(196,162,76,0.25)',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
              })}
            >
              <Text style={{ color: '#FEF3C7', fontWeight: '700' }}>{item.label}</Text>
              <Text style={{ color: 'rgba(243,231,211,0.6)', fontSize: 12, marginTop: 4 }}>{item.url}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: 'rgba(243,231,211,0.7)' }}>
            News & analysis features: coming soon.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
