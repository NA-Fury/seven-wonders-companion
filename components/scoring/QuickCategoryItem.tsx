import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useScoringStore, DetailedScoreData } from '../../store/scoringStore';
import { calculateCategoryPoints } from './scoringCalculations';
import shallow from 'zustand/shallow';

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
  const categoryScore = useScoringStore(
    useCallback(state => {
      const score = state.playerScores[playerId];
      if (!score) return {} as Record<string, any>;
      const result: Record<string, any> = {};
      for (const key in score) {
        if (key.startsWith(category.id)) {
          result[key] = (score as any)[key];
        }
      }
      return result;
    }, [playerId, category.id]),
    shallow
  );

  const points = useMemo(
    () =>
      calculateCategoryPoints(
        playerId,
        category.id,
        categoryScore as DetailedScoreData,
        { wonder, expansions }
      ),
    [playerId, category.id, categoryScore, wonder, expansions]
  );

  const hasDetails = categoryScore[`${category.id}ShowDetails`];

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
          <Text style={[styles.pointsValue, hasDetails ? { color: '#10B981' } : null]}>
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

