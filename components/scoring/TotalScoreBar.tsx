// components/scoring/TotalScoreBar.tsx - Fixed bottom score display
import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(31, 41, 55, 0.98)',
    borderTopWidth: 2,
    borderTopColor: '#C4A24C',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    elevation: 10,
    shadowColor: '#C4A24C',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scoreSection: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FEF3C7',
  },
  scoreUnit: {
    fontSize: 14,
    color: 'rgba(243, 231, 211, 0.6)',
    marginLeft: 6,
  },
  tbdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tbdValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  resultsButton: {
    backgroundColor: '#C4A24C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 16,
  },
  resultsButtonDisabled: {
    backgroundColor: 'rgba(196, 162, 76, 0.3)',
  },
  resultsButtonText: {
    color: '#0F0E1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsButtonTextDisabled: {
    color: 'rgba(15, 14, 26, 0.5)',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C4A24C',
  },
});

interface TotalScoreBarProps {
  total: number;
  isComplete: boolean;
  onViewResults: () => void;
}

export const TotalScoreBar = memo<TotalScoreBarProps>(({
  total,
  isComplete,
  onViewResults,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Score change animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [total]);
  
  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isComplete ? 1 : 0.5,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isComplete]);
  
  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <View style={styles.content}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <View style={styles.scoreContainer}>
            {total > 0 ? (
              <>
                <Text style={styles.scoreValue}>{total}</Text>
                <Text style={styles.scoreUnit}>points</Text>
              </>
            ) : (
              <View style={styles.tbdContainer}>
                <Text style={styles.tbdValue}>TBD</Text>
                <Text style={styles.scoreUnit}>calculating...</Text>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.resultsButton,
            !isComplete && styles.resultsButtonDisabled,
          ]}
          onPress={onViewResults}
          disabled={!isComplete}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.resultsButtonText,
            !isComplete && styles.resultsButtonTextDisabled,
          ]}>
            {isComplete ? 'View Results' : 'Complete Scoring'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
});