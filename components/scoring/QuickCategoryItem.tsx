import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { shallow } from 'zustand/shallow';
import { DetailedScoreData, useScoringStore } from '../../store/scoringStore';
import { calculateCategoryPoints } from './scoringCalculations';

interface CategoryConfig {
  id: string;
  title: string;
  icon: string;
  color?: string;
}

interface Props {
  playerId: string;
  category: CategoryConfig;
  wonder: any;
  expansions: any;
  styles: any;
  onDetails: (categoryId: string) => void;
  onQuickEdit: (categoryId: string, value: number) => void;
}

export default React.memo(function QuickCategoryItem({
  playerId,
  category,
  wonder,
  expansions,
  styles,
  onDetails,
  onQuickEdit,
}: Props) {
  // Use direct slice + shallow (stable snapshot; no object reconstruction)
  const playerScore = useScoringStore(
    state => state.playerScores[playerId],
    shallow
  );

  if (!playerScore) {
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <Text style={[styles.pointsValue, { opacity: 0.5 }]}>0</Text>
      </View>
    );
  }

  const points = useMemo(
    () =>
      calculateCategoryPoints(
        playerId,
        category.id,
        playerScore as DetailedScoreData,
        { wonder, expansions }
      ),
    [playerId, category.id, playerScore, wonder, expansions]
  );

  const hasDetails = Boolean(
    (playerScore as any)[`${category.id}ShowDetails`]
  );

  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>

      <View style={styles.pointsDisplay}>
        <TouchableOpacity
          onPress={() => {
            const newValue = points > 0 ? 0 : 5;
            onQuickEdit(category.id, newValue);
          }}
        >
          <Text
            style={[
              styles.pointsValue,
              hasDetails ? { color: '#10B981' } : null,
            ]}
          >
            {points}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onDetails(category.id)}
        >
          <Text style={styles.detailButtonText}>
            {hasDetails ? '✓ Details' : 'Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

