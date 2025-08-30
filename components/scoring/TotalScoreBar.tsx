// components/scoring/TotalScoreBar.tsx - Fixed progress calculation and optional detailed mode
import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderTopWidth: 1, borderTopColor: 'rgba(196, 162, 76, 0.2)',
    paddingTop: 8, paddingBottom: Platform.select({ ios: 18, android: 12, default: 12 }),
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12, color: 'rgba(243, 231, 211, 0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreContainer: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#FEF3C7' },
  scoreUnit: { fontSize: 14, color: 'rgba(243, 231, 211, 0.6)', marginLeft: 6 },
  resultsButton: {
    backgroundColor: '#C4A24C', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(196,162,76,0.4)',
  },
  resultsButtonDisabled: { opacity: 0.5, backgroundColor: 'rgba(107, 114, 128, 0.5)' },
  resultsButtonText: { color: '#111827', fontWeight: '800', fontSize: 16 },
  resultsButtonTextDisabled: { color: '#6B7280' },
  progressBar: { marginTop: 10, height: 8, backgroundColor: 'rgba(31,41,55,0.7)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C4A24C' },
  progressReadyFill: { backgroundColor: '#10B981' },
  progressInfo: { position: 'absolute', top: -20, right: 16, backgroundColor: 'rgba(31, 41, 55, 0.9)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  progressInfoText: { fontSize: 10, color: 'rgba(243,231,211,0.8)' },
});

interface TotalScoreBarProps {
  total: number;
  isComplete: boolean;        // legacy (still accepted)
  completionProgress: number; // legacy (still accepted)
  onViewResults: () => void;
}

export const TotalScoreBar = memo<TotalScoreBarProps>(function TotalScoreBar({
  total,
  isComplete,
  completionProgress,
  onViewResults,
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Get actual readiness based on players having at least 3 categories with points
  const { players } = useSetupStore();
  const { getCategoryBreakdown, playerScores } = useScoringStore();

  const readiness = useMemo(() => {
    if (!players?.length) return { progress: 0, ready: false, incompleteNames: [] as string[] };

    let playersReady = 0;
    const incompleteNames: string[] = [];
    
    for (const player of players) {
      // Get player's scores directly from the store
      const playerScore = playerScores[player.id];
      if (!playerScore) continue;
      
      // Count categories with points > 0
      let nonZeroCategories = 0;
      let totalPoints = 0;
      
      // Check each category for points
      Object.values(playerScore.categories).forEach(categoryScore => {
        const points = categoryScore.directPoints ?? categoryScore.calculatedPoints ?? 0;
        if (points > 0) {
          nonZeroCategories += 1;
          totalPoints += points;
        }
      });
      
      console.log(`Player ${player.name}: ${nonZeroCategories} categories with points, total: ${totalPoints}`);
      
      // Player is ready if they have at least 3 categories with points
      if (nonZeroCategories >= 3) {
        playersReady += 1;
      } else if (totalPoints > 0) {
        // Player has some points but fewer than 3 categories - flag for warning
        incompleteNames.push(player.name);
      }
    }
    
    console.log(`${playersReady}/${players.length} players ready`);
    
    return {
      progress: playersReady / players.length,
      ready: playersReady === players.length && players.length > 0,
      incompleteNames,
    };
  }, [players, playerScores]);

  // Use the actual readiness progress instead of legacy completionProgress
  const effectiveProgress = readiness.progress;
  const ready = readiness.ready;

  useEffect(() => {
    Animated.timing(progressAnim, { 
      toValue: effectiveProgress, 
      duration: 400, 
      useNativeDriver: false 
    }).start();
  }, [effectiveProgress]);

  const handlePress = () => {
    if (!ready) return;

    const incompleteNames = readiness.incompleteNames;
    
    if (incompleteNames.length > 0) {
      // Create nice grammar for the alert message
      let playerText = '';
      if (incompleteNames.length === 1) {
        playerText = incompleteNames[0] + "'s scorecard";
      } else if (incompleteNames.length === 2) {
        playerText = incompleteNames[0] + "'s and " + incompleteNames[1] + "'s scorecards";
      } else {
        const lastPlayer = incompleteNames[incompleteNames.length - 1];
        const otherPlayers = incompleteNames.slice(0, -1);
        playerText = otherPlayers.join(', ') + "'s, and " + lastPlayer + "'s scorecards";
      }
      
      Alert.alert(
        'Proceed to Results?',
        `Hmm, this feels off – ${playerText} ${incompleteNames.length === 1 ? 'seems' : 'seem'} a bit incomplete. Are you sure you want to proceed?`,
        [
          { text: 'Stay & Fill', style: 'cancel' },
          { text: 'Proceed anyway', style: 'destructive', onPress: onViewResults },
        ]
      );
    } else {
      // All good, proceed directly
      onViewResults();
    }
  };

  // Calculate how many players have met the 3-category minimum vs total
  const playersReady = Math.round(effectiveProgress * (players?.length || 0));
  const totalPlayers = players?.length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{total}</Text>
            <Text style={styles.scoreUnit}>points</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.resultsButton, 
            !ready && styles.resultsButtonDisabled
          ]}
          onPress={handlePress}
          disabled={!ready}
        >
          <Text style={[
            styles.resultsButtonText,
            !ready && styles.resultsButtonTextDisabled
          ]}>
            {ready ? 'View Results' : `Need ${totalPlayers - playersReady} More`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            ready && styles.progressReadyFill,
            { 
              width: progressAnim.interpolate({ 
                inputRange: [0, 1], 
                outputRange: ['0%', '100%'] 
              }) 
            },
          ]}
        />
      </View>

      <View style={styles.progressInfo}>
        <Text style={styles.progressInfoText}>
          {ready 
            ? 'Ready for Results!' 
            : `${playersReady}/${totalPlayers} players (3+ categories each)`
          }
        </Text>
      </View>
    </View>
  );
});