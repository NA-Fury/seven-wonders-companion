// components/scoring/QuickScoreScreen.tsx - Ultra optimized for performance
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    InteractionManager,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailedScoreData, useScoringStore } from '../../store/scoringStore';
import { shallow } from 'zustand/shallow';
import { useSetupStore } from '../../store/setupStore';

// Pre-define styles to avoid recreation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1A1A',
  },
  loadingText: {
    color: '#C4A24C',
    fontSize: 16,
    marginTop: 12,
  },
  compactHeader: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
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
    paddingVertical: 6,
  },
  playerName: {
    color: '#C4A24C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(196, 162, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfo: {
    fontSize: 10,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 120,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.25)',
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  pointsSection: {
    marginBottom: 8,
  },
  quickControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  quickButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  quickButtonText: {
    color: '#1C1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickButtonTextDisabled: {
    color: '#6B7280',
  },
  pointsInput: {
    flex: 1,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 8,
    color: '#FEF3C7',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailButton: {
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  detailButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  detailButtonText: {
    color: '#C4A24C',
    fontSize: 11,
    fontWeight: '600',
  },
  detailButtonTextActive: {
    color: '#10B981',
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
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
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

// Simplified category card - no internal calculations
  const CategoryCard = React.memo(function CategoryCard({
    category,
    points,
    hasDetails,
    onDetailsPress,
    onUpdateScore,
  }: {
    category: any;
    points: number;
    hasDetails: boolean;
    onDetailsPress: () => void;
    onUpdateScore: (value: number) => void;
  }) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const handleDecrement = useCallback(() => {
    if (points > 0) {
      onUpdateScore(points - 1);
    }
  }, [points, onUpdateScore]);

  const handleIncrement = useCallback(() => {
    if (points < 100) {
      onUpdateScore(points + 1);
    }
  }, [points, onUpdateScore]);

  const handleInputSubmit = useCallback(() => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      onUpdateScore(Math.max(0, Math.min(100, value)));
    }
    setIsEditing(false);
    setInputValue('');
  }, [inputValue, onUpdateScore]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(points.toString());
  }, [points]);

  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      
      <View style={styles.pointsSection}>
        <View style={styles.quickControls}>
          <TouchableOpacity
            style={[styles.quickButton, points <= 0 && styles.quickButtonDisabled]}
            onPress={handleDecrement}
            disabled={points <= 0}
          >
            <Text style={[
              styles.quickButtonText, 
              points <= 0 && styles.quickButtonTextDisabled
            ]}>−</Text>
          </TouchableOpacity>
          
          {isEditing ? (
            <TextInput
              style={styles.pointsInput}
              value={inputValue}
              onChangeText={setInputValue}
              onBlur={handleInputSubmit}
              onSubmitEditing={handleInputSubmit}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
              maxLength={3}
            />
          ) : (
            <TouchableOpacity 
              style={styles.pointsInput} 
              onPress={handleInputFocus}
            >
              <Text style={{
                color: hasDetails ? '#10B981' : '#FEF3C7',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {points}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.quickButton, points >= 100 && styles.quickButtonDisabled]}
            onPress={handleIncrement}
            disabled={points >= 100}
          >
            <Text style={[
              styles.quickButtonText, 
              points >= 100 && styles.quickButtonTextDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.detailButton, hasDetails && styles.detailButtonActive]} 
          onPress={onDetailsPress}
        >
          <Text style={[
            styles.detailButtonText,
            hasDetails && styles.detailButtonTextActive
          ]}>
            {hasDetails ? '✓ Details Set' : 'Enter Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Pre-defined categories to avoid recreation
const BASE_CATEGORIES = [
  { id: 'wonder', title: 'Wonder', icon: '🏛️' },
  { id: 'treasure', title: 'Treasure', icon: '💰' },
  { id: 'military', title: 'Military', icon: '⚔️' },
  { id: 'civilian', title: 'Civilian', icon: '🏛️' },
  { id: 'commercial', title: 'Commercial', icon: '🪙' },
  { id: 'science', title: 'Science', icon: '🔬' },
  { id: 'guilds', title: 'Guilds', icon: '👑' },
  { id: 'resources', title: 'Resources', icon: '📦' },
];

const EXPANSION_CATEGORIES = {
  cities: { id: 'cities', title: 'Cities', icon: '🏴' },
  leaders: { id: 'leaders', title: 'Leaders', icon: '👤' },
  navy: { id: 'navy', title: 'Navy', icon: '⚓' },
  islands: { id: 'islands', title: 'Islands', icon: '🏝️' },
  edifice: { id: 'edifice', title: 'Edifice', icon: '🗿' },
};

export default function QuickScoreScreen() {
  const { players, seating, expansions, wonders } = useSetupStore();

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Get ordered players - memoized
  const orderedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map(id => players.find(p => p.id === id)).filter(Boolean);
  }, [players, seating]);

  const currentPlayer = orderedPlayers[currentPlayerIndex];
  const currentPlayerId = currentPlayer?.id;

  const currentPlayerScore = useScoringStore(
    useCallback(
      state => (currentPlayerId ? state.playerScores[currentPlayerId] : undefined),
      [currentPlayerId]
    )
  );

  const { initializeScores, updateMultipleScores, isInitialized: storeInitialized } =
    useScoringStore(
      useCallback(
        state => ({
          initializeScores: state.initializeScores,
          updateMultipleScores: state.updateMultipleScores,
          isInitialized: state.isInitialized,
        }),
        []
      ),
      shallow
    );

  const [isLoading, setIsLoading] = useState(!storeInitialized);

  // Performance optimization: cache calculations
  const calculationCache = useRef<Map<string, number>>(new Map());
  const lastUpdateTime = useRef<number>(0);

  // Build categories once
  const categories = useMemo(() => {
    const cats = [...BASE_CATEGORIES];
    if (expansions?.cities) cats.push(EXPANSION_CATEGORIES.cities);
    if (expansions?.leaders) cats.push(EXPANSION_CATEGORIES.leaders);
    if (expansions?.armada) {
      cats.push(EXPANSION_CATEGORIES.navy);
      cats.push(EXPANSION_CATEGORIES.islands);
    }
    if (expansions?.edifice) cats.push(EXPANSION_CATEGORIES.edifice);
    return cats;
  }, [expansions]);

  // Initialize only once
  useEffect(() => {
    if (!storeInitialized && orderedPlayers.length > 0) {
      // Delay initialization to next frame to avoid blocking navigation
      const timer = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          initializeScores(orderedPlayers, wonders);
          setIsLoading(false);
        });
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [storeInitialized, orderedPlayers, wonders, initializeScores]);

  // Get category points efficiently
  const getCategoryPoints = useCallback(
    (categoryId: string) => {
      if (!currentPlayerId) return 0;
      const cacheKey = `${currentPlayerId}-${categoryId}`;

      if (calculationCache.current.has(cacheKey)) {
        const cached = calculationCache.current.get(cacheKey);
        if (Date.now() - lastUpdateTime.current < 100) {
          return cached || 0;
        }
      }

      const score = currentPlayerScore;
      if (!score) return 0;

      const directPointsKey = `${categoryId}DirectPoints` as keyof DetailedScoreData;
      const points = (score[directPointsKey] as number) || 0;

      calculationCache.current.set(cacheKey, points);
      return points;
    },
    [currentPlayerScore, currentPlayerId]
  );

  // Check if category has details
  const hasDetails = useCallback(
    (categoryId: string) => {
      const score = currentPlayerScore;
      if (!score) return false;
      const showDetailsKey = `${categoryId}ShowDetails` as keyof DetailedScoreData;
      return Boolean(score[showDetailsKey]);
    },
    [currentPlayerScore]
  );

  // Calculate total efficiently
  const totalPoints = useMemo(() => {
    if (!currentPlayerScore) return 0;
    return categories.reduce((sum, cat) => sum + getCategoryPoints(cat.id), 0);
  }, [categories, currentPlayerScore, getCategoryPoints]);

  // Handle category press
  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  }, []);

  // Handle score update
  const handleUpdateScore = useCallback(
    (categoryId: string, value: number) => {
      if (!currentPlayerId) return;
      lastUpdateTime.current = Date.now();
      calculationCache.current.delete(`${currentPlayerId}-${categoryId}`);
      updateMultipleScores(currentPlayerId, {
        [`${categoryId}DirectPoints`]: value,
        [`${categoryId}ShowDetails`]: false,
      });
    },
    [currentPlayerId, updateMultipleScores]
  );

  // Navigate between players
  const navigatePlayer = useCallback((direction: 'prev' | 'next') => {
    // Clear cache when switching players
    calculationCache.current.clear();
    lastUpdateTime.current = Date.now();
    
    setCurrentPlayerIndex(prev => {
      if (direction === 'prev' && prev > 0) return prev - 1;
      if (direction === 'next' && prev < orderedPlayers.length - 1) return prev + 1;
      return prev;
    });
  }, [orderedPlayers.length]);

  // Handle show results
  const handleShowResults = useCallback(() => {
    Alert.alert('🎉 Complete!', 'All players have been scored!');
  }, []);

  // Lazy load the detail modal
  const DetailModal = React.lazy(() => import('./CategoryDetailModal'));

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4A24C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No players state
  if (!currentPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No players found</Text>
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
              style={[styles.navButton, currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.gameInfo}>
            {currentPlayerIndex + 1}/{orderedPlayers.length}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Motivational Message */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalText}>
            💫 Quick scoring with +/− or tap to type!
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.categoryGrid}>
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                points={getCategoryPoints(category.id)}
                hasDetails={hasDetails(category.id)}
                onDetailsPress={() => handleCategoryPress(category.id)}
                onUpdateScore={(value) => handleUpdateScore(category.id, value)}
              />
            ))}
        </View>

        {/* Total Display */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL SCORE</Text>
          <Text style={styles.totalValue}>{totalPoints}</Text>
        </View>
      </ScrollView>

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
          
          {currentPlayerIndex === orderedPlayers.length - 1 && (
            <TouchableOpacity
              onPress={handleShowResults}
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
        <React.Suspense fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C4A24C" />
          </View>
        }>
              {selectedCategory && currentPlayerId && (
                <DetailModal
                  playerId={currentPlayerId}
                  categoryId={selectedCategory}
                  onClose={() => {
                    setModalVisible(false);
                    calculationCache.current.clear();
                  }}
                />
              )}
        </React.Suspense>
      </Modal>
    </SafeAreaView>
  );
}