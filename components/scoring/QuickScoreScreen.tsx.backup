// components/scoring/QuickScoreScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import CategoryDetailModal from './CategoryDetailModal';
import QuickCategoryItem from './QuickCategoryItem';
import { calculateCategoryPoints } from './scoringCalculations';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A1A',
  },
  compactHeader: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerBadge: {
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  playerName: {
    color: '#C4A24C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 162, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#C4A24C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameInfo: {
    fontSize: 10,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 100,
  },
  motivationalCard: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  motivationalText: {
    color: '#FEF3C7',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.25)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    flex: 1,
    color: '#C4A24C',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FEF3C7',
  },
  detailButton: {
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailButtonText: {
    color: '#C4A24C',
    fontSize: 10,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#C4A24C',
    alignItems: 'center',
  },
  totalLabel: {
    color: 'rgba(243, 231, 211, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  totalValue: {
    color: '#C4A24C',
    fontSize: 32,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#C4A24C',
  },
  secondaryButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#1C1A1A',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
  },
});

interface CategoryConfig {
  id: string;
  title: string;
  icon: string;
  color?: string;
  visible: boolean;
}

export default function QuickScoreScreen() {
  const { players, seating, expansions, wonders } = useSetupStore();
  const updateScore = useScoringStore(state => state.updateScore);
  const initializeScores = useScoringStore(state => state.initializeScores);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Get ordered players
  const orderedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map(id => players.find(p => p.id === id)).filter(Boolean);
  }, [players, seating]);

  const currentPlayer = orderedPlayers[currentPlayerIndex];
  const currentScore = useScoringStore(
    useCallback(
      state => (currentPlayer ? state.playerScores[currentPlayer.id] : null),
      [currentPlayer?.id]
    )
  );

  // Initialize scores on mount
  React.useEffect(() => {
    if (orderedPlayers.length > 0) {
      initializeScores(orderedPlayers as any, wonders);
    }
  }, [orderedPlayers, wonders, initializeScores]);

  // Define categories based on expansions
  const categories: CategoryConfig[] = useMemo(() => [
    { id: 'wonder', title: 'Wonder', icon: '🏛️', visible: true },
    { id: 'treasure', title: 'Treasure', icon: '💰', visible: true },
    { id: 'military', title: 'Military', icon: '⚔️', visible: true },
    { id: 'civilian', title: 'Civilian', icon: '🏛️', color: '#3B82F6', visible: true },
    { id: 'commercial', title: 'Commercial', icon: '🪙', color: '#F59E0B', visible: true },
    { id: 'science', title: 'Science', icon: '🔬', color: '#10B981', visible: true },
    { id: 'guilds', title: 'Guilds', icon: '👑', color: '#8B5CF6', visible: true },
    { id: 'resources', title: 'Resources', icon: '📦', visible: true },
    { id: 'cities', title: 'Cities', icon: '🏴', visible: expansions?.cities },
    { id: 'leaders', title: 'Leaders', icon: '👤', visible: expansions?.leaders },
    { id: 'navy', title: 'Navy', icon: '⚓', visible: expansions?.armada },
    { id: 'islands', title: 'Islands', icon: '🏝️', visible: expansions?.armada },
    { id: 'edifice', title: 'Edifice', icon: '🗿', visible: expansions?.edifice },
  ], [expansions]);

  const visibleCategories = categories.filter(c => c.visible);

  const totalPoints = useMemo(() => {
    if (!currentPlayer || !currentScore) return 0;
    return visibleCategories.reduce(
      (sum, cat) =>
        sum +
        calculateCategoryPoints(
          currentPlayer.id,
          cat.id,
          currentScore as any,
          { wonder: wonders[currentPlayer.id], expansions }
        ),
      0
    );
  }, [currentPlayer, currentScore, visibleCategories, wonders, expansions]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  }, []);

  const handleQuickEdit = useCallback(
    (categoryId: string, value: number) => {
      if (!currentPlayer) return;
      updateScore(currentPlayer.id, `${categoryId}DirectPoints`, value);
    },
    [currentPlayer, updateScore] // ensure object dependency included
  );

  const navigatePlayer = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    } else if (direction === 'next' && currentPlayerIndex < orderedPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  }, [currentPlayerIndex, orderedPlayers.length]);

  const allPlayersScored = useCallback(() => {
    const scores = useScoringStore.getState().playerScores;
    return orderedPlayers.every(player => {
      if (!player) return false;
      const score = scores[player.id];
      return (
        score &&
        Object.keys(score).some(
          key => key.includes('DirectPoints') && (score as any)[key] > 0
        )
      );
    });
  }, [orderedPlayers]);

  if (!currentPlayer || !currentScore) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#C4A24C', fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
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
              style={[styles.navButton, currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.gameInfo}>
            {orderedPlayers.length} Players • {Object.values(expansions).filter(Boolean).length} Expansions
          </Text>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={visibleCategories}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.motivationalCard}>
            <Text style={styles.motivationalText}>
              💫 Enter quick totals or tap &quot;Details&quot; for comprehensive tracking and personal analysis!
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TOTAL SCORE</Text>
            <Text style={styles.totalValue}>{totalPoints}</Text>
          </View>
        }
        renderItem={({ item: category }) => (
          <QuickCategoryItem
            playerId={currentPlayer.id}
            category={category}
            wonder={wonders[currentPlayer.id]}
            expansions={expansions}
            styles={styles}
            onDetails={handleCategoryPress}
            onQuickEdit={handleQuickEdit}
          />
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentPlayerIndex > 0 && (
            <TouchableOpacity
              onPress={() => navigatePlayer('prev')}
              style={[styles.footerButton, styles.secondaryButton]}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                ← Previous
              </Text>
            </TouchableOpacity>
          )}
          
          {currentPlayerIndex < orderedPlayers.length - 1 && (
            <TouchableOpacity
              onPress={() => navigatePlayer('next')}
              style={[styles.footerButton, styles.primaryButton]}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Next →
              </Text>
            </TouchableOpacity>
          )}
          
          {allPlayersScored() && (
            <TouchableOpacity
              onPress={() => Alert.alert('Results', 'Navigate to results screen')}
              style={[styles.footerButton, { backgroundColor: '#22C55E' }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                🏆 Results
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedCategory && (
          <CategoryDetailModal
            playerId={currentPlayer.id}
            categoryId={selectedCategory}
            onClose={() => setModalVisible(false)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}