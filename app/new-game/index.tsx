import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { usePlayerStore } from '../../store/playerStore';
import { useSetupStore } from '../../store/setupStore';

export default function NewGameScreen() {
  const { toggleSelected, selectedForGame, addProfile } = usePlayerStore();
  const profilesMap = usePlayerStore((s) => s.profiles);
  const { clearPlayers, addExistingPlayer } = useSetupStore();
  const [query, setQuery] = useState('');

  const profiles = useMemo(() => {
    const list = Object.values(profilesMap).sort((a, b) => a.name.localeCompare(b.name));
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [profilesMap, query]);

  const handleStart = () => {
    const ids = selectedForGame;
    if (ids.length === 0) return;
    const setup = useSetupStore.getState();
    setup.resetGame();
    clearPlayers();
    ids.forEach((id) => {
      const p = usePlayerStore.getState().profiles[id];
      if (p) addExistingPlayer({ id: p.id, name: p.name, avatar: p.avatar });
    });
    router.push('/setup/expansions');
  };

  const handleQuickAdd = () => {
    if (!query.trim()) return;
    const id = addProfile(query.trim());
    setQuery('');
    if (id) toggleSelected(id);
  };

  const canContinue = selectedForGame.length > 0 && selectedForGame.length <= 7;

  return (
    <Screen>
      <View style={styles.header}>
        <H1>Players</H1>
        <P>Load profiles, add new players, and select up to 7 for this game.</P>
      </View>

      <Card variant="muted">
        <Field
          label="Search or quick add"
          value={query}
          onChangeText={setQuery}
          helperText="Type a name to add a new profile or filter existing players."
          inputProps={{
            placeholder: 'Search or add a player name',
            returnKeyType: 'done',
            onSubmitEditing: handleQuickAdd,
          }}
        />
        <View style={styles.actionRow}>
          <Button title="Add" onPress={handleQuickAdd} />
          <View style={{ flex: 1 }} />
          <Text style={styles.selectedText}>Selected: {selectedForGame.length}/7</Text>
        </View>
      </Card>

      <FlatList
        data={profiles}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const isSelected = selectedForGame.includes(item.id);
          return (
            <Pressable
              onPress={() => toggleSelected(item.id)}
              style={({ pressed }) => [
                styles.playerCard,
                isSelected && styles.playerCardSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.playerHeader}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={[styles.playerAction, isSelected && styles.playerActionSelected]}>
                  {isSelected ? 'Selected' : 'Tap to select'}
                </Text>
              </View>
              <View style={styles.playerStats}>
                <Text style={styles.statText}>GP {item.stats.gamesPlayed}</Text>
                <Text style={styles.statText}>W {item.stats.wins}</Text>
                <Text style={styles.statText}>Avg {item.stats.averageScore}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No profiles yet. Add a name to get started.</Text>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Button title="Back to Main Menu" variant="ghost" size="sm" onPress={() => router.back()} />
          <View style={{ width: theme.spacing.md }} />
          <Button title="Continue to Expansions" size="sm" onPress={handleStart} disabled={!canContinue} />
        </View>
        <Pressable onPress={() => router.push('/players')} style={styles.manageLink}>
          <Text style={styles.manageLinkText}>Manage Players</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  playerCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  playerCardSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.borderStrong,
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
  playerAction: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  playerActionSelected: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  playerStats: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
    fontSize: 12,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,162,76,0.25)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageLink: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  manageLinkText: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
});
