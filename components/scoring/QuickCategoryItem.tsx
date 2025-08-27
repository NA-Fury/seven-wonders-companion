import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DetailedScoreData, usePlayerScore } from '../../store/scoringStore';
import { calculateCategoryPoints } from './scoringCalculations';

interface CategoryConfig {
  id: string;
  title: string;
  icon: string;
  visible?: boolean;
}

interface Props {
  playerId: string;
  category: CategoryConfig;
  wonder: any;
  expansions: any;
  styles: any;
  onDetails: (categoryId: string) => void;
  onQuickEdit: (categoryId: string, delta: number) => void;
  isAnalysis?: boolean;
}

// Memoized component for better performance
const QuickCategoryItem = React.memo(function QuickCategoryItem({
  playerId,
  category,
  wonder,
  expansions,
  styles,
  onDetails,
  onQuickEdit,
  isAnalysis = false
}: Props) {
  const playerScore = usePlayerScore(playerId);

  const points = useMemo(() => {
    if (!playerScore || isAnalysis) return 0;
    return calculateCategoryPoints(
      playerId,
      category.id,
      playerScore as DetailedScoreData,
      { wonder, expansions },
      true
    );
  }, [playerId, category.id, playerScore, wonder, expansions, isAnalysis]);

  const hasDetails = useMemo(() => 
    !!(playerScore && (playerScore as any)[`${category.id}ShowDetails`]),
    [playerScore, category.id]
  );

  // Memoized handlers
  const handleMinus = React.useCallback(() => {
    if (!isAnalysis && points > 0) {
      onQuickEdit(category.id, -1);
    }
  }, [category.id, points, onQuickEdit, isAnalysis]);

  const handlePlus = React.useCallback(() => {
    if (!isAnalysis) {
      onQuickEdit(category.id, 1);
    }
  }, [category.id, onQuickEdit, isAnalysis]);

  const handleDetails = React.useCallback(() => {
    onDetails(category.id);
  }, [category.id, onDetails]);

  if (!playerScore) {
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <Text style={[styles.pointsValue, { opacity: 0.4 }]}>0</Text>
      </View>
    );
  }

  // Analysis categories (Resources & Bonus) - Clean aligned design
  if (isAnalysis) {
    const getAnalysisInfo = () => {
      if (category.id === 'resources') {
        const brown = (playerScore as any).resourcesBrownCards || 0;
        const grey = (playerScore as any).resourcesGreyCards || 0;
        return {
          main: `${brown + grey}`,
          sub: `${brown}B/${grey}G`
        };
      }
      if (category.id === 'bonus') {
        const retrievals = (playerScore as any).discardRetrievals;
        if (!retrievals) return { main: '0', sub: 'No retrievals' };
        const total = (retrievals.age1 || 0) + (retrievals.age2 || 0) + (retrievals.age3 || 0);
        return {
          main: `${total}`,
          sub: total > 0 ? `Ages: ${retrievals.age1}/${retrievals.age2}/${retrievals.age3}` : 'No retrievals'
        };
      }
      return { main: '0', sub: 'No data' };
    };

    const info = getAnalysisInfo();

    return (
      <View style={[styles.categoryCard, { backgroundColor: 'rgba(99, 102, 241, 0.08)' }]}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[styles.categoryTitle, { color: '#9CA3AF' }]}>{category.title}</Text>
        </View>
        <View style={styles.pointsDisplay}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pointsValue, { fontSize: 22, color: '#6366F1' }]}>
              {info.main}
            </Text>
            <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: -4 }}>
              {info.sub}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.detailButton, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}
            onPress={handleDetails}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.detailButtonText, { color: '#6366F1', fontSize: 11 }]}>
              {hasDetails ? 'Edit' : 'Track'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Scoring categories with optimized +/- buttons
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      
      <View style={styles.pointsDisplay}>
        {/* Minus Button */}
        <TouchableOpacity
          onPress={handleMinus}
          disabled={points === 0}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: points > 0 ? '#EF4444' : 'rgba(107, 114, 128, 0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: -2 }}>−</Text>
        </TouchableOpacity>
        
        {/* Points Display */}
        <View style={{ minWidth: 40, alignItems: 'center' }}>
          <Text style={[
            styles.pointsValue, 
            hasDetails ? { color: '#10B981' } : null,
            { fontSize: points > 99 ? 22 : 26 }
          ]}>
            {points}
          </Text>
        </View>
        
        {/* Plus Button */}
        <TouchableOpacity
          onPress={handlePlus}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#22C55E',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 6,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
        
        {/* Details Button */}
        <TouchableOpacity
          style={[styles.detailButton, { minWidth: 28, paddingHorizontal: 8 }]}
          onPress={handleDetails}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text style={[styles.detailButtonText, { fontSize: 11 }]}>
            {hasDetails ? '✓' : '⚙'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom equality check for better performance
  return (
    prevProps.playerId === nextProps.playerId &&
    prevProps.category.id === nextProps.category.id &&
    prevProps.isAnalysis === nextProps.isAnalysis &&
    prevProps.wonder === nextProps.wonder &&
    prevProps.expansions === nextProps.expansions
  );
});

export default QuickCategoryItem;