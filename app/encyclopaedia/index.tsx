import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';

type LinkItem = { title: string; url: string };

const OFFICIAL: LinkItem[] = [
  { title: 'Official Site - 7 Wonders (Repos Production)', url: 'https://www.rprod.com/en/games/7-wonders/' },
];

const WIKI: LinkItem[] = [
  { title: '7 Wonders Wiki - Home', url: 'https://7-wonders.fandom.com/wiki/7_Wonders_Wiki' },
];

function Section({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((link) => (
        <Pressable
          key={link.title}
          onPress={() => Linking.openURL(link.url)}
          style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.linkTitle}>{link.title}</Text>
          <Text style={styles.linkUrl}>{link.url}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function EncyclopaediaScreen() {
  return (
    <Screen>
      <H1>Encyclopaedia</H1>
      <P>Curated rules references, links, and clarifications for quick lookup.</P>

      <Section title="Official Resources" items={OFFICIAL} />
      <Section title="Community Wiki" items={WIKI} />

      <Card variant="muted" style={{ marginTop: theme.spacing.md }}>
        <Text style={styles.sectionTitle}>Credits and Attribution</Text>
        <Text style={styles.bodyText}>
          7 Wonders is a property of Repos Production. This app is an unofficial, fan-made companion
          built for learning and scoring convenience.
        </Text>
        <Text style={[styles.bodyText, { marginTop: theme.spacing.sm }]}
        >
          Rules, terminology, and card data are referenced from official rulebooks and the
          community-maintained 7 Wonders Wiki. Please support the official releases and wiki
          contributors.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.accent,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
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
  bodyText: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
