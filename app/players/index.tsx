import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Chip, Field, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { getBadgeById } from '../../data/badges';
import { usePlayerStore } from '../../store/playerStore';

export default function PlayersScreen() {
  const profilesMap = usePlayerStore((s) => s.profiles);
  const addProfile = usePlayerStore((s) => s.addProfile);
  const removeProfile = usePlayerStore((s) => s.removeProfile);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const list = Object.values(profilesMap).sort((a, b) => a.name.localeCompare(b.name));
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [profilesMap, query]);

  const handleQuickAdd = () => {
    const name = query.trim() || `Player ${Object.keys(profilesMap).length + 1}`;
    if (!name) return;
    addProfile(name);
    setQuery('');
  };

  const confirmRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${name}? This profile and its records will be permanently removed from the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeProfile(id) },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <H1>Players</H1>
        <P>Profiles, performance, and badges.</P>
      </View>

      <Card variant="muted">
        <Field
          label="Search or add"
          value={query}
          onChangeText={setQuery}
          helperText="Search existing profiles or add a new player name."
          inputProps={{
            placeholder: 'Search or add a player',
            returnKeyType: 'done',
            onSubmitEditing: handleQuickAdd,
          }}
        />
        <View style={styles.addRow}>
          <Pressable onPress={handleQuickAdd} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </Card>

      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/players/${item.id}`)}
            style={({ pressed }) => [styles.playerCard, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.playerHeader}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Pressable onPress={() => confirmRemove(item.id, item.name)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
            <View style={styles.playerStats}>
              <Text style={styles.statText}>Games {item.stats.gamesPlayed}</Text>
              <Text style={styles.statText}>Wins {item.stats.wins}</Text>
              <Text style={styles.statText}>Win% {Math.round(item.stats.winRate * 100)}%</Text>
              <Text style={styles.statText}>Avg {item.stats.averageScore}</Text>
            </View>
            {item.badges.length > 0 && (
              <View style={styles.badgesRow}>
                {item.badges.slice(0, 6).map((b) => {
                  const meta = getBadgeById(b.id);
                  const label = meta ? `${meta.icon} ${meta.name}` : b.id;
                  return <Chip key={b.id} label={label} active />;
                })}
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No profiles yet. Add a name to get started.</Text>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  playerCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  removeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  playerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  statText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
    marginBottom: 4,
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
