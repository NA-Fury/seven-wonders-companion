// components/scoring/QuickScoreScreen.tsx
import { router } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import CategoryDetailModal from './CategoryDetailModal';

type ScoreCategory =
  | 'wonder'
  | 'treasure'
  | 'military'
  | 'civilian'
  | 'commercial'
  | 'science'
  | 'guilds'
  | 'cities'
  | 'leaders'
  | 'navy'
  | 'island'
  | 'edifice';

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  wonder: 'Wonder',
  treasure: 'Treasure',
  military: 'Military',
  civilian: 'Civilian',
  commercial: 'Commercial',
  science: 'Science',
  guilds: 'Guilds',
  cities: 'Cities',
  leaders: 'Leaders',
  navy: 'Navy',
  island: 'Island',
  edifice: 'Edifice',
};

const CATEGORY_ICONS: Record<ScoreCategory, string> = {
  wonder: '🏛️',
  treasure: '💰',
  military: '⚔️',
  civilian: '🏗️',
  commercial: '🪙',
  science: '🔬',
  guilds: '👑',
  cities: '🏴',
  leaders: '👤',
  navy: '⚓',
  island: '🏝️',
  edifice: '🗿',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E1A' },
  header: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(196, 162, 76, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playerNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.4)',
  },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: '#C4A24C', fontSize: 20, fontWeight: 'bold' },
  playerInfo: { flex: 1, marginHorizontal: 12, alignItems: 'center' },
  playerName: { color: '#FEF3C7', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  playerMeta: { color: 'rgba(243, 231, 211, 0.6)', fontSize: 11, marginTop: 2 },
  wonderInfo: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  wonderText: { color: '#C4A24C', fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 140 },
  sectionTitle: {
    color: 'rgba(196, 162, 76, 0.7)',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  card: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  cardBody: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: { color: '#F3E7D3', fontWeight: '700' },
  valueRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: { color: '#C4A24C', fontSize: 18, fontWeight: '800' },
  adjustRow: { marginTop: 8, flexDirection: 'row', gap: 8 },
  adjustButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  adjustMinus: {
    backgroundColor: 'rgba(107,114,128,0.2)',
    borderColor: 'rgba(107,114,128,0.4)',
  },
  adjustPlus: { backgroundColor: 'rgba(196,162,76,0.15)', borderColor: 'rgba(196,162,76,0.4)' },
  adjustText: { fontSize: 16, fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)',
  },
  proceed: {
    backgroundColor: '#C4A24C',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: { color: '#1C1A1A', fontSize: 16, fontWeight: '900' },
});

const CategoryCard = memo(function CategoryCard({
  playerId,
  category,
  onOpenDetails,
}: {
  playerId: string;
  category: ScoreCategory;
  onOpenDetails: (c: ScoreCategory) => void;
}) {
  // Narrow subscriptions — one primitive + one action
  const points =
    useScoringStore((s) => (s.playerScores[playerId]?.[`${category}Points` as const] as number) ?? 0);
  const setQuick = useScoringStore((s) => s.updateQuickScore);

  const dec = useCallback(() => setQuick(playerId, category, Math.max(0, points - 1)), [playerId, category, points, setQuick]);
  const inc = useCallback(() => setQuick(playerId, category, points + 1), [playerId, category, points, setQuick]);

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{CATEGORY_LABELS[category]}</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueText}>{points}</Text>
          <TouchableOpacity
            onPress={() => onOpenDetails(category)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: Platform.OS === 'ios' ? 6 : 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.4)',
              backgroundColor: 'rgba(196,162,76,0.1)',
            }}
          >
            <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: '700' }}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adjustRow}>
          <TouchableOpacity style={[styles.adjustButton, styles.adjustMinus]} onPress={dec}>
            <Text style={[styles.adjustText, { color: '#F3E7D3' }]}>–</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.adjustButton, styles.adjustPlus]} onPress={inc}>
            <Text style={[styles.adjustText, { color: '#C4A24C' }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function QuickScoreScreen() {
  const insets = useSafeAreaInsets();

  // Setup store — avoid tuple + equality fn; keep it simple & typed
  const getOrderedPlayers = useSetupStore((s) => s.getOrderedPlayers);
  const expansions = useSetupStore((s) => s.expansions);
  const players = useMemo(() => getOrderedPlayers(), [getOrderedPlayers]);

  // Scoring store — separate subscriptions (no second-arg equality)
  const index = useScoringStore((s) => s.currentPlayerIndex);
  const setIndex = useScoringStore((s) => s.setCurrentPlayer);
  const getPlayerTotal = useScoringStore((s) => s.getPlayerTotal);

  const [detail, setDetail] = useState<{ open: boolean; category?: ScoreCategory }>({ open: false });

  const activePlayer = players[index];
  const playerId = activePlayer?.id;

  const categories: ScoreCategory[] = useMemo(() => {
    const base: ScoreCategory[] = ['wonder', 'treasure', 'military', 'civilian', 'commercial', 'science', 'guilds'];
    if (expansions?.cities) base.push('cities');
    if (expansions?.leaders) base.push('leaders');
    if (expansions?.armada) base.push('navy', 'island');
    if (expansions?.edifice) base.push('edifice');
    return base;
  }, [expansions]);

  const proceedToResults = useCallback(() => {
    router.push({ pathname: '/scoring', params: { view: 'results' } });
  }, []);

  const prev = useCallback(() => setIndex(Math.max(0, index - 1)), [index, setIndex]);
  const next = useCallback(() => setIndex(Math.min(players.length - 1, index + 1)), [index, players.length, setIndex]);

  const openDetails = useCallback((c: ScoreCategory) => setDetail({ open: true, category: c }), []);
  const closeDetails = useCallback(() => setDetail({ open: false }), []);

  const totalForActive = useMemo(() => {
    if (!playerId) return { total: 0, isComplete: false };
    return getPlayerTotal(playerId, expansions);
  }, [playerId, expansions, getPlayerTotal]);

  if (!activePlayer) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#F3E7D3' }}>No players found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.playerNavigation}>
          <TouchableOpacity
            onPress={prev}
            disabled={index === 0}
            style={[styles.navButton, index === 0 && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>{'‹'}</Text>
          </TouchableOpacity>

          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{activePlayer.name}</Text>
            <Text style={styles.playerMeta}>
              Player {index + 1} of {players.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={next}
            disabled={index === players.length - 1}
            style={[styles.navButton, index === players.length - 1 && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>{'›'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick scoring</Text>
        <View style={styles.grid}>
          {categories.map((c) => (
            <CategoryCard key={c} playerId={playerId} category={c} onOpenDetails={openDetails} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity onPress={proceedToResults} style={styles.proceed}>
          <Text style={styles.proceedText}>
            View Results • {totalForActive.total} pts {totalForActive.isComplete ? '✓' : '…'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={detail.open} transparent animationType="slide" onRequestClose={closeDetails}>
        {detail.category && playerId && (
          <CategoryDetailModal
            playerId={playerId}
            category={{
              id: detail.category,
              title: CATEGORY_LABELS[detail.category],
              icon: CATEGORY_ICONS[detail.category],
            }}
            onClose={closeDetails}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}
