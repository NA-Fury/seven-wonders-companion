import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppLogo, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import {
  BadgeCheck,
  BookOpen,
  FileText,
  Gamepad2,
  Newspaper,
  Settings,
  Trophy,
  Users,
} from 'lucide-react-native';

type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  route: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const MENU: MenuItem[] = [
  { key: 'new', title: 'New Game', subtitle: 'Start a new session', route: '/new-game', icon: Gamepad2 },
  { key: 'players', title: 'Players', subtitle: 'Profiles and stats', route: '/players', icon: Users },
  { key: 'leaderboards', title: 'Local Leaderboards', subtitle: 'Top scores and records', route: '/leaderboards', icon: Trophy },
  { key: 'badges', title: 'Badges', subtitle: 'Collectibles and achievements', route: '/badges', icon: BadgeCheck },
  { key: 'ency', title: 'Encyclopaedia', subtitle: 'Rules and clarifications', route: '/encyclopaedia', icon: BookOpen },
  { key: 'ref', title: 'Reference and Notes', subtitle: 'FAQs and personal notes', route: '/reference', icon: FileText },
  { key: 'news', title: 'News and Analysis', subtitle: 'Patch notes and updates', route: '/news', icon: Newspaper },
  { key: 'settings', title: 'Settings and Feedback', subtitle: 'Preferences and contact', route: '/settings', icon: Settings },
];

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleText: {
    marginLeft: theme.spacing.md,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
});

export default function Index() {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppLogo size={44} />
          <View style={styles.titleText}>
            <H1>7 Wonders Companion</H1>
            <P>Score faster. Learn deeper. Track progress.</P>
          </View>
        </View>
      </View>
      <FlatList
        data={MENU}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <Pressable
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                styles.menuCard,
                { backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : theme.colors.surface },
              ]}
            >
              <View style={styles.menuIconWrap}>
                <Icon size={20} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
