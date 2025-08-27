import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import QuickCategoryItem from './QuickCategoryItem';
import { calculateCategoryPoints, clearCategoryPointsCache } from './scoringCalculations';

const DetailModal = React.lazy(() => import('./CategoryDetailModal'));

interface CategoryConfig {
  id: string;
  title: string;
  icon: string;
  visible: boolean;
  isScoring: boolean; // New field to distinguish scoring vs analysis categories
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1A1A' },
  compactHeader: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 6 : 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playerSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerBadge: {
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  playerName: { color: '#C4A24C', fontSize: 14, fontWeight: 'bold' },
  navButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(196, 162, 76, 0.3)',
    alignItems: 'center', justifyContent: 'center'
  },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: '#C4A24C', fontSize: 16, fontWeight: 'bold' },
  gameInfo: { fontSize: 10, color: 'rgba(243, 231, 211, 0.6)' },
  scrollContent: { padding: 12, paddingBottom: 100 },
  motivationalCard: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)',
  },
  motivationalText: { color: '#FEF3C7', fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  totalCard: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderRadius: 16, padding: 16, marginTop: 12,
    borderWidth: 2, borderColor: '#C4A24C', alignItems: 'center'
  },
  totalLabel: { color: 'rgba(243,231,211,0.8)', fontSize: 12, marginBottom: 4 },
  totalValue: { color: '#C4A24C', fontSize: 32, fontWeight: '900' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.98)',
    borderTopWidth: 1, borderTopColor: 'rgba(196,162,76,0.2)',
    padding: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 8
  },
  footerButtons: { flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryButton: { backgroundColor: '#C4A24C' },
  secondaryButton: { backgroundColor: 'rgba(107,114,128,0.3)' },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  primaryButtonText: { color: '#1C1A1A' },
  secondaryButtonText: { color: '#9CA3AF' },
  
  analysisSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(196,162,76,0.2)',
  },
  analysisSectionTitle: { 
    color: '#C4A24C', 
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },

  // Category tile styles (used by QuickCategoryItem)
  categoryCard: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(196,162,76,0.15)',
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  categoryIcon: { fontSize: 18, marginRight: 6 },
  categoryTitle: { color: '#F3E7D3', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  pointsDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pointsValue: { fontSize: 26, fontWeight: '900', color: '#C4A24C' },
  detailButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(196,162,76,0.18)',
    borderRadius: 8
  },
  detailButtonText: { color: '#C4A24C', fontSize: 12, fontWeight: '600' },
});

export default function QuickScoreScreen() {
  const { players, seating, expansions, wonders } = useSetupStore();
  const { initializeScores, updateScore, isInitialized, playerScores } = useScoringStore();

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ready, setReady] = useState(false);

  const orderedPlayers = useMemo(() => {
    if (!players?.length) return [];
    if (!seating?.length) return players;
    return seating.map(id => players.find(p => p.id === id)).filter(Boolean) as typeof players;
  }, [players, seating]);

  useEffect(() => {
    if (!isInitialized && orderedPlayers.length > 0) {
      initializeScores(orderedPlayers, wonders);
    }
    setReady(isInitialized);
  }, [isInitialized, orderedPlayers, initializeScores, wonders]);

  const currentPlayer = orderedPlayers[currentPlayerIndex];
  const currentScore = currentPlayer ? playerScores[currentPlayer.id] : undefined;

  const categories: CategoryConfig[] = useMemo(() => [
    { id: 'wonder', title: 'Wonder', icon: '🏛️', visible: true, isScoring: true },
    { id: 'treasure', title: 'Treasure', icon: '💰', visible: true, isScoring: true },
    { id: 'military', title: 'Military', icon: '⚔️', visible: true, isScoring: true },
    { id: 'civilian', title: 'Civilian', icon: '🏛️', visible: true, isScoring: true },
    { id: 'commercial', title: 'Commercial', icon: '🪙', visible: true, isScoring: true },
    { id: 'science', title: 'Science', icon: '🔬', visible: true, isScoring: true },
    { id: 'guilds', title: 'Guilds', icon: '👑', visible: true, isScoring: true },
    { id: 'cities', title: 'Cities', icon: '🏴', visible: expansions?.cities, isScoring: true },
    { id: 'leaders', title: 'Leaders', icon: '👤', visible: expansions?.leaders, isScoring: true },
    { id: 'navy', title: 'Navy', icon: '⚓', visible: expansions?.armada, isScoring: true },
    { id: 'islands', title: 'Islands', icon: '🏝️', visible: expansions?.armada, isScoring: true },
    { id: 'edifice', title: 'Edifice', icon: '🗿', visible: expansions?.edifice, isScoring: true },
    // Analysis categories (non-scoring)
    { id: 'resources', title: 'Resources', icon: '📦', visible: true, isScoring: false },
    { id: 'bonus', title: 'Bonus Analysis', icon: '🔍', visible: true, isScoring: false },
  ], [expansions]);

  const scoringCategories = categories.filter(c => c.visible && c.isScoring);
  const analysisCategories = categories.filter(c => c.visible && !c.isScoring);

  const totalPoints = useMemo(() => {
    if (!ready || !currentPlayer || !currentScore) return 0;
    let sum = 0;
    
    // Only sum scoring categories
    scoringCategories.forEach(cat => {
      const points = calculateCategoryPoints(
        currentPlayer.id,
        cat.id,
        currentScore,
        { wonder: wonders?.[currentPlayer.id], expansions },
        true
      );
      sum += points;
    });
    
    return sum;
  }, [ready, currentPlayer, currentScore, scoringCategories, wonders, expansions]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  }, []);

  const handleQuickEdit = useCallback(
    (categoryId: string, delta: number) => {
      if (!currentPlayer || !currentScore) return;
      
      const fieldName = `${categoryId}DirectPoints`;
      const currentValue = (currentScore as any)[fieldName] || 0;
      const newValue = Math.max(0, currentValue + delta);
      
      updateScore(currentPlayer.id, fieldName, newValue);
      
      // Only clear cache after actual update
      requestAnimationFrame(() => {
        clearCategoryPointsCache();
      });
    },
    [currentPlayer, currentScore, updateScore]
  );

  const navigatePlayer = useCallback((dir: 'prev' | 'next') => {
    setCurrentPlayerIndex(prev => {
      if (dir === 'prev' && prev > 0) return prev - 1;
      if (dir === 'next' && prev < orderedPlayers.length - 1) return prev + 1;
      return prev;
    });
  }, [orderedPlayers.length]);

  const allPlayersScored = useCallback(() => {
    return orderedPlayers.every(p => {
      const s = p && playerScores[p.id];
      return s && Object.keys(s).some(k => k.endsWith('DirectPoints') && (s as any)[k] > 0);
    });
  }, [orderedPlayers, playerScores]);

  if (!ready || !currentPlayer || !currentScore) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#C4A24C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.compactHeader}>
        <View style={styles.headerRow}>
          <View style={styles.playerSelector}>
            <TouchableOpacity
              onPress={() => navigatePlayer('prev')}
              disabled={currentPlayerIndex === 0}
              style={[styles.navButton, currentPlayerIndex === 0 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.playerBadge}>
              <Text style={styles.playerName}>{currentPlayer.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigatePlayer('next')}
              disabled={currentPlayerIndex === orderedPlayers.length - 1}
              style={[
                styles.navButton,
                currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonDisabled
              ]}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.gameInfo}>{currentPlayerIndex + 1}/{orderedPlayers.length}</Text>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={[...scoringCategories, ...analysisCategories]}
        keyExtractor={c => c.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.motivationalCard}>
            <Text style={styles.motivationalText}>
              💫 Enter quick totals or tap {'"'}Details{'"'} for more!
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TOTAL SCORE</Text>
            <Text style={styles.totalValue}>{totalPoints}</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          // Add separator before analysis categories
          if (!item.isScoring && index === scoringCategories.length) {
            return (
              <>
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>📊 Deep Analysis (Optional)</Text>
                </View>
                <QuickCategoryItem
                  playerId={currentPlayer.id}
                  category={item}
                  wonder={wonders?.[currentPlayer.id]}
                  expansions={expansions}
                  styles={styles}
                  onDetails={handleCategoryPress}
                  onQuickEdit={handleQuickEdit}
                  isAnalysis={!item.isScoring}
                />
              </>
            );
          }
          
          return (
            <QuickCategoryItem
              playerId={currentPlayer.id}
              category={item}
              wonder={wonders?.[currentPlayer.id]}
              expansions={expansions}
              styles={styles}
              onDetails={handleCategoryPress}
              onQuickEdit={handleQuickEdit}
              isAnalysis={!item.isScoring}
            />
          );
        }}
        initialNumToRender={8}
        maxToRenderPerBatch={4}
        windowSize={10}
        removeClippedSubviews={true}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentPlayerIndex > 0 && (
            <TouchableOpacity
              onPress={() => navigatePlayer('prev')}
              style={[styles.footerButton, styles.secondaryButton]}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>← Previous</Text>
            </TouchableOpacity>
          )}
          {currentPlayerIndex < orderedPlayers.length - 1 && (
            <TouchableOpacity
              onPress={() => navigatePlayer('next')}
              style={[styles.footerButton, styles.primaryButton]}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Next →</Text>
            </TouchableOpacity>
          )}
          {currentPlayerIndex === orderedPlayers.length - 1 && allPlayersScored() && (
            <TouchableOpacity
              onPress={() => Alert.alert('🎉 Complete!', 'All players have been scored!')}
              style={[styles.footerButton, { backgroundColor: '#22C55E' }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>🏆 Results</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <React.Suspense fallback={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#C4A24C" />
          </View>
        }>
          {selectedCategory && currentPlayer && (
            <DetailModal
              playerId={currentPlayer.id}
              categoryId={selectedCategory}
              onClose={() => setModalVisible(false)}
            />
          )}
        </React.Suspense>
      </Modal>
    </SafeAreaView>
  );
}