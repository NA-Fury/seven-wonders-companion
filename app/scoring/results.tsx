// app/scoring/results.tsx - Enhanced with analysis, badges, and export
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  winnerAnalysis: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: 14,
    color: '#FEF3C7',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '600',
  },
  rankingsContainer: {
    paddingHorizontal: 16,
  },
  rankingCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  expandedCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  expandButton: {
    marginLeft: 8,
    padding: 4,
  },
  expandButtonText: {
    fontSize: 18,
    color: '#C4A24C',
  },
  shareBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)'
  },
  shareText: { color: 'rgba(243,231,211,0.8)', fontSize: 12 },
  shareButton: {
    backgroundColor: '#C4A24C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,162,76,0.4)'
  },
  shareButtonText: { color: '#111827', fontWeight: '800', fontSize: 12 },
  breakdownContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownCategory: {
    fontSize: 12,
    color: 'rgba(243, 231, 211, 0.7)',
  },
  breakdownScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4A24C',
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

// Victory phrases based on scoring patterns
const VICTORY_PHRASES = {
  military: [
    "A true Warmonger! Conquered all who stood in their path!",
    "The Iron Fist of the Ancient World strikes again!",
    "Military might prevails! All hail the General!",
  ],
  science: [
    "The Scholar's Path leads to victory!",
    "Knowledge is power! A brilliant scientific civilization!",
    "The Great Library would be proud of this intellectual triumph!",
  ],
  civil: [
    "A beacon of civilization! The people's champion!",
    "Built a utopia worthy of the ages!",
    "Civic virtue and public works pave the road to victory!",
  ],
  commercial: [
    "The Merchant Prince claims their throne!",
    "Gold flows like water in this commercial empire!",
    "Trade routes and coin purses rule the day!",
  ],
  wonder: [
    "The Wonder Builder's magnificent monuments stand tall!",
    "Architectural marvels that will echo through history!",
    "These wonders will be remembered for millennia!",
  ],
  balanced: [
    "A Renaissance civilization! Master of all trades!",
    "Perfectly balanced, as all things should be!",
    "The complete package - a truly versatile empire!",
  ],
  guild: [
    "The Guild Master's influence knows no bounds!",
    "Professional excellence in every field!",
    "The associations and guilds unite for victory!",
  ],
  naval: [
    "Admiral of the Seven Seas claims victory!",
    "Naval supremacy across the Mediterranean!",
    "The fleet commander's strategic brilliance shines!",
  ],
};

// Badge definitions
const BADGES = {
  warmonger: { icon: '⚔️', name: 'Warmonger', condition: (breakdown: any) => breakdown.military >= 20 },
  scientist: { icon: '🔬', name: 'Great Scientist', condition: (breakdown: any) => breakdown.science >= 25 },
  merchant: { icon: '💰', name: 'Merchant Prince', condition: (breakdown: any) => breakdown.commercial >= 15 },
  builder: { icon: '🏗️', name: 'Master Builder', condition: (breakdown: any) => breakdown.civil >= 20 },
  wonderous: { icon: '🏛️', name: 'Wonder Architect', condition: (breakdown: any) => breakdown.wonder >= 15 },
  peaceful: { icon: '🕊️', name: 'Pacifist', condition: (breakdown: any) => breakdown.military === 0 },
  perfectScore: { icon: '💯', name: 'Century Club', condition: (breakdown: any, total: number) => total >= 100 },
  balanced: { icon: '⚖️', name: 'Well Balanced', condition: (breakdown: any) => {
    // Ensure we have a number[] to safely spread into Math.max/Math.min
    const scores = Object.values(breakdown)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    if (scores.length < 5) return false;
    const spread = Math.max(...scores) - Math.min(...scores);
    return spread <= 10;
  }},
  underdog: { icon: '🎯', name: 'Underdog Victory', condition: (breakdown: any, total: number, rank: number) => rank === 1 && total < 60 },
};

export default function ResultsScreen() {
  const { players } = useSetupStore();
  const { getLeaderboard, playerScores, completeScoring, getCategoryBreakdown, gameMetadata, getAllTotals } = useScoringStore();
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  
  const leaderboard = useMemo(() => getLeaderboard(), [playerScores]);
  
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player';
  };
  
  const toggleExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };
  
  // Analyze winner's strategy
  const winnerAnalysis = useMemo(() => {
    if (leaderboard.length === 0) return null;
    
    const winner = leaderboard[0];
    const breakdown = getCategoryBreakdown(winner.playerId);
    
    // Find dominant categories
    const sortedCategories = Object.entries(breakdown)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a);
    
    if (sortedCategories.length === 0) return null;
    
    const [topCategory, topScore] = sortedCategories[0];
    const totalScore = winner.total;
    const dominanceRatio = topScore / totalScore;
    
    let phrase = '';
    let strategy = 'balanced';
    
    // Determine strategy type
    if (dominanceRatio > 0.4) {
      // Single category dominance
      strategy = topCategory as keyof typeof VICTORY_PHRASES;
    } else if (topCategory === 'military' && breakdown.navy > 10) {
      strategy = 'naval';
    } else if (sortedCategories.length >= 5) {
      strategy = 'balanced';
    } else {
      strategy = topCategory as keyof typeof VICTORY_PHRASES;
    }
    
    const phrases = VICTORY_PHRASES[strategy as keyof typeof VICTORY_PHRASES] || VICTORY_PHRASES.balanced;
    phrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Calculate badges
    const badges = Object.entries(BADGES)
      .filter(([_, badge]) => badge.condition(breakdown, totalScore, 1))
      .map(([key, badge]) => ({ key, ...badge }))
    
    return { phrase, strategy, badges, topCategories: sortedCategories.slice(0, 3) };
  }, [leaderboard, getCategoryBreakdown]);
  
  // Calculate all player badges
  const playerBadges = useMemo(() => {
    const badgeMap: Record<string, any[]> = {};
    
    leaderboard.forEach((entry) => {
      const breakdown = getCategoryBreakdown(entry.playerId);
      const badges = Object.entries(BADGES)
        .filter(([_, badge]) => badge.condition(breakdown, entry.total, entry.rank))
        .map(([key, badge]) => ({ key, ...badge }))

      badgeMap[entry.playerId] = badges;
    });
    
    return badgeMap;
  }, [leaderboard, getCategoryBreakdown]);
  
  const getCategorySummary = (playerId: string) => {
    const breakdown = getCategoryBreakdown(playerId);
    const topCategories = Object.entries(breakdown)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => {
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
        return categoryNames[cat] || cat;
      });
    
    return topCategories.length > 0 ? `Strong in: ${topCategories.join(', ')}` : 'No categories scored';
  };
  
  const gameStats = useMemo(() => {
    const scores = Object.values(getAllTotals()); // number[]
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? Math.round(total / scores.length) : 0;
    const highest = Math.max(0, ...scores);
    const lowest  = Math.min(0, ...scores);
    const spread  = highest - lowest;

    return { average, highest, lowest, spread };
  }, [playerScores]);
  
  const handleShare = async () => {
    const badges = winnerAnalysis?.badges?.map(b => `${b.icon} ${b.name}`).join(' ') || '';
    const message = `🎲 7 Wonders Game #${gameMetadata?.gameNumber || '?'} Results:\n\n${
      leaderboard.slice(0, 3).map((entry, index) => 
        `${['🥇', '🥈', '🥉'][index]} ${getPlayerName(entry.playerId)}: ${entry.total} points`
      ).join('\n')
    }\n\n🏆 ${winnerAnalysis?.phrase || 'Great game!'}\n${badges}\n\nAverage Score: ${gameStats.average} points`;
    
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
          <Text style={styles.title}>🏆 Game #{gameMetadata?.gameNumber} Results</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString()} • {players.length} Players
          </Text>
        </View>
        
        {/* Winner Analysis */}
        {winnerAnalysis && leaderboard.length > 0 && (
          <View style={styles.winnerAnalysis}>
            <Text style={styles.analysisTitle}>
              👑 {getPlayerName(leaderboard[0].playerId)} Wins!
            </Text>
            <Text style={styles.analysisText}>
              {winnerAnalysis.phrase}
            </Text>
            {winnerAnalysis.badges.length > 0 && (
              <View style={styles.badgesContainer}>
                {winnerAnalysis.badges.map(badge => (
                  <View key={badge.key} style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badge.icon} {badge.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        
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
        
        {/* Full Rankings with Expandable Breakdown */}
        <View style={styles.rankingsContainer}>
          <Text style={[styles.title, { fontSize: 20, marginBottom: 12 }]}>
            Complete Rankings & Analysis
          </Text>
          
          {leaderboard.map((entry) => {
            const isExpanded = expandedPlayers.has(entry.playerId);
            const badges = playerBadges[entry.playerId] || [];
            const breakdown = getCategoryBreakdown(entry.playerId);
            
            return (
              <View key={entry.playerId} style={[styles.rankingCard, isExpanded && styles.expandedCard]}>
                <TouchableOpacity onPress={() => toggleExpanded(entry.playerId)}>
                  <View style={styles.rankingHeader}>
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
                        {badges.length > 0 && (
                          <View style={[styles.badgesContainer, { marginTop: 4, justifyContent: 'flex-start' }]}>
                            {badges.slice(0, 3).map(badge => (
                              <View key={badge.key} style={[styles.badge, { paddingVertical: 2, paddingHorizontal: 6 }]}>
                                <Text style={[styles.badgeText, { fontSize: 10 }]}>
                                  {badge.icon}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.scoreText}>{entry.total}</Text>
                      <TouchableOpacity style={styles.expandButton}>
                        <Text style={styles.expandButtonText}>
                          {isExpanded ? '−' : '+'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.breakdownContainer}>
                    {Object.entries(breakdown)
                      .filter(([_, score]) => score > 0)
                      .sort(([_, a], [__, b]) => b - a)
                      .map(([category, score]) => (
                        <View key={category} style={styles.breakdownRow}>
                          <Text style={styles.breakdownCategory}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Text>
                          <Text style={styles.breakdownScore}>{score} pts</Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            );
          })}
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
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Game Duration</Text>
              <Text style={styles.statValue}>
                {gameMetadata?.endTime && gameMetadata?.startTime
                  ? `${Math.round((new Date(gameMetadata.endTime).getTime() - new Date(gameMetadata.startTime).getTime()) / 60000)} min`
                  : 'In Progress'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveGame}
          >
            <Text style={styles.actionButtonText}>💾 Save & Exit</Text>
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
