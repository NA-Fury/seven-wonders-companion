import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';

const LINKS = [
  { label: 'Report bugs - GitHub Issues', url: 'https://github.com/NA-Fury/seven-wonders-companion/issues' },
  { label: 'Share ideas - GitHub Discussions', url: 'https://github.com/NA-Fury/seven-wonders-companion/discussions' },
  { label: 'Email feedback', url: 'mailto:naziha2305@gmail.com' },
  { label: 'My GitHub Profile', url: 'https://github.com/NA-Fury' },
];

export default function NewsScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <H1>News and Analysis</H1>
        <P>Announcements, patch notes, meta-analysis, and ways to get involved.</P>

        <Card variant="muted" style={{ marginTop: theme.spacing.md }}>
          <Text style={styles.cardTitle}>Hello everyone</Text>
          <Text style={styles.bodyText}>
            This is my first public app launch - a scoring and analysis companion for 7 Wonders and
            its expansions. It is free, open-source, and still a work in progress. Expect bugs,
            especially around Armada and Leaders scoring. Please try it and let me know where it fails.
          </Text>
          <Text style={[styles.bodyText, { marginTop: theme.spacing.sm }]}>
            What makes it different:
          </Text>
          <Text style={styles.bodyText}>- Handles base and expansions</Text>
          <Text style={styles.bodyText}>- Saves games and history</Text>
          <Text style={styles.bodyText}>- Offers deeper analysis of results</Text>
          <Text style={[styles.bodyText, { marginTop: theme.spacing.sm }]}
          >
            Use it as detailed or lightweight as you want - it is about fun, learning, and building
            something the community can grow together.
          </Text>
        </Card>

        <View style={{ marginTop: theme.spacing.md }}>
          {LINKS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => Linking.openURL(item.url)}
              style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.linkTitle}>{item.label}</Text>
              <Text style={styles.linkUrl}>{item.url}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footerText}>News and analysis features: coming soon.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  linkCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  linkTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  linkUrl: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  footerText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
