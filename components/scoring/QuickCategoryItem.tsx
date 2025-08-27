import React, { useCallback, useMemo, useEffect, useState } from 'react';
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

const CATEGORY_FIELDS: Record<string, (keyof DetailedScoreData)[]> = {
    wonder: ['wonderDirectPoints', 'wonderShowDetails', 'wonderStagesBuilt', 'wonderEdificeStage'],
    treasure: [
      'treasureDirectPoints',
      'treasureShowDetails',
      'treasureTotalCoins',
      'treasurePermanentDebt',
      'treasureCardDebt',
      'treasureTaxDebt',
      'treasurePiracyDebt',
      'treasureCommercialDebt',
    ],
    military: [
      'militaryDirectPoints',
      'militaryShowDetails',
      'militaryTotalStrength',
      'militaryStrengthPerAge',
      'militaryPlayedDove',
      'militaryDoveAges',
      'militaryBoardingApplied',
      'militaryBoardingReceived',
      'militaryChainLinks',
    ],
    science: [
      'scienceDirectPoints',
      'scienceShowDetails',
      'scienceCompass',
      'scienceTablet',
      'scienceGear',
      'scienceNonCardCompass',
      'scienceNonCardTablet',
      'scienceNonCardGear',
    ],
    civilian: [
      'civilianDirectPoints',
      'civilianShowDetails',
      'civilianShipPosition',
      'civilianChainLinks',
      'civilianTotalCards',
    ],
    commercial: [
      'commercialDirectPoints',
      'commercialShowDetails',
      'commercialShipPosition',
      'commercialChainLinks',
      'commercialTotalCards',
      'commercialPointCards',
    ],
    guilds: ['guildsDirectPoints', 'guildsShowDetails', 'guildsCardsPlayed'],
    resources: [
      'resourcesDirectPoints',
      'resourcesShowDetails',
      'resourcesBrownCards',
      'resourcesGreyCards',
      'discardRetrievals',
    ],
    cities: [
      'citiesDirectPoints',
      'citiesShowDetails',
      'blackPointCards',
      'blackTotalCards',
      'blackNeighborPositive',
      'blackNeighborNegative',
      'blackPeaceDoves',
    ],
    leaders: ['leadersDirectPoints', 'leadersShowDetails', 'leadersPlayed', 'leadersAvailable'],
    navy: ['navyDirectPoints', 'navyShowDetails', 'navyTotalStrength', 'navyPlayedBlueDove', 'navyDoveAges'],
    islands: ['islandDirectPoints', 'islandShowDetails', 'islandCards'],
    edifice: [
      'edificeDirectPoints',
      'edificeShowDetails',
      'edificeRewards',
      'edificePenalties',
      'edificeProjectsContributed',
    ],
  };

export default React.memo(function QuickCategoryItem({
  playerId,
  category,
  wonder,
  expansions,
  styles,
  onDetails,
  onQuickEdit,
}: Props) {
  const fields = useMemo(() => CATEGORY_FIELDS[category.id] || [], [category.id]);

  const getSlice = useCallback(
    (state: any) => {
      const allScores = state.playerScores[playerId];
      if (!allScores) return undefined;
      const slice: Partial<DetailedScoreData> = {};
      fields.forEach(k => {
        // @ts-ignore dynamic assignment
        slice[k] = allScores[k];
      });
      return slice as DetailedScoreData;
    },
    [playerId, fields]
  );

  const [playerScore, setPlayerScore] = useState(() => getSlice(useScoringStore.getState()));

  useEffect(
    () =>
      (useScoringStore.subscribe as any)(
        getSlice,
        setPlayerScore,
        { equalityFn: shallow }
      ),
    [getSlice]
  );

  const points = useMemo(
    () =>
      playerScore
        ? calculateCategoryPoints(
            playerId,
            category.id,
            playerScore as DetailedScoreData,
            { wonder, expansions }
          )
        : 0,
    [playerId, category.id, playerScore, wonder, expansions]
  );

  const hasDetails = Boolean(
    playerScore && (playerScore as any)[`${category.id}ShowDetails`]
  );

  if (!playerScore) {
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <Text style={[styles.pointsValue, { opacity: 0.5 }]}>{points}</Text>
      </View>
    );
  }

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

