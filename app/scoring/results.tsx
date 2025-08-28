// app/scoring/results.tsx - Final results and leaderboard
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E1A',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FEF3C7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(243, 231, 211, 0.7)',
  },
  podiumContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
    height: 200,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  podiumBar: {
    width: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  firstPlace: {
    backgroundColor: '#FFD700',
    height: 140,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    height: 110,
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    height: 80,
  },
  placeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F0E1A',
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F0E1A',
    marginTop: 8,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F0E1A',
  },
  rankingsContainer: {
    paddingHorizontal: 16,
  },
  rankingCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4A24C',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3E7D3',
    marginBottom: 2,
  },
  categorySummary: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FEF3C7',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818CF8',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(243, 231, 211, 0.7)',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C4A24C',
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#C4A24C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4A24C',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F0E1A',
  },
  secondaryButtonText: {
    color: '#C4A24C',
  },
});

export default function ResultsScreen() {
  const { players } = useSetupStore();
  const { getLeaderboard, playerScores, completeScoring } = useScoringStore();
  
  const leaderboard = useMemo(() => getLeaderboard(), [playerScores]);
  
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player';
  };
  
  const getCategorySummary = (playerId: string) => {
    const score = playerScores[playerId];
    if (!score) return '';
    
    const categories = Object.entries(score.categories)
      .filter(([_, cat]) => (cat.directPoints ?? cat.calculatedPoints ?? 0) > 0)
      .map(([key]) => {
        const categoryNames: Record<string, string> = {
          wonder: 'Wonder',
          treasury: 'Treasury',
          military: 'Military',
          civil: 'Civil',
          commercial: 'Commerce',
          science: 'Science',
          guild: 'Guild',
          cities: 'Cities',
          leaders: 'Leaders',
          navy: 'Navy',
          islands: 'Islands',
          edifice: 'Edifice',
        };
        return categoryNames[key] || key;
      });
    
    return categories.length > 0 ? `Strong in: ${categories.slice(0, 3).join(', ')}` : 'No categories scored';
  };
  
  const gameStats = useMemo(() => {
    const scores = Object.values(playerScores).map(s => s.total);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? Math.round(total / scores.length) : 0;
    const highest = Math.max(...scores, 0);
    const lowest = Math.min(...scores, 0);
    const spread = highest - lowest;
    
    return { average, highest, lowest, spread };
  }, [playerScores]);
  
  const handleShare = async () => {
    const message = `7 Wonders Game Results:\n\n${
      leaderboard.slice(0, 3).map((entry, index) => 
        `${['🥇', '🥈', '🥉'][index]} ${getPlayerName(entry.playerId)}: ${entry.total} points`
      ).join('\n')
    }\n\nAverage Score: ${gameStats.average} points\nHighest Score: ${gameStats.highest} points`;
    
    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  const handleSaveGame = () => {
    completeScoring();
    // Implementation for saving to persistent storage will go here
    router.push('/');
  };
  
  const handleNewGame = () => {
    router.replace('/setup/expansions');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Final Results</Text>
          <Text style={styles.subtitle}>
            Game completed • {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        {/* Podium for top 3 */}
        {leaderboard.length >= 3 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podiumRow}>
              {/* Second Place */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>
                  {getPlayerName(leaderboard[1].playerId)}
                </Text>
                <View style={[styles.podiumBar, styles.secondPlace]}>
                  <Text style={styles.placeNumber}>2nd</Text>
                  <Text style={styles.podiumScore}>{leaderboard[1].total}</Text>
                </View>
              </View>
              
              {/* First Place */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>
                  {getPlayerName(leaderboard[0].playerId)}
                </Text>
                <View style={[styles.podiumBar, styles.firstPlace]}>
                  <Text style={styles.placeNumber}>🏆</Text>
                  <Text style={styles.podiumScore}>{leaderboard[0].total}</Text>
                </View>
              </View>
              
              {/* Third Place */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>
                  {getPlayerName(leaderboard[2].playerId)}
                </Text>
                <View style={[styles.podiumBar, styles.thirdPlace]}>
                  <Text style={styles.placeNumber}>3rd</Text>
                  <Text style={styles.podiumScore}>{leaderboard[2].total}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {/* Full Rankings */}
        <View style={styles.rankingsContainer}>
          <Text style={[styles.title, { fontSize: 20, marginBottom: 12 }]}>
            Complete Rankings
          </Text>
          
          {leaderboard.map((entry) => (
            <View key={entry.playerId} style={styles.rankingCard}>
              <View style={styles.rankingLeft}>
                <View style={styles.rankNumber}>
                  <Text style={styles.rankText}>#{entry.rank}</Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {getPlayerName(entry.playerId)}
                  </Text>
                  <Text style={styles.categorySummary}>
                    {getCategorySummary(entry.playerId)}
                  </Text>
                </View>
              </View>
              <Text style={styles.scoreText}>{entry.total}</Text>
            </View>
          ))}
        </View>
        
        {/* Game Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Game Statistics</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Score</Text>
              <Text style={styles.statValue}>{gameStats.average} points</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Highest Score</Text>
              <Text style={styles.statValue}>{gameStats.highest} points</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Lowest Score</Text>
              <Text style={styles.statValue}>{gameStats.lowest} points</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Score Spread</Text>
              <Text style={styles.statValue}>{gameStats.spread} points</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveGame}
          >
            <Text style={styles.actionButtonText}>💾 Save Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              📤 Share Results
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleNewGame}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              🎮 New Game
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}