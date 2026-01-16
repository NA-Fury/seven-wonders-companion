import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, Field, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { getBadgeById } from '../../data/badges';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { usePlayerStore, type PlayerProfile } from '../../store/playerStore';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profiles = usePlayerStore((s) => s.profiles);
  const updateProfile = usePlayerStore((s) => s.updateProfile);
  const removeProfile = usePlayerStore((s) => s.removeProfile);

  const profile: PlayerProfile | undefined = profiles[id!];
  const [name, setName] = useState(profile?.name || '');

  const neighborsList = useMemo(() => {
    const counts = profile?.stats.neighborCounts || {};
    return Object.entries(counts)
      .filter(([pid]) => pid !== profile?.id)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, count]) => ({
        id: pid,
        name: profiles[pid]?.name || 'Unknown',
        count,
      }));
  }, [profile?.stats.neighborCounts, profile?.id, profiles]);

  const wondersPlayed = useMemo(() => {
    const played = profile?.stats.wondersPlayed || {};
    const playedArr = Object.entries(played)
      .map(([wid, data]) => ({
        id: wid,
        name: WONDERS_DATABASE.find((w) => w.id === wid)?.name || wid,
        day: data.day || 0,
        night: data.night || 0,
        total: data.total || 0,
      }))
      .sort((a, b) => b.total - a.total);
    const notPlayed = WONDERS_DATABASE
      .filter((w) => !played[w.id])
      .map((w) => w.name)
      .sort((a, b) => a.localeCompare(b));
    const favorite = playedArr[0];
    return { playedArr, notPlayed, favorite };
  }, [profile?.stats.wondersPlayed]);

  const categories = useMemo(() => {
    const avg = profile?.stats.categoryAverages || {};
    const entries = Object.entries(avg).filter(([, v]) => typeof v === 'number') as [string, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const strongest = sorted.slice(0, 3);
    const weakest = sorted.slice(-3).reverse();
    return { strongest, weakest, all: sorted };
  }, [profile?.stats.categoryAverages]);

  const expansionsUsage = useMemo(() => {
    const e = profile?.stats.expansionsUseCounts || { leaders: 0, cities: 0, armada: 0, edifice: 0, baseOnly: 0 };
    return [
      { key: 'Base', value: e.baseOnly || 0 },
      { key: 'Leaders', value: e.leaders || 0 },
      { key: 'Cities', value: e.cities || 0 },
      { key: 'Armada', value: e.armada || 0 },
      { key: 'Edifice', value: e.edifice || 0 },
    ];
  }, [profile?.stats.expansionsUseCounts]);

  const displayBadges = useMemo(() => {
    const resolveName = (badgeId: string) => {
      const fromDb = getBadgeById(badgeId);
      if (fromDb) return { name: fromDb.name, icon: fromDb.icon };
      if (badgeId.startsWith('wonder_victor_')) {
        const wid = badgeId.replace('wonder_victor_', '');
        const w = WONDERS_DATABASE.find((x) => x.id.toLowerCase() === wid.toLowerCase());
        if (w) return { name: `${w.name} Victor`, icon: 'W' };
      }
      const human = badgeId
        .split('_')
        .map((s) => (s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join(' ');
      return { name: human, icon: 'B' };
    };

    const badgesArr = profile?.badges || [];
    return badgesArr.map((b) => {
      const { name: badgeName, icon } = resolveName(b.id);
      return { id: b.id, name: badgeName, icon, unlockedAt: b.unlockedAt };
    });
  }, [profile?.badges]);

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Profile not found.</Text>
      </Screen>
    );
  }

  const saveRename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === profile.name) return;
    updateProfile(profile.id, { name: trimmed });
  };

  const confirmRemoveProfile = () => {
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${profile.name}? This profile and its records will be permanently removed from the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { removeProfile(profile.id); router.back(); } },
      ]
    );
  };

  const StatsRow = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statsRow}>
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={styles.statsValue}>{`${value}`}</Text>
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back</Text>
        </Pressable>
        <H1>Player Profile</H1>
        <P>Edit name and review performance.</P>

        <Card variant="muted">
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            helperText="Update the display name for this profile."
            inputProps={{
              placeholder: 'Player name',
              returnKeyType: 'done',
              onSubmitEditing: saveRename,
            }}
          />
          <Pressable onPress={saveRename} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Summary</Text>
          <StatsRow label="Games Played" value={profile.stats.gamesPlayed} />
          <StatsRow label="Wins" value={profile.stats.wins} />
          <StatsRow label="Runner Up" value={profile.stats.runnerUp ?? 0} />
          <StatsRow label="Third Place" value={profile.stats.thirdPlace ?? 0} />
          <StatsRow label="Win %" value={`${Math.round((profile.stats.winRate || 0) * 100)}%`} />
          <StatsRow label="Average" value={profile.stats.averageScore} />
          {profile.stats.highestScore && (
            <StatsRow label="High Score" value={`${profile.stats.highestScore.score} (Game ${profile.stats.highestScore.gameId})`} />
          )}
          {profile.stats.lowestScore && (
            <StatsRow label="Low Score" value={`${profile.stats.lowestScore.score} (Game ${profile.stats.lowestScore.gameId})`} />
          )}
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Wonders Played</Text>
          {wondersPlayed.favorite && (
            <Text style={styles.sectionText}>Favorite: {wondersPlayed.favorite.name} ({wondersPlayed.favorite.total})</Text>
          )}
          {wondersPlayed.playedArr.length > 0 ? (
            <View>
              {wondersPlayed.playedArr.map((w) => (
                <View key={w.id} style={styles.statsRow}>
                  <Text style={styles.statsLabel}>{w.name}</Text>
                  <Text style={styles.statsValue}>Day {w.day} / Night {w.night} / Total {w.total}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionMuted}>No wonders played yet.</Text>
          )}
          {wondersPlayed.notPlayed.length > 0 && (
            <View style={{ marginTop: theme.spacing.sm }}>
              <Text style={styles.sectionMuted}>Not yet played:</Text>
              <Text style={styles.sectionMuted}>{wondersPlayed.notPlayed.join(', ')}</Text>
            </View>
          )}
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Strategy Profile</Text>
          {categories.all.length > 0 ? (
            <>
              <Text style={styles.sectionText}>Strongest</Text>
              {categories.strongest.map(([k, v]) => (
                <Text key={k} style={styles.sectionText}>- {capitalize(k)}: {v}</Text>
              ))}
              <View style={{ height: theme.spacing.sm }} />
              <Text style={styles.sectionText}>Weakest</Text>
              {categories.weakest.map(([k, v]) => (
                <Text key={k} style={styles.sectionMuted}>- {capitalize(k)}: {v}</Text>
              ))}
            </>
          ) : (
            <Text style={styles.sectionMuted}>No category data yet.</Text>
          )}
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Frequent Neighbors</Text>
          {neighborsList.length > 0 ? (
            neighborsList.map((n) => (
              <Pressable key={n.id} onPress={() => router.push(`/players/${n.id}`)} style={styles.neighborRow}>
                <Text style={styles.sectionText}>{n.name}</Text>
                <Text style={styles.sectionMuted}>{n.count}x</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.sectionMuted}>No neighbor data yet.</Text>
          )}
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Expansions Usage</Text>
          <View style={styles.chipRow}>
            {expansionsUsage.map((e) => (
              <Chip key={e.key} label={`${e.key}: ${e.value}`} active={e.value > 0} />
            ))}
          </View>
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Badges ({displayBadges.length})</Text>
          {displayBadges.length > 0 ? (
            <View style={styles.chipRow}>
              {displayBadges.map((b) => (
                <Chip key={b.id} label={`${b.icon} ${b.name}`} active />
              ))}
            </View>
          ) : (
            <Text style={styles.sectionMuted}>No badges yet.</Text>
          )}
        </Card>

        <Pressable onPress={confirmRemoveProfile} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Remove Player</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  backLink: {
    marginBottom: theme.spacing.sm,
  },
  backLinkText: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionMuted: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statsLabel: {
    color: theme.colors.textSecondary,
  },
  statsValue: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  neighborRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  dangerButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
});
