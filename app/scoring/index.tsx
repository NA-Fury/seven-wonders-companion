// app/scoring/index.tsx - Fixed with proper progress tracking
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalysisHelpers } from '../../components/scoring/AnalysisHelpers';
import { CategoryCard } from '../../components/scoring/CategoryCard';
import { PlayerSelector } from '../../components/scoring/PlayerSelector';
import { TotalScoreBar } from '../../components/scoring/TotalScoreBar';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { CategoryKey, useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E1A',
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed total bar
  },
  header: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.3)',
  },
  playerInfo: {
    marginBottom: 8,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FEF3C7',
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaTag: {
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    color: '#C4A24C',
    fontSize: 11,
    fontWeight: '600',
  },
  wonderTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  wonderText: {
    color: '#818CF8',
  },
  shipyardTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  shipyardText: {
    color: '#4ADE80',
  },
  messageCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  messageText: {
    color: '#818CF8',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4A24C',
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C4A24C',
    marginTop: 12,
    fontSize: 14,
  },
  progressOverview: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(243, 231, 211, 0.7)',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C4A24C',
    borderRadius: 3,
  },
});

// Define base and expansion categories
const BASE_CATEGORIES: CategoryKey[] = [
  'wonder',
  'treasury',
  'military',
  'civil',
  'commercial',
  'science',
  'guild',
];

export default function ScoringScreen() {
  const { players, seating, wonders, expansions } = useSetupStore();
  const {
    playerScores,
    currentPlayerId,
    setCurrentPlayer,
    getPlayerScore,
    initializeScoring,
    gameMetadata,
    getCompletionProgress,
    isGameComplete,
  } = useScoringStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Initialize scoring on mount
  useEffect(() => {
    if (!isInitialized && players.length > 0) {
      const playerIds = seating.length > 0 
        ? seating 
        : players.map(p => p.id);
      
      initializeScoring(playerIds, expansions);
      setIsInitialized(true);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [players, seating, expansions, isInitialized]);
  
  // Memoized current player data
  const currentPlayer = useMemo(() => {
    if (!currentPlayerId) return null;
    return players.find(p => p.id === currentPlayerId);
  }, [currentPlayerId, players]);
  
  // Memoized wonder and shipyard data
  const { wonderData, shipyardData } = useMemo(() => {
    if (!currentPlayer) return { wonderData: null, shipyardData: null };
    
    const playerWonder = wonders[currentPlayer.id];
    const wonder = playerWonder?.boardId 
      ? WONDERS_DATABASE.find(w => w.id === playerWonder.boardId)
      : null;
    
    const shipyard = playerWonder?.shipyardId && expansions.armada
      ? ARMADA_SHIPYARDS.find(s => s.id === playerWonder.shipyardId)
      : null;
    
    return { 
      wonderData: wonder && playerWonder ? { wonder, side: playerWonder.side } : null,
      shipyardData: shipyard,
    };
  }, [currentPlayer, wonders, expansions.armada]);
  
  // Memoized categories based on expansions
  const availableCategories = useMemo(() => {
    const categories = [...BASE_CATEGORIES];
    
    if (expansions.cities) categories.push('cities');
    if (expansions.leaders) categories.push('leaders');
    if (expansions.armada) {
      categories.push('navy');
      categories.push('islands');
    }
    if (expansions.edifice) categories.push('edifice');
    
    return categories;
  }, [expansions]);
  
  // Get player position
  const playerPosition = useMemo(() => {
    if (!currentPlayerId) return null;
    const orderedIds = seating.length > 0 ? seating : players.map(p => p.id);
    const index = orderedIds.indexOf(currentPlayerId);
    return {
      current: index + 1,
      total: orderedIds.length,
    };
  }, [currentPlayerId, seating, players]);
  
  // Handle player change
  const handlePlayerChange = useCallback((playerId: string) => {
    setCurrentPlayer(playerId);
  }, [setCurrentPlayer]);
  
  // Get current score
  const currentScore = currentPlayerId ? getPlayerScore(currentPlayerId) : null;
  
  // Calculate overall progress
  const completionProgress = useMemo(() => {
    return getCompletionProgress();
  }, [playerScores, gameMetadata]);
  
  // Count completed categories across all players
  const completedCategoriesInfo = useMemo(() => {
    let completed = 0;
    let total = 0;
    
    Object.values(playerScores).forEach(score => {
      availableCategories.forEach(cat => {
        total++;
        if (score.categories[cat].directPoints !== null || 
            score.categories[cat].calculatedPoints !== undefined) {
          completed++;
        }
      });
    });
    
    return { completed, total };
  }, [playerScores, availableCategories]);
  
  if (!isInitialized || !currentPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4A24C" />
          <Text style={styles.loadingText}>Initializing Scoring...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          removeClippedSubviews={true}
        >
          {/* Player Selector */}
          <PlayerSelector
            players={players}
            currentPlayerId={currentPlayerId}
            onPlayerSelect={handlePlayerChange}
            scores={Object.fromEntries(
              Object.entries(playerScores).map(([id, score]) => [id, score.total])
            )}
          />
          
          {/* Player Info Header */}
          <View style={styles.header}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{currentPlayer.name}</Text>
              
              <View style={styles.playerMeta}>
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>
                    Game #{gameMetadata?.gameNumber || 1}
                  </Text>
                </View>
                
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                
                {playerPosition && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>
                      Player {playerPosition.current} of {playerPosition.total}
                    </Text>
                  </View>
                )}
                
                {wonderData && (
                  <View style={[styles.metaTag, styles.wonderTag]}>
                    <Text style={[styles.metaText, styles.wonderText]}>
                      {wonderData.wonder.name} ({wonderData.side === 'day' ? '☀️' : '🌙'})
                    </Text>
                  </View>
                )}
                
                {shipyardData && (
                  <View style={[styles.metaTag, styles.shipyardTag]}>
                    <Text style={[styles.metaText, styles.shipyardText]}>
                      ⚓ {shipyardData.name} ({shipyardData.wonderTrack.toUpperCase()})
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Progress Overview */}
          <View style={styles.progressOverview}>
            <Text style={styles.progressText}>
              Overall Progress: {completedCategoriesInfo.completed}/{completedCategoriesInfo.total} categories scored
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: `${completionProgress * 100}%` }
                ]}
              />
            </View>
          </View>
          
          {/* Info Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              💡 The more details you enter, the more analysis we can provide!
            </Text>
          </View>
          
          {/* Score Categories */}
          <View style={styles.categoriesContainer}>
            {/* Base Game */}
            <Text style={styles.sectionTitle}>🏛️ Base Game</Text>
            {BASE_CATEGORIES.map(category => (
              <CategoryCard
                key={`${currentPlayerId}-${category}`}
                category={category}
                score={currentScore?.categories[category] || null}
                playerId={currentPlayerId!}
                wonderData={category === 'wonder' ? wonderData : undefined}
                expansions={expansions}
              />
            ))}
            
            {/* Cities Expansion */}
            {expansions.cities && (
              <>
                <Text style={styles.sectionTitle}>🏙️ Cities Expansion</Text>
                <CategoryCard
                  key={`${currentPlayerId}-cities`}
                  category="cities"
                  score={currentScore?.categories.cities || null}
                  playerId={currentPlayerId!}
                  expansions={expansions}
                />
              </>
            )}
            
            {/* Leaders Expansion */}
            {expansions.leaders && (
              <>
                <Text style={styles.sectionTitle}>👑 Leaders Expansion</Text>
                <CategoryCard
                  key={`${currentPlayerId}-leaders`}
                  category="leaders"
                  score={currentScore?.categories.leaders || null}
                  playerId={currentPlayerId!}
                  expansions={expansions}
                />
              </>
            )}
            
            {/* Armada Expansion */}
            {expansions.armada && (
              <>
                <Text style={styles.sectionTitle}>⚓ Armada Expansion</Text>
                <CategoryCard
                  key={`${currentPlayerId}-navy`}
                  category="navy"
                  score={currentScore?.categories.navy || null}
                  playerId={currentPlayerId!}
                  expansions={expansions}
                />
                <CategoryCard
                  key={`${currentPlayerId}-islands`}
                  category="islands"
                  score={currentScore?.categories.islands || null}
                  playerId={currentPlayerId!}
                  expansions={expansions}
                />
              </>
            )}
            
            {/* Edifice Expansion */}
            {expansions.edifice && (
              <>
                <Text style={styles.sectionTitle}>🗿 Edifice Expansion</Text>
                <CategoryCard
                  key={`${currentPlayerId}-edifice`}
                  category="edifice"
                  score={currentScore?.categories.edifice || null}
                  playerId={currentPlayerId!}
                  expansions={expansions}
                />
              </>
            )}
            
            {/* Analysis Helpers Section */}
            <AnalysisHelpers
              playerId={currentPlayerId!}
              wonderData={wonderData}
              onDataUpdate={(data) => {
                // Persist analysis helper data per player to power yellow/purple/guild calculations
                useScoringStore.getState().updateAnalysisData(currentPlayerId!, data);
              }}
            />
          </View>
        </ScrollView>
        
        {/* Fixed Total Score Bar */}
        <TotalScoreBar
          total={currentScore?.total || 0}
          isComplete={isGameComplete()}
          completionProgress={completionProgress}
          onViewResults={() => router.push('/scoring/results')}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
