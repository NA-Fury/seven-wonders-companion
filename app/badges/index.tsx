import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { usePlayerStore } from '../../store/playerStore';
import { BADGES } from '../../data/badges';

export default function BadgesScreen() {
  const profiles = usePlayerStore((s) => s.profiles);
  const unlocked = new Set<string>();
  Object.values(profiles).forEach((p) => p.badges.forEach((b) => unlocked.add(b.id)));

  const items = BADGES.map((b) => ({ ...b, unlocked: unlocked.has(b.id) }));

  return (
    <Screen>
      <View style={styles.header}>
        <H1>Badges</H1>
        <P>Collectibles unlocked through play.</P>
      </View>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.badgeCard,
              item.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
            ]}
          >
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>{item.icon}</Text>
            </View>
            <Text style={styles.badgeTitle}>{item.name}</Text>
            <Text style={styles.badgeDescription}>{item.description}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md,
  },
  badgeCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: 8,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  badgeUnlocked: {
    borderColor: theme.colors.borderStrong,
  },
  badgeLocked: {
    borderColor: theme.colors.border,
    opacity: 0.6,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeIconText: {
    fontSize: 28,
    lineHeight: 40,
  },
  badgeTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  badgeDescription: {
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
});
