// components/scoring/CategoryCard.tsx - Fixed hook ordering and enhanced Edifice integration
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { searchBlackCards, sumBlackEndGameVP } from '../../data/blackCardsDatabase';
import {
  edificeOutcomeForPlayer,
  evaluateEdificeCompletion,
  getProjectById
} from '../../data/edificeDatabase';
import { getIslandByName, searchIslands, sumImmediateIslandVP } from '../../data/islandsDatabase';
import { getLeaderByName, searchLeaders, sumImmediateVP } from '../../data/leadersDatabase';
import { searchPurpleCards } from '../../data/purpleCardsDatabase';
import { searchYellowCards, sumYellowEndGameVP } from '../../data/yellowCardsDatabase';
import { CategoryKey, CategoryScore, useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import { getWonderById, getWonderSide } from '../../data/wondersDatabase';

// Get actual wonder stages from the database
function getWonderStagesData(playerId: string): { stages: any[]; wonderName: string; wonderId: string; side: 'day' | 'night' } | null {
  try {
    const { wonders } = useSetupStore.getState();

    const playerWonder = wonders[playerId];
    if (!playerWonder?.boardId || !playerWonder?.side) {
      return null;
    }

    const wonder = getWonderById(playerWonder.boardId);
    if (!wonder) return null;

    const wonderSide = getWonderSide(playerWonder.boardId, playerWonder.side);
    if (!wonderSide) return null;

    return {
      stages: wonderSide.stages || [],
      wonderName: wonder.name,
      wonderId: wonder.id,
      side: playerWonder.side,
    };
  } catch (error) {
    console.warn('Could not load wonder data:', error);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3E7D3',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreInput: {
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    textAlign: 'center',
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
  },
  scoreInputFocused: {
    borderColor: '#C4A24C',
    backgroundColor: 'rgba(28, 26, 26, 0.8)',
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  detailButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
    borderColor: '#818CF8',
  },
  detailButtonText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  tbdLabel: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  tbdText: {
    color: '#FB923C',
    fontSize: 10,
    fontWeight: '600',
  },
  detailedContent: {
    backgroundColor: 'rgba(28, 26, 26, 0.3)',
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.1)',
  },
  detailField: {
    marginTop: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(243, 231, 211, 0.7)',
    marginBottom: 6,
  },
  detailInput: {
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#C4A24C',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#C4A24C',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#C4A24C',
  },
  calculatedScore: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  calculatedLabel: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
    marginBottom: 4,
  },
  calculatedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FEF3C7',
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  smallInput: {
    flex: 1,
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#C4A24C',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    textAlign: 'center',
  },
  wonderInfo: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  wonderName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C4A24C',
    textAlign: 'center',
  },
  checkboxLabel: {
    flexShrink: 1,
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(196,162,76,0.25)',
    backgroundColor: 'rgba(196,162,76,0.08)',
    marginRight: 8,
    marginTop: 6,
  },
  chipText: { color: '#F3E7D3', fontSize: 11, fontWeight: '600' },
  chipNeutral: { borderColor: 'rgba(148,163,184,0.35)', backgroundColor: 'rgba(148,163,184,0.10)' },
  chipSuccess: { borderColor: 'rgba(34,197,94,0.35)', backgroundColor: 'rgba(34,197,94,0.10)' },
  chipWarn:    { borderColor: 'rgba(251,191,36,0.35)', backgroundColor: 'rgba(251,191,36,0.10)' },
  chipDanger:  { borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.10)' },

  /* Added styles used by the military note section to avoid missing style errors */
  noteCard: {
    marginTop: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 12,
  },
});

interface CategoryCardProps {
  category: CategoryKey;
  score: CategoryScore | null;
  playerId: string;
  wonderData?: any;
  expansions?: any;
}

// Category display configuration
const CATEGORY_CONFIG: Record<CategoryKey, { icon: string; name: string; description: string }> = {
  wonder: { icon: '🏛️', name: 'Wonder Board', description: 'Points from wonder stages' },
  treasury: { icon: '💰', name: 'Treasury', description: '3 coins = 1 VP (minus debt)' },
  military: { icon: '⚔️', name: 'Military', description: 'Conflict victories & shields' },
  civil: { icon: '🏛️', name: 'Civil (Blue)', description: 'Civic buildings & structures' },
  commercial: { icon: '💵', name: 'Commercial (Yellow)', description: 'Trade & commerce cards' },
  science: { icon: '🔬', name: 'Science (Green)', description: 'Research & technology' },
  guild: { icon: '👑', name: 'Guilds (Purple)', description: 'Professional associations' },
  cities: { icon: '🏙️', name: 'Cities (Black)', description: 'Urban developments' },
  leaders: { icon: '👑', name: 'Leaders (White)', description: 'Historical figures' },
  navy: { icon: '⚓', name: 'Naval Conflicts', description: 'Maritime battles' },
  islands: { icon: '🏝️', name: 'Islands', description: 'Exploration rewards' },
  edifice: { icon: '🗿', name: 'Edifice', description: 'Collaborative projects' },
};

const Checkbox = ({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

export const CategoryCard = memo(function CategoryCard({
  category,
  score,
  playerId,
  wonderData,
  expansions,
}: CategoryCardProps) {
  const { updateCategoryScore, updateDetailedData } = useScoringStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Setup info (players + selected Edifice projects) and all scores
  const { players, edificeProjects } = useSetupStore();
  // Use correct store key instead of a non-existent `scores`
  const playerScores = useScoringStore((s) => s.playerScores);

  // FIXED: Move all memoized calculations here with better dependency tracking
  const playerIds = useMemo(() => (players || []).map((p: any) => p.id), [players]);
  
  // Add a refresh trigger to force re-evaluation
  
  
  const edificeCompletion = useMemo(
    () => {
      console.log('🔄 Recalculating edifice completion...', { playerIds: playerIds.length, refreshTrigger });
      const result = evaluateEdificeCompletion(playerIds, playerScores);
      console.log('📊 Edifice completion result:', result);
      return result;
    },
    [playerIds, playerScores, refreshTrigger]
  );
  
  const edificeOutcome = useMemo(
    () => {
      console.log('🎯 Recalculating edifice outcome for player:', playerId);
      const result = edificeOutcomeForPlayer(playerId, playerIds, playerScores);
      console.log('🎲 Edifice outcome result:', result);
      return result;
    },
    [playerId, playerIds, playerScores]
  );

  // FIXED: All state hooks declared in consistent order
  const [isFocused, setIsFocused] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [inputValue, setInputValue] = useState(
    score?.directPoints !== null && score?.directPoints !== undefined ? String(score.directPoints) : ''
  );
  const [detailedData, setDetailedData] = useState<Record<string, any>>({});
  const [leaderQuery, setLeaderQuery] = useState<string>('');
  const [islandQuery, setIslandQuery] = useState<string>('');
  const [yellowQuery, setYellowQuery] = useState<string>('');
  const [purpleQuery, setPurpleQuery] = useState<string>('');
  const [blackQuery, setBlackQuery] = useState<string>('');
  // Wonder-specific quick inputs (avoid reusing leaders' search box)
  const [wonderLeaderQueries, setWonderLeaderQueries] = useState<Record<string, string>>({});
  
  const config = CATEGORY_CONFIG[category];
  
  // FIXED: All useCallback hooks declared in consistent order, regardless of category
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    
    if (text === '') {
      updateCategoryScore(playerId, category, null, false);
    } else {
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        updateCategoryScore(playerId, category, num, false);
      }
    }
  }, [playerId, category, updateCategoryScore]);
  
  const handleDetailedToggle = useCallback(() => {
    setShowDetailed(!showDetailed);
  }, [showDetailed]);
  
  const updateDetailedField = useCallback((field: string, value: any) => {
    const newData: Record<string, any> = { ...detailedData, [field]: value };
    setDetailedData(newData);
    updateDetailedData(playerId, category, newData);

    // Auto-calculate wonder points when stages are toggled
    if (category === 'wonder' && (field.startsWith('stage') || field.includes('Choice') || field.includes('BuriedLeader'))) {
      const wonderStagesData = getWonderStagesData(playerId);
      if (wonderStagesData) {
        const { wonderId } = wonderStagesData;
        // Compute base stage points with Carthage overrides and Abu Simbel extras
        let totalPoints = 0;
        wonderStagesData.stages.forEach((stage, index) => {
          const stageKey = `stage${index + 1}`;
          const isChecked = !!newData[stageKey];
          if (!isChecked) return;

          // Default: add fixed stage points if any
          let stagePts = stage.points || 0;

          // Special-case: Carthage stages with left/right choices where VP depends on the choice
          if (wonderId === 'carthage') {
            const choice = newData[`${stageKey}Choice`]; // 'left' | 'right'
            const desc: string = stage?.effect?.description || '';
            // Day stage 2: 'Choose: 7 coins OR +1 Military + 2 VP' -> BOTH choices grant +2 VP
            // Night stage 1: 'LEFT: 7 coins + 4 VP; RIGHT: +2 Military' -> VP only on LEFT
            if (/Choose: Gain 7 Coins OR \+1 Military Strength \+ 2 VP/i.test(desc)) {
              stagePts = 2;
            }
            if (/LEFT: Gain 7 Coins \+ 4 VP; RIGHT: \+2 Military Strength/i.test(desc)) {
              // When LEFT, 4 VP; when RIGHT, 0 VP
              stagePts = choice === 'left' ? 4 : 0;
            }
          }

          totalPoints += stagePts;
        });

        // Abu Simbel: add 2x buried leader cost per burial
        if (wonderId === 'abu_simbel') {
          const addBurialScore = (slotIdx: number) => {
            const sk = `stage${slotIdx}`;
            if (!newData[sk]) return 0; // must be built
            const name = newData[`${sk}BuriedLeaderName`];
            if (!name) return 0;
            const leader = getLeaderByName(name);
            if (!leader) return 0;
            let costPaid = leader.cost;
            if (leader.costType === 'age') {
              const age = parseInt(String(newData[`${sk}BuriedLeaderAge`] || ''), 10);
              if (!age || age < 1 || age > 3) return 0; // need age to evaluate cost
              costPaid = age; // age coins
            }
            return (costPaid || 0) * 2;
          };

          // Check up to first 3 stages for burial tags (Day has burial on stage 3; Night on stages 1 & 2)
          totalPoints += addBurialScore(1);
          totalPoints += addBurialScore(2);
          totalPoints += addBurialScore(3);
        }

        updateCategoryScore(playerId, category, totalPoints, true);

        // Carthage Night Stage 2: RIGHT choice grants a Science wild symbol at end game
        if (wonderStagesData.wonderId === 'carthage') {
          wonderStagesData.stages.forEach((stage, index) => {
            const stageKey = `stage${index + 1}`;
            const isChecked = !!newData[stageKey];
            if (!isChecked) return;
            const desc: string = stage?.effect?.description || '';
            if (/Endgame Science symbol of your choice/i.test(desc)) {
              const choice = newData[`${stageKey}Choice`];
              // Only apply on RIGHT
              if (choice === 'right' && !newData[`${stageKey}ChoiceSciApplied`]) {
                try {
                  const current = (useScoringStore.getState().playerScores?.[playerId]?.categories?.science?.detailedData || {}) as Record<string, any>;
                  const currentWild = parseInt(String(current.choiceTokens || 0), 10) || 0;
                  useScoringStore.getState().updateDetailedData(playerId, 'science', { ...current, choiceTokens: currentWild + 1 });
                  // Mark applied to avoid double-adding if user toggles choices
                  const marked = { ...newData, [`${stageKey}ChoiceSciApplied`]: true };
                  setDetailedData(marked);
                  updateDetailedData(playerId, category, marked);
                } catch (e) {
                  console.warn('Failed to propagate Carthage science bonus:', e);
                }
              }
            }
          });
        }
      }
    }
    
    // Auto-calculate leader points when leaders are selected
    if (category === 'leaders' && field === 'selectedLeaders') {
      const selectedLeaders = Array.isArray(value) ? value : [];
      const directVP = sumImmediateVP(selectedLeaders);
      updateCategoryScore(playerId, category, directVP, true);
    }

    // Auto-calc Islands direct VP
    if (category === 'islands' && field === 'selectedIslands') {
      const selected: string[] = Array.isArray(value) ? value : [];
      updateCategoryScore(playerId, 'islands', sumImmediateIslandVP(selected), true);
    }
  }, [detailedData, playerId, category, updateCategoryScore, updateDetailedData]);

  // FIXED: All leader-related callbacks declared consistently
  const addLeader = useCallback((name: string) => {
    if (!name) return;

    const selected: string[] = Array.isArray(detailedData.selectedLeaders) ? (detailedData.selectedLeaders as string[]) : [];
    const alreadySelected = selected.some((s: string) => s.toLowerCase() === name.toLowerCase());
    
    if (alreadySelected) {
      setLeaderQuery('');
      return;
    }

    const leader = getLeaderByName(name);
    if (!leader) {
      setLeaderQuery('');
      return;
    }
    
    const newSelected = [...selected, leader.name];
    updateDetailedField('selectedLeaders', newSelected);
    setLeaderQuery('');
  }, [detailedData, updateDetailedField]);

  const removeLeader = useCallback((name: string) => {
    const selected: string[] = Array.isArray(detailedData.selectedLeaders) ? (detailedData.selectedLeaders as string[]) : [];
    const newSelected = selected.filter((s: string) => s.toLowerCase() !== name.toLowerCase());
    updateDetailedField('selectedLeaders', newSelected);
  }, [detailedData, updateDetailedField]);

  // FIXED: All island-related callbacks declared consistently
  const addIsland = useCallback((name: string) => {
    if (!name) return;
    const selected: string[] = Array.isArray(detailedData.selectedIslands) ? detailedData.selectedIslands : [];
    if (selected.some(s => s.toLowerCase() === name.toLowerCase())) { 
      setIslandQuery(''); 
      return; 
    }
    const island = getIslandByName(name);
    if (!island) { 
      setIslandQuery(''); 
      return; 
    }
    updateDetailedField('selectedIslands', [...selected, island.name]);
    setIslandQuery('');
  }, [detailedData, updateDetailedField]);

  const removeIsland = useCallback((name: string) => {
    const selected: string[] = Array.isArray(detailedData.selectedIslands) ? detailedData.selectedIslands : [];
    updateDetailedField('selectedIslands', selected.filter(s => s.toLowerCase() !== name.toLowerCase()));
  }, [detailedData, updateDetailedField]);

  // FIXED: Edifice-related callbacks
  const setEdificeContribution = useCallback((age: 1|2|3, contributed: boolean) => {
    updateDetailedField(`contributedAge${age}`, contributed);
    // Clear stage selection when turning off contribution
    if (!contributed) {
      updateDetailedField(`contributedStageAge${age}`, undefined);
    }
  }, [updateDetailedField]);

  // Reset input value when player changes
  useEffect(() => {
    setInputValue(
      score?.directPoints !== null && score?.directPoints !== undefined 
        ? String(score.directPoints) 
        : ''
    );
    setShowDetailed(false);
    setLeaderQuery('');
    setIslandQuery('');
    setWonderLeaderQueries({});
  }, [playerId, score?.directPoints]);

  // Keep detailedData in sync with what's in the scoring store for this player/category
  useEffect(() => {
    if (score?.detailedData && typeof score.detailedData === 'object') {
      setDetailedData(score.detailedData);
    } else {
      setDetailedData({});
    }
  }, [playerId, category, score?.detailedData]);

  // FIXED: Move all computed values after all hooks
  // Return full leader objects for rendering (id, name, immediate effects, etc.)
  const suggestions = leaderQuery.length >= 1 ? searchLeaders(leaderQuery, 8) : [];
  const selectedLeaders: string[] = Array.isArray(detailedData.selectedLeaders) ? (detailedData.selectedLeaders as string[]) : [];
  const totalDirectVP = sumImmediateVP(selectedLeaders);
  
  const islandSuggestions = islandQuery.length >= 1 ? searchIslands(islandQuery, 8) : [];
  const selectedIslands: string[] = Array.isArray(detailedData.selectedIslands) ? detailedData.selectedIslands : [];
  const islandsDirectVP = sumImmediateIslandVP(selectedIslands);
  const purpleSuggestions = purpleQuery.length >= 1 ? searchPurpleCards(purpleQuery, 8) : [];
  const selectedPurpleCards: string[] = Array.isArray(detailedData.selectedPurpleCards) ? detailedData.selectedPurpleCards : [];
  const yellowSuggestions = yellowQuery.length >= 1 ? searchYellowCards(yellowQuery, 8) : [];
  const selectedYellowCards: string[] = useMemo(() => (
    Array.isArray(detailedData.selectedYellowCards) ? detailedData.selectedYellowCards as string[] : []
  ), [detailedData.selectedYellowCards]);
  const blackSuggestions = blackQuery.length >= 1 ? searchBlackCards(blackQuery, 8) : [];
  const selectedBlackCards: string[] = useMemo(() => (
    Array.isArray(detailedData.selectedBlackCards) ? detailedData.selectedBlackCards as string[] : []
  ), [detailedData.selectedBlackCards]);

  // Auto-calc Yellow end-game VP when inputs change (uses Analysis Helpers for brown/grey)
  const analysisByPlayer = useScoringStore((s) => s.analysisByPlayer || {});
  const yellowCtx = useMemo(() => {
    const wd = playerScores?.[playerId]?.categories?.wonder?.detailedData || {};
    const autoStages = Object.keys(wd).filter((k) => k.startsWith('stage') && wd[k]).length;
    const analysis = analysisByPlayer[playerId] || {};
    const redFromMilitary = playerScores?.[playerId]?.categories?.military?.detailedData?.redCardsCount;
    return {
      yellowCount: selectedYellowCards.length || detailedData.yellowCardsCount || 0,
      brownCount: (detailedData as any).brownCityCount ?? analysis.brownCards,
      greyCount: (detailedData as any).greyCityCount ?? analysis.grayCards,
      redCount: (detailedData as any).redCityCount ?? redFromMilitary,
      wonderStagesBuilt: (detailedData as any).wonderStagesBuilt ?? autoStages,
      commercialLevel: (detailedData as any).commercialLevel,
    };
  }, [analysisByPlayer, playerScores, playerId, selectedYellowCards, detailedData]);

  const yellowComputed = useMemo(() => sumYellowEndGameVP(selectedYellowCards, yellowCtx), [selectedYellowCards, yellowCtx]);

  useEffect(() => {
    if (category === 'commercial') {
      updateCategoryScore(playerId, 'commercial', yellowComputed.total, true);
    }
  }, [category, playerId, yellowComputed.total, updateCategoryScore]);

  // Auto-calc Black (Cities) end-game VP when inputs change
  const blackCtx = useMemo(() => {
    const mdd = playerScores?.[playerId]?.categories?.military?.detailedData || {};
    const age1 = detailedData.mvTokensAge1 ?? mdd.mvTokensAge1;
    const age2 = detailedData.mvTokensAge2 ?? mdd.mvTokensAge2;
    const age3 = detailedData.mvTokensAge3 ?? mdd.mvTokensAge3;
    const totalFromMilitary =
      (typeof age1 === 'number' ? age1 : 0) +
      (typeof age2 === 'number' ? age2 : 0) +
      (typeof age3 === 'number' ? age3 : 0);
    return {
      ownBlackCount: (Array.isArray(detailedData.selectedBlackCards) ? detailedData.selectedBlackCards.length : detailedData.blackCardsCount) || 0,
      mvTokensTotal: detailedData.mvTokensTotal ?? totalFromMilitary,
      mvTokensAge2: detailedData.mvTokensAge2 ?? age2,
      mvTokensAge3: detailedData.mvTokensAge3 ?? age3,
    };
  }, [playerScores, playerId, detailedData.selectedBlackCards, detailedData.blackCardsCount, detailedData.mvTokensTotal, detailedData.mvTokensAge1, detailedData.mvTokensAge2, detailedData.mvTokensAge3]);

  const blackComputed = useMemo(() => sumBlackEndGameVP(selectedBlackCards, blackCtx), [selectedBlackCards, blackCtx]);

  useEffect(() => {
    if (category === 'cities') {
      updateCategoryScore(playerId, 'cities', blackComputed.total, true);
    }
  }, [category, playerId, blackComputed.total, updateCategoryScore]);

  // Render detailed mode based on category
  const renderDetailedMode = () => {
    switch (category) {
      case 'wonder':
        const wonderStagesData = getWonderStagesData(playerId);
        
        if (!wonderStagesData || wonderStagesData.stages.length === 0) {
          return (
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>
                Wonder data not available. Please ensure a wonder is assigned to this player.
              </Text>
            </View>
          );
        }
        
        return (
          <>
            <View style={styles.wonderInfo}>
              <Text style={styles.wonderName}>
                {wonderStagesData.wonderName}
              </Text>
            </View>
            
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>
                Wonder Stages Completed ({wonderStagesData.stages.length} total)
              </Text>
              {wonderStagesData.stages.map((stage, index) => {
                const stageNumber = index + 1;
                const stageKey = `stage${stageNumber}`;
                const points = stage.points || 0;
                const effectDescription = stage.effect?.description || 'Special effect';
                const isCarthage = wonderStagesData.wonderId === 'carthage';
                const isAbu = wonderStagesData.wonderId === 'abu_simbel';
                const choiceKey = `${stageKey}Choice` as const;
                const buriedNameKey = `${stageKey}BuriedLeaderName` as const;
                const buriedAgeKey = `${stageKey}BuriedLeaderAge` as const;
                const hasLeftRight = isCarthage && (/Choose:/i.test(effectDescription) || /LEFT:/i.test(effectDescription));
                const hasBurial = isAbu && /Bury 1 recruited Leader/i.test(effectDescription);

                return (
                  <View key={stageKey}>
                    <Checkbox
                      checked={detailedData[stageKey] || false}
                      onToggle={() => updateDetailedField(stageKey, !detailedData[stageKey])}
                      label={`Stage ${stageNumber}: ${effectDescription}${(() => {
                        if (hasLeftRight) {
                          const choice = detailedData[choiceKey];
                          if (/Choose: Gain 7 Coins OR \+1 Military Strength \+ 2 VP/i.test(effectDescription)) {
                            // Day Stage 2: both choices grant +2 VP
                            return ' (+2 VP)';
                          }
                          if (/LEFT: Gain 7 Coins \+ 4 VP; RIGHT: \+2 Military Strength/i.test(effectDescription)) {
                            return choice === 'left' ? ' (+4 VP)' : '';
                          }
                        }
                        return points > 0 ? ` (+${points} VP)` : '';
                      })()}`}
                    />

                    {/* Carthage: ask for LEFT/RIGHT when applicable */}
                    {(detailedData[stageKey] && hasLeftRight) && (
                      <View style={{ marginLeft: 28, marginTop: 6 }}>
                        <Text style={styles.detailLabel}>Which effect did you choose?</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={[styles.detailButton, detailedData[choiceKey] === 'left' && styles.detailButtonActive]}
                            onPress={() => updateDetailedField(choiceKey, 'left')}
                          >
                            <Text style={styles.detailButtonText}>Left</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.detailButton, detailedData[choiceKey] === 'right' && styles.detailButtonActive]}
                            onPress={() => updateDetailedField(choiceKey, 'right')}
                          >
                            <Text style={styles.detailButtonText}>Right</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Small hints based on the specific stage */}
                        {/Choose: Gain 7 Coins OR \+1 Military Strength \+ 2 VP/i.test(effectDescription) && (
                          <Text style={styles.noteText}>
                            Both choices grant +2 VP. Left: +7 coins (add to Treasury). Right: +1 shield (adjust Military).
                          </Text>
                        )}
                        {/LEFT: Gain 7 Coins \+ 4 VP; RIGHT: \+2 Military Strength/i.test(effectDescription) && (
                          <Text style={styles.noteText}>
                            Left: +7 coins and +4 VP. Right: +2 shields (adjust Military strength accordingly).
                          </Text>
                        )}
                        {/Endgame Science symbol of your choice/i.test(effectDescription) && (
                          <Text style={styles.noteText}>
                            Right: Adds 1 science wild token; auto-applied to Science when selected.
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Abu Simbel: pick buried leader when stage is built */}
                    {(detailedData[stageKey] && hasBurial && expansions?.leaders) && (
                      <View style={{ marginLeft: 28, marginTop: 10 }}>
                        <Text style={styles.detailLabel}>Which Leader did you bury?</Text>
                        <TextInput
                          style={styles.detailInput}
                          value={wonderLeaderQueries[stageKey] || ''}
                          onChangeText={(text) => setWonderLeaderQueries((q) => ({ ...q, [stageKey]: text }))}
                          placeholder="Type a leader name..."
                          placeholderTextColor="rgba(196, 162, 76, 0.3)"
                        />
                        {/* Suggestions */}
                        {(wonderLeaderQueries[stageKey]?.length || 0) >= 1 && (
                          <ScrollView style={{ maxHeight: 120, marginTop: 6 }}>
                            {searchLeaders(wonderLeaderQueries[stageKey] || '', 8).map((leaderObj) => (
                              <TouchableOpacity
                                key={`${stageKey}-${leaderObj.id}`}
                                style={{ paddingVertical: 6 }}
                                onPress={() => {
                                  setWonderLeaderQueries((q) => ({ ...q, [stageKey]: '' }));
                                  updateDetailedField(buriedNameKey, leaderObj.name);
                                }}
                              >
                                <Text style={{ color: '#F3E7D3', fontSize: 12 }}>{leaderObj.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}

                        {/* Selected leader + age (if needed) */}
                        {detailedData[buriedNameKey] && (
                          <View style={{ marginTop: 8 }}>
                            <Text style={styles.detailLabel}>Buried: {String(detailedData[buriedNameKey])}</Text>
                            {(() => {
                              const L = getLeaderByName(String(detailedData[buriedNameKey]));
                              if (!L) return null;
                              const baseCost = L.costType === 'age' ? undefined : L.cost;
                              return (
                                <>
                                  {L.costType === 'age' && (
                                    <View style={{ marginTop: 6 }}>
                                      <Text style={styles.detailLabel}>At which Age was this Leader recruited? (1–3)</Text>
                                      <TextInput
                                        style={styles.detailInput}
                                        value={detailedData[buriedAgeKey]?.toString() || ''}
                                        onChangeText={(text) => updateDetailedField(buriedAgeKey, parseInt(text) || '')}
                                        keyboardType="number-pad"
                                        placeholder="1..3"
                                        placeholderTextColor="rgba(196, 162, 76, 0.3)"
                                      />
                                    </View>
                                  )}
                                  <View style={styles.calculatedScore}>
                                    <Text style={styles.calculatedLabel}>Burial Points</Text>
                                    <Text style={styles.calculatedValue}>
                                      {(() => {
                                        let paid = baseCost ?? 0;
                                        if (L.costType === 'age') {
                                          const age = parseInt(String(detailedData[buriedAgeKey] || ''), 10);
                                          paid = age && age >= 1 && age <= 3 ? age : 0;
                                        }
                                        return paid * 2;
                                      })()}
                                    </Text>
                                  </View>
                                </>
                              );
                            })()}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {Object.keys(detailedData).some(key => key.startsWith('stage') && detailedData[key]) && (
              <View style={styles.calculatedScore}>
                <Text style={styles.calculatedLabel}>Calculated Points</Text>
                <Text style={styles.calculatedValue}>
                  {(() => {
                    // Display current computed total using the same logic as updateDetailedField
                    let total = 0;
                    wonderStagesData.stages.forEach((stage, index) => {
                      const stageKey = `stage${index + 1}`;
                      if (!detailedData[stageKey]) return;
                      let pts = stage.points || 0;
                      if (wonderStagesData.wonderId === 'carthage') {
                        const choice = detailedData[`${stageKey}Choice`];
                        const desc: string = stage?.effect?.description || '';
                        if (/Choose: Gain 7 Coins OR \+1 Military Strength \+ 2 VP/i.test(desc)) {
                          // Day Stage 2: both choices grant 2 VP
                          pts = 2;
                        }
                        if (/LEFT: Gain 7 Coins \+ 4 VP; RIGHT: \+2 Military Strength/i.test(desc)) {
                          pts = choice === 'left' ? 4 : 0;
                        }
                      }
                      total += pts;
                    });
                    if (wonderStagesData.wonderId === 'abu_simbel') {
                      const add = (idx: number) => {
                        const sk = `stage${idx}`;
                        if (!detailedData[sk]) return 0;
                        const name = detailedData[`${sk}BuriedLeaderName`];
                        if (!name) return 0;
                        const L = getLeaderByName(String(name));
                        if (!L) return 0;
                        let paid = L.cost;
                        if (L.costType === 'age') {
                          const age = parseInt(String(detailedData[`${sk}BuriedLeaderAge`] || ''), 10);
                          paid = age && age >= 1 && age <= 3 ? age : 0;
                        }
                        return (paid || 0) * 2;
                      };
                      total += add(1) + add(2) + add(3);
                    }
                    return total;
                  })()}
                </Text>
              </View>
            )}
          </>
        );
        
      case 'treasury':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Coins at End of Game</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.coins?.toString() || ''}
                onChangeText={(text) => updateDetailedField('coins', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Debt from Played Cards</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.debtFromCards?.toString() || ''}
                onChangeText={(text) => updateDetailedField('debtFromCards', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Debt from Tax</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.debtFromTax?.toString() || ''}
                onChangeText={(text) => updateDetailedField('debtFromTax', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {expansions?.armada && (
              <>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Debt from Piracy</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.debtFromPiracy?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('debtFromPiracy', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Commercial Pot Taxes</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.commercialPotTaxes?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('commercialPotTaxes', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </>
            )}
            {(detailedData.coins !== undefined || detailedData.debtFromCards !== undefined || detailedData.debtFromTax !== undefined || detailedData.debtFromPiracy !== undefined || detailedData.commercialPotTaxes !== undefined) && (
              <View style={styles.calculatedScore}>
                <Text style={styles.calculatedLabel}>Calculated Points</Text>
                <Text style={styles.calculatedValue}>
                  {(Math.floor((detailedData.coins || 0) / 3)
                    - ((detailedData.debtFromCards || 0)
                    + (detailedData.debtFromTax || 0)
                    + (detailedData.debtFromPiracy || 0)
                    + (detailedData.commercialPotTaxes || 0)))}
                </Text>
              </View>
            )}
          </>
        );
        
      case 'military':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Military Victory Tokens (by Age)</Text>
              <View style={styles.inlineInputs}>
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.mvTokensAge1?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('mvTokensAge1', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age I"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.mvTokensAge2?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('mvTokensAge2', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age II"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.mvTokensAge3?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('mvTokensAge3', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age III"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Military Strength by Age</Text>
              <View style={styles.inlineInputs}>
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageI?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageI', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age I"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageII?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age II"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageIII?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageIII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age III"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            </View>
            {expansions?.cities && (
              <View style={styles.detailField}>
                <Text style={styles.detailLabel}>Red Dove Diplomacy Ages</Text>
                <View style={styles.inlineInputs}>
                  <Checkbox
                    checked={detailedData.doveAgeI}
                    onToggle={() => updateDetailedField('doveAgeI', !detailedData.doveAgeI)}
                    label="Age I"
                  />
                  <Checkbox
                    checked={detailedData.doveAgeII}
                    onToggle={() => updateDetailedField('doveAgeII', !detailedData.doveAgeII)}
                    label="Age II"
                  />
                  <Checkbox
                    checked={detailedData.doveAgeIII}
                    onToggle={() => updateDetailedField('doveAgeIII', !detailedData.doveAgeIII)}
                    label="Age III"
                  />
                </View>
              </View>
            )}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Red Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.redCardsCount?.toString() || ''}
                onChangeText={(text) => updateDetailedField('redCardsCount', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Chain Links Applied</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.chainLinks?.toString() || ''}
                onChangeText={(text) => updateDetailedField('chainLinks', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
          </>
        );
        
      case 'science':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Science Symbols</Text>
              <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>⚙️ Gears</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.gears?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('gears', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>🧭 Compass</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.compasses?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('compasses', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>📜 Tablets</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.tablets?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('tablets', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Wild/Choice Symbols (Scientists Guild, Babylon/Carthage, Golden Archipelago, Cities copy)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.choiceTokens?.toString() || ''}
                onChangeText={(text) => updateDetailedField('choiceTokens', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Most-Common +1 Tokens (Armada, Emerald Archipelago)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.mostCommonPlusTokens?.toString() || ''}
                onChangeText={(text) => updateDetailedField('mostCommonPlusTokens', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Neighbor Copies (Cities: Pigeonhole/Band of Spies/Torture Chamber)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.neighborCopies?.toString() || ''}
                onChangeText={(text) => updateDetailedField('neighborCopies', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Replace One Symbol (Aganice)</Text>
              <View style={styles.inlineInputs}>
                <Checkbox
                  checked={!!detailedData.replaceOneToken}
                  onToggle={() => updateDetailedField('replaceOneToken', detailedData.replaceOneToken ? 0 : 1)}
                  label="Use replace-one"
                />
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>How many green Science cards did you play?</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.greenCardsCount?.toString() || ''}
                onChangeText={(text) => updateDetailedField('greenCardsCount', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Chain links applied (Science)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.chainLinksUsed?.toString() || ''}
                onChangeText={(text) => updateDetailedField('chainLinksUsed', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Green cards that added symbols (optional)</Text>
              <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Compass</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.greenAddedCompass?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('greenAddedCompass', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Gear</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.greenAddedGear?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('greenAddedGear', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Tablet</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.greenAddedTablet?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('greenAddedTablet', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Other cards that added symbols (leaders/guilds/black/islands/wonders)</Text>
              <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Compass</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.otherAddedCompass?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('otherAddedCompass', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Gear</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.otherAddedGear?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('otherAddedGear', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>+ Tablet</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.otherAddedTablet?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('otherAddedTablet', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </View>
            </View>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Science points auto-calc: wilds balance sets first, most-common tokens add to your current max, and Aganice replaces one symbol if it improves your score.
              </Text>
            </View>
          </>
        );
        
      case 'civil':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Blue Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.blueCardsCount?.toString() || ''}
                onChangeText={(text) => updateDetailedField('blueCardsCount', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Direct Victory Points from Blue Cards</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.directPoints?.toString() || ''}
                onChangeText={(text) => updateDetailedField('directPoints', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Chain Links Applied</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.chainLinks?.toString() || ''}
                onChangeText={(text) => updateDetailedField('chainLinks', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {expansions?.armada && (
              <>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Blue Ship Position (0-7)</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.shipPosition?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('shipPosition', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Cards with Armada Ship Icons</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.armadaCards?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('armadaCards', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </>
            )}
          </>
        );
        
      case 'commercial':
        return (
          <>
            {/* Yellow Cards Picker */}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Add a Yellow (Commercial) card you built</Text>
              <TextInput
                style={styles.detailInput}
                value={yellowQuery}
                onChangeText={setYellowQuery}
                placeholder="Type a yellow card name (e.g., Light...)"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {yellowSuggestions.length > 0 && (
                <View style={{
                  marginTop: 6, borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)',
                  borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(28,26,26,0.6)', maxHeight: 220
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {yellowSuggestions.map(card => (
                      <TouchableOpacity key={card.id} onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedYellowCards) ? detailedData.selectedYellowCards : [];
                        if (!current.some(n => n.toLowerCase() === card.name.toLowerCase())) {
                          updateDetailedField('selectedYellowCards', [...current, card.name]);
                        }
                        setYellowQuery('');
                      }}
                        style={{ paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(196,162,76,0.1)' }}>
                        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>{card.name} · Age {card.age}{card.endGameVP ? ' · end-game VP' : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {selectedYellowCards.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Selected:</Text>
                  {selectedYellowCards.map((name: string) => (
                    <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <Text style={{ color: '#F3E7D3' }}>{name}</Text>
                      <TouchableOpacity onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedYellowCards) ? detailedData.selectedYellowCards : [];
                        updateDetailedField('selectedYellowCards', current.filter(n => n.toLowerCase() !== name.toLowerCase()));
                      }}>
                        <Text style={{ color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Yellow Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={(selectedYellowCards.length || detailedData.yellowCardsCount || 0).toString()}
                onChangeText={(text) => updateDetailedField('yellowCardsCount', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Chain Links Applied</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.chainLinks?.toString() || ''}
                onChangeText={(text) => updateDetailedField('chainLinks', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {/* Brown/Grey/Red now sourced from Analysis Helpers and other detailed categories */}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Wonder Stages Built (auto if Wonder detailed used)</Text>
              <TextInput
                style={styles.detailInput}
                value={(() => {
                  const wd = playerScores?.[playerId]?.categories?.wonder?.detailedData || {};
                  const auto = Object.keys(wd).filter(k => k.startsWith('stage') && wd[k]).length;
                  return (detailedData.wonderStagesBuilt ?? auto ?? 0).toString();
                })()}
                onChangeText={(text) => updateDetailedField('wonderStagesBuilt', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {expansions?.armada && (
              <View style={styles.detailField}>
                <Text style={styles.detailLabel}>Commercial Level (Yellow Naval Track)</Text>
                <TextInput
                  style={styles.detailInput}
                  value={detailedData.commercialLevel?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('commercialLevel', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            )}
            {expansions?.armada && (
              <>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Yellow Ship Position (0-7)</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.shipPosition?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('shipPosition', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Armada Expansion Cards</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={detailedData.armadaCards?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('armadaCards', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </>
            )}
            {/* Auto-calc end-game VP for yellow cards */}
            <View style={styles.calculatedScore}>
              <Text style={styles.calculatedLabel}>Calculated Yellow VP</Text>
              <Text style={styles.calculatedValue}>{yellowComputed.total}</Text>
              {yellowComputed.breakdown.filter(b => b.missing && b.missing.length).length > 0 && (
                <View style={styles.noteCard}>
              {yellowComputed.breakdown.filter(b => b.missing && b.missing.length).map((b, i) => (
                <Text key={i} style={styles.noteText}>
                  Note: cannot finalize &quot;{b.name}&quot; - missing {b.missing?.join(', ')}. Update these in Analysis Helpers or fields above.
                </Text>
              ))}
                </View>
              )}
            </View>
            {expansions?.cities && (
              <View style={styles.detailField}>
                <Text style={styles.detailLabel}>Cities Expansion Cards</Text>
                <TextInput
                  style={styles.detailInput}
                  value={detailedData.citiesCards?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('citiesCards', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            )}
          </>
        );
        
      case 'guild':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Add a Purple (Guild) card you built</Text>
              <TextInput
                style={styles.detailInput}
                value={purpleQuery}
                onChangeText={setPurpleQuery}
                placeholder="Type a purple card name (e.g., Traders...)"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {purpleSuggestions.length > 0 && (
                <View style={{
                  marginTop: 6, borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)',
                  borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(28,26,26,0.6)', maxHeight: 220
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {purpleSuggestions.map(card => (
                      <TouchableOpacity key={card.id} onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedPurpleCards) ? detailedData.selectedPurpleCards : [];
                        if (!current.some(n => n.toLowerCase() === card.name.toLowerCase())) {
                          updateDetailedField('selectedPurpleCards', [...current, card.name]);
                        }
                        setPurpleQuery('');
                      }}
                        style={{ paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(196,162,76,0.1)' }}>
                        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>{card.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {selectedPurpleCards.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Selected:</Text>
                  {selectedPurpleCards.map((name: string) => (
                    <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <Text style={{ color: '#F3E7D3' }}>{name}</Text>
                      <TouchableOpacity onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedPurpleCards) ? detailedData.selectedPurpleCards : [];
                        updateDetailedField('selectedPurpleCards', current.filter(n => n.toLowerCase() !== name.toLowerCase()));
                      }}>
                        <Text style={{ color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {selectedPurpleCards.some(n => n.toLowerCase() === 'scientists guild'.toLowerCase()) && (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  Scientists Guild adds 1 Science choice symbol (no direct VP). Update this under Science detailed mode.
                </Text>
              </View>
            )}
            {/* Calculated Guild VP (store-sourced) */}
            <View style={styles.calculatedScore}>
              <Text style={styles.calculatedLabel}>Calculated Guild VP</Text>
              <Text style={styles.calculatedValue}>{playerScores?.[playerId]?.categories?.guild?.calculatedPoints ?? 0}</Text>
            </View>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Guild VP auto-updates when you or neighbors enter details (card counts, wonder stages, leaders, coins). Missing info per card will be flagged.
              </Text>
            </View>
          </>
        );
        
      case 'cities':
        return (
          <>
            {/* Black Cards Picker */}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Add a Black (Cities) card you built</Text>
              <TextInput
                style={styles.detailInput}
                value={blackQuery}
                onChangeText={setBlackQuery}
                placeholder="Type a black card name (e.g., Secret Net...)"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {blackSuggestions.length > 0 && (
                <View style={{
                  marginTop: 6, borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)',
                  borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(28,26,26,0.6)', maxHeight: 220
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {blackSuggestions.map((card: any) => (
                      <TouchableOpacity key={card.id} onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedBlackCards) ? detailedData.selectedBlackCards : [];
                        if (!current.some(n => n.toLowerCase() === card.name.toLowerCase())) {
                          updateDetailedField('selectedBlackCards', [...current, card.name]);
                        }
                        setBlackQuery('');
                      }}
                        style={{ paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(196,162,76,0.1)' }}>
                        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>{card.name} · Age {card.age}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {selectedBlackCards.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Selected:</Text>
                  {selectedBlackCards.map((name: string) => (
                    <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                      <Text style={{ color: '#F3E7D3' }}>{name}</Text>
                      <TouchableOpacity onPress={() => {
                        const current: string[] = Array.isArray(detailedData.selectedBlackCards) ? detailedData.selectedBlackCards : [];
                        updateDetailedField('selectedBlackCards', current.filter(n => n.toLowerCase() !== name.toLowerCase()));
                      }}>
                        <Text style={{ color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Black Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={(selectedBlackCards.length || detailedData.blackCardsCount || 0).toString()}
                onChangeText={(text) => updateDetailedField('blackCardsCount', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Cards with Direct Points</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.directPointCards?.toString() || ''}
                onChangeText={(text) => updateDetailedField('directPointCards', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {/* Tokens for MV-based black cards */}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Military Victory Tokens (for end-game VP)</Text>
              <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Total</Text>
                  <TextInput style={styles.smallInput} value={detailedData.mvTokensTotal?.toString() || ''}
                    onChangeText={(t) => updateDetailedField('mvTokensTotal', parseInt(t) || 0)} keyboardType="number-pad"
                    placeholder="0" placeholderTextColor="rgba(196, 162, 76, 0.3)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Age II</Text>
                  <TextInput style={styles.smallInput} value={detailedData.mvTokensAge2?.toString() || ''}
                    onChangeText={(t) => updateDetailedField('mvTokensAge2', parseInt(t) || 0)} keyboardType="number-pad"
                    placeholder="0" placeholderTextColor="rgba(196, 162, 76, 0.3)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Age III</Text>
                  <TextInput style={styles.smallInput} value={detailedData.mvTokensAge3?.toString() || ''}
                    onChangeText={(t) => updateDetailedField('mvTokensAge3', parseInt(t) || 0)} keyboardType="number-pad"
                    placeholder="0" placeholderTextColor="rgba(196, 162, 76, 0.3)" />
                </View>
              </View>
            </View>
            {/* Calculated Black VP */}
            <View style={styles.calculatedScore}>
              <Text style={styles.calculatedLabel}>Calculated Black (Cities) VP</Text>
              <Text style={styles.calculatedValue}>{blackComputed.total}</Text>
              {blackComputed.breakdown.filter((b: any) => b.missing && b.missing.length).length > 0 && (
                <View style={styles.noteCard}>
              {blackComputed.breakdown.filter((b: any) => b.missing && b.missing.length).map((b: any, i: number) => (
                <Text key={i} style={styles.noteText}>
                  Note: cannot finalize &quot;{b.name}&quot; - missing {b.missing?.join(', ')}.
                </Text>
              ))}
                </View>
              )}
            </View>
          </>
        );
        
      case 'leaders':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Add a recruited Leader</Text>
              <TextInput
                style={styles.detailInput}
                value={leaderQuery}
                onChangeText={setLeaderQuery}
                placeholder="Type a leader name (e.g., Cleo...)"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <View style={{
                  marginTop: 6, 
                  borderWidth: 1, 
                  borderColor: 'rgba(196,162,76,0.2)',
                  borderRadius: 8, 
                  overflow: 'hidden', 
                  backgroundColor: 'rgba(28,26,26,0.6)',
                  maxHeight: 200,
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {suggestions.map((leader) => (
                      <TouchableOpacity
                        key={leader.id}
                        onPress={() => addLeader(leader.name)}
                        style={{ 
                          paddingHorizontal: 10, 
                          paddingVertical: 8, 
                          borderBottomWidth: 1, 
                          borderBottomColor: 'rgba(196,162,76,0.1)' 
                        }}
                      >
                        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>
                          {leader.name}
                          {leader.immediate?.vp ? ` • +${leader.immediate?.vp} VP (direct)` : ''}
                          {leader.immediate?.coins ? ` • ${leader.immediate?.coins} coins` : ''}
                          {leader.immediate?.military ? ` • +${leader.immediate?.military} military` : ''}
                        </Text>
                        {leader.textEffect && (
                          <Text style={{ 
                            color:'rgba(243,231,211,0.6)', 
                            fontSize:11, 
                            marginTop:2 
                          }}>
                            {leader.textEffect}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Selected leaders list as removable chips + leader-specific prompts */}
            {selectedLeaders.length > 0 && (
              <View style={styles.detailField}>
                <Text style={styles.detailLabel}>Recruited Leaders ({selectedLeaders.length})</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                  {selectedLeaders.map((name) => {
                    const leader = getLeaderByName(name);
                    const vp = leader?.immediate?.vp ?? 0;
                    return (
                      <View key={name} style={{
                        flexDirection:'row', 
                        alignItems:'center',
                        backgroundColor:'rgba(99,102,241,0.2)', 
                        borderWidth:1,
                        borderColor:'rgba(99,102,241,0.3)', 
                        paddingHorizontal:10,
                        paddingVertical:6, 
                        borderRadius:16
                      }}>
                        <Text style={{ 
                          color:'#818CF8', 
                          fontSize:12, 
                          fontWeight:'600' 
                        }}>
                          {name}{vp ? ` (+${vp} VP)` : ''}
                        </Text>
                        {/* Agrippina: quick confirmation toggle */}
                        {name.toLowerCase() === 'agrippina' && (
                          <View style={{ flexDirection:'row', alignItems:'center', marginLeft:8, gap:6 }}>
                            <Text style={{ color:'#C4A24C', fontSize:11 }}>Only face-up Leader?</Text>
                            <TouchableOpacity
                              onPress={() => updateDetailedField('agrippinaOnly', !detailedData.agrippinaOnly)}
                              style={{
                                paddingHorizontal:8,
                                paddingVertical:3,
                                borderRadius:10,
                                borderWidth:1,
                                borderColor: detailedData.agrippinaOnly ? '#10B981' : 'rgba(196,162,76,0.3)',
                                backgroundColor: detailedData.agrippinaOnly ? 'rgba(16,185,129,0.25)' : 'transparent'
                              }}
                            >
                              <Text style={{ color: detailedData.agrippinaOnly ? '#10B981' : 'rgba(243,231,211,0.6)', fontSize:11 }}>
                                {detailedData.agrippinaOnly ? 'True' : 'False'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <TouchableOpacity
                          onPress={() => removeLeader(name)}
                          style={{ marginLeft: 8 }}
                        >
                          <Text style={{ color: '#818CF8', fontSize: 12 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Calculated direct VP preview */}
            <View style={styles.calculatedScore}>
              <Text style={styles.calculatedLabel}>Direct VP from Leaders</Text>
              <Text style={styles.calculatedValue}>{totalDirectVP}</Text>
              <Text style={[styles.calculatedLabel, { marginTop: 4 }]}>
                Auto-calculated and applied to your score
              </Text>
            </View>

            {/* Notes/help */}
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>
                Leaders with immediate VP (Sappho, Zenobia, Nefertiti, Cleopatra, Aspasia) are auto-scored. 
                Coins, military, diplomacy, and end-game effects are integrated into detailed scoring where applicable. Nearly all leaders that provide points have been attempted to register for scoring; please provide feedback if something is missing or wrong.
              </Text>
            </View>
          </>
        );
        
      case 'navy':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Naval Strength by Age</Text>
              <View style={styles.inlineInputs}>
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageI?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageI', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age I"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageII?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age II"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
                <TextInput
                  style={styles.smallInput}
                  value={detailedData.ageIII?.toString() || ''}
                  onChangeText={(text) => updateDetailedField('ageIII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="Age III"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Red Ship Position (0-7)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.redShipPosition?.toString() || ''}
                onChangeText={(text) => updateDetailedField('redShipPosition', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Cards Contributing to Navy</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.navyCards?.toString() || ''}
                onChangeText={(text) => updateDetailedField('navyCards', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Blue Dove Diplomacy Ages</Text>
              <View style={styles.inlineInputs}>
                <Checkbox
                  checked={detailedData.blueDoveI}
                  onToggle={() => updateDetailedField('blueDoveI', !detailedData.blueDoveI)}
                  label="Age I"
                />
                <Checkbox
                  checked={detailedData.blueDoveII}
                  onToggle={() => updateDetailedField('blueDoveII', !detailedData.blueDoveII)}
                  label="Age II"
                />
                <Checkbox
                  checked={detailedData.blueDoveIII}
                  onToggle={() => updateDetailedField('blueDoveIII', !detailedData.blueDoveIII)}
                  label="Age III"
                />
              </View>
            </View>
          </>
        );
        
      case 'islands':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Add an Island card you gained</Text>
              <TextInput
                style={styles.detailInput}
                value={islandQuery}
                onChangeText={setIslandQuery}
                placeholder="Type an island name (e.g., Inhab...)"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {islandSuggestions.length > 0 && (
                <View style={{
                  marginTop: 6, borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)',
                  borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(28,26,26,0.6)', maxHeight: 220
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {islandSuggestions.map(card => (
                      <TouchableOpacity key={card.id} onPress={() => addIsland(card.name)}
                        style={{ paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(196,162,76,0.1)' }}>
                        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>
                          {card.name} • L{card.level}
                          {card.immediate?.vp ? ` • +${card.immediate.vp} VP (direct)` : ''}
                          {card.immediate?.naval ? ` • +${card.immediate.naval} naval` : ''}
                          {card.immediate?.military ? ` • +${card.immediate.military} military` : ''}
                          {card.immediate?.advanceFleet?.length ? ` • fleet advance` : ''}
                        </Text>
                        {!!card.notes?.length && (
                          <Text style={{ color: 'rgba(243,231,211,0.6)', fontSize: 11, marginTop: 2 }}>
                            {card.notes[0]}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {selectedIslands.length > 0 && (
              <View style={styles.detailField}>
                <Text style={styles.detailLabel}>Islands Collected ({selectedIslands.length})</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedIslands.map(name => {
                    const card = getIslandByName(name);
                    const vp = card?.immediate?.vp ?? 0;
                    return (
                      <View key={name} style={{
                        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.18)',
                        borderWidth: 1, borderColor: 'rgba(16,185,129,0.28)', paddingHorizontal: 10,
                        paddingVertical: 6, borderRadius: 16
                      }}>
                        <Text style={{ color: '#A7F3D0', fontSize: 12, fontWeight: '600' }}>
                          {name}{vp ? ` (+${vp} VP)` : ''}
                        </Text>
                        <TouchableOpacity onPress={() => removeIsland(name)} style={{ marginLeft: 8 }}>
                          <Text style={{ color: '#A7F3D0', fontSize: 12 }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.calculatedScore}>
              <Text style={styles.calculatedLabel}>Direct VP from Islands</Text>
              <Text style={styles.calculatedValue}>{islandsDirectVP}</Text>
              <Text style={[styles.calculatedLabel, { marginTop: 4 }]}>
                Auto-applied (end-game/indirect effects are stored for analysis)
              </Text>
            </View>
          </>
        );

      case 'edifice': {
        const projByAge: Record<1|2|3, any> = {
          1: edificeProjects?.age1 ? getProjectById(edificeProjects.age1) : null,
          2: edificeProjects?.age2 ? getProjectById(edificeProjects.age2) : null,
          3: edificeProjects?.age3 ? getProjectById(edificeProjects.age3) : null,
        };
        const ages: (1|2|3)[] = [1, 2, 3];

        // Calculate total effects for this player
        let totalCoinsDelta = 0;
        let totalMilitaryTokensII = 0;
        let totalMilitaryTokensIII = 0;
        let totalMilitaryStrength = 0;
        let totalPenaltyEffects: string[] = [];
        const effectsBreakdown: string[] = [];

        ages.forEach(age => {
          const project = projByAge[age];
          if (!project) return;

          const outcome = edificeOutcome[age];

          if (outcome === 'reward' && project.reward) {
            const r = project.reward;
            switch (r.kind) {
              case 'Coins':
                totalCoinsDelta += r.amount || 0;
                effectsBreakdown.push(`Age ${age}: +${r.amount || 0} coins (reward)`);
                break;
              case 'MilitaryVictoryToken':
                if (r.tokenAge === 2) totalMilitaryTokensII += r.amount || 0;
                else if (r.tokenAge === 3) totalMilitaryTokensIII += r.amount || 0;
                effectsBreakdown.push(`Age ${age}: +${r.amount || 0} Age ${r.tokenAge} military tokens (reward)`);
                break;
              case 'MilitaryStrength':
                totalMilitaryStrength += r.amount || 0;
                effectsBreakdown.push(`Age ${age}: +${r.amount || 0} military strength (reward)`);
                break;
              case 'EndGameVP':
                // These would need city snapshot data to calculate properly
                effectsBreakdown.push(`Age ${age}: VP bonus from ${project.name} (reward) - calculate manually`);
                break;
              case 'Special':
                effectsBreakdown.push(`Age ${age}: ${r.description} (reward)`);
                break;
            }
          } else if (outcome === 'penalty' && project.penalty) {
            const p = project.penalty;
            switch (p.kind) {
              case 'Coins':
                totalCoinsDelta -= p.amount || 0;
                effectsBreakdown.push(`Age ${age}: -${p.amount || 0} coins (penalty)`);
                break;
              case 'RemoveCard':
                totalPenaltyEffects.push(`Remove 1 ${p.colorToRemove} card from Age ${age}`);
                effectsBreakdown.push(`Age ${age}: Remove 1 ${p.colorToRemove} card (penalty)`);
                break;
              case 'LoseMilitaryVictoryTokens':
                totalPenaltyEffects.push(`Lose ${p.amount || 0} military victory tokens from Age ${age}`);
                effectsBreakdown.push(`Age ${age}: Lose ${p.amount || 0} military tokens (penalty)`);
                break;
            }
          }
        });

        const StagePill = ({active, label, onPress}: any) => (
          <TouchableOpacity
            onPress={onPress}
            style={{
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
              borderWidth: 1,
              borderColor: active ? '#C4A24C' : 'rgba(196,162,76,0.2)',
              backgroundColor: active ? 'rgba(196,162,76,0.15)' : 'transparent',
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#F3E7D3', fontSize: 12 }}>{label}</Text>
          </TouchableOpacity>
        );

        return (
          <>
            <View style={[styles.detailField, { marginTop: 2 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.detailLabel, { fontStyle: 'italic', flex: 1 }]}>
                  Mark your contributions below. Effects apply automatically based on completion status.
                </Text>
                <TouchableOpacity
                  onPress={() => setRefreshTrigger(prev => prev + 1)}
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Text style={{ color: '#818CF8', fontSize: 10, fontWeight: '600' }}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Debug Info (remove this in production) */}
            {edificeCompletion.debug && (
              <View style={[styles.detailField, { backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: 8, borderRadius: 6 }]}>
                <Text style={[styles.detailLabel, { fontSize: 10, color: '#9CA3AF' }]}>
                  🐛 Debug: {edificeCompletion.debug.playerCount} players, need {edificeCompletion.debug.required} contributions
                  {'\n'}Counts: Age1={edificeCompletion.counts[1]}, Age2={edificeCompletion.counts[2]}, Age3={edificeCompletion.counts[3]}
                  {'\n'}Your data found: {Object.keys(edificeCompletion.debug.playerData[playerId]?.detailedData || {}).join(', ')}
                </Text>
              </View>
            )}

            {/* Effects Summary */}
            {effectsBreakdown.length > 0 && (
              <View style={[styles.calculatedScore, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Text style={styles.calculatedLabel}>📊 Calculated Edifice Effects</Text>
                {totalCoinsDelta !== 0 && (
                  <Text style={[styles.calculatedValue, { fontSize: 16, color: totalCoinsDelta > 0 ? '#22C55E' : '#EF4444' }]}>
                    {totalCoinsDelta > 0 ? '+' : ''}{totalCoinsDelta} coins → Add to Treasury
                  </Text>
                )}
                {totalMilitaryTokensII > 0 && (
                  <Text style={[styles.calculatedValue, { fontSize: 16, color: '#22C55E' }]}>
                    +{totalMilitaryTokensII} Age II tokens → Add to Military
                  </Text>
                )}
                {totalMilitaryTokensIII > 0 && (
                  <Text style={[styles.calculatedValue, { fontSize: 16, color: '#22C55E' }]}>
                    +{totalMilitaryTokensIII} Age III tokens → Add to Military
                  </Text>
                )}
                {totalMilitaryStrength > 0 && (
                  <Text style={[styles.calculatedValue, { fontSize: 16, color: '#22C55E' }]}>
                    +{totalMilitaryStrength} military strength → Add to Military
                  </Text>
                )}
                {totalPenaltyEffects.map((effect, i) => (
                  <Text key={i} style={[styles.calculatedValue, { fontSize: 14, color: '#EF4444' }]}>
                    ⚠️ {effect}
                  </Text>
                ))}
                <Text style={[styles.calculatedLabel, { marginTop: 4, fontSize: 10 }]}>
                  💡 Apply these effects manually to the relevant scoring categories
                </Text>
              </View>
            )}

            {ages.map((age) => {
              const project = projByAge[age];
              const contributed = !!detailedData[`contributedAge${age}`];
              const stageKey = `contributedStageAge${age}`;
              const stageVal = detailedData[stageKey] as 1 | 2 | 3 | undefined;

              const complete = !!edificeCompletion.completeByAge[age];
              const took = edificeCompletion.counts[age];
              const req = edificeCompletion.required;
              const outcome = edificeOutcome[age]; // 'reward' | 'penalty' | 'none'

              return (
                <View
                  key={age}
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: outcome === 'reward' ? 'rgba(34, 197, 94, 0.1)' : 
                                    outcome === 'penalty' ? 'rgba(239, 68, 68, 0.1)' : 
                                    'rgba(31, 41, 55, 0.4)',
                    borderWidth: 1,
                    borderColor: outcome === 'reward' ? 'rgba(34, 197, 94, 0.3)' : 
                                outcome === 'penalty' ? 'rgba(239, 68, 68, 0.3)' : 
                                'rgba(196, 162, 76, 0.2)',
                  }}
                >
                  <Text style={[styles.detailLabel, { fontWeight: '700' }]}>
                    Age {age}: {project ? project.name : '— (no project selected in setup)'}
                  </Text>

                  {project && (
                    <Text style={[styles.detailLabel, { fontSize: 11 }]}>
                      Cost: {project.participationCostCoins} coins • Reward: {project.reward?.description || '—'} • Penalty: {project.penalty?.description || '—'}
                    </Text>
                  )}

                  {/* Contribution checkbox */}
                  <Checkbox
                    checked={contributed}
                    onToggle={() => setEdificeContribution(age, !contributed)}
                    label="I contributed to this project"
                  />

                  {/* Status chips on their own row (no clipping, wraps neatly) */}
                  <View style={styles.statusRow}>
                    <View style={[styles.chip, complete ? styles.chipSuccess : styles.chipWarn]}>
                      <Text style={styles.chipText}>
                        {complete ? `✅ Complete (${took}/${req})` : `⏳ Incomplete (${took}/${req})`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.chip,
                        outcome === 'penalty'
                          ? styles.chipDanger
                          : outcome === 'reward'
                          ? styles.chipSuccess
                          : styles.chipNeutral,
                      ]}
                    >
                      <Text style={styles.chipText}>
                        {outcome === 'penalty'
                          ? '💀 Penalty Applied'
                          : outcome === 'reward'
                          ? '🎉 Reward Granted'
                          : '➖ No Effect'}
                      </Text>
                    </View>
                  </View>

                  {/* Show specific effect for this age */}
                  {outcome !== 'none' && project && (
                    <View style={{ 
                      marginTop: 8, 
                      padding: 8, 
                      backgroundColor: outcome === 'reward' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      borderRadius: 6 
                    }}>
                      <Text style={{ 
                        color: outcome === 'reward' ? '#22C55E' : '#EF4444', 
                        fontSize: 12, 
                        fontWeight: '600' 
                      }}>
                        {outcome === 'reward' ? '🎁 ' : '⚡ '}
                        {outcome === 'reward' ? project.reward?.description : project.penalty?.description}
                      </Text>
                    </View>
                  )}

                  {/* Optional: which Wonder stage was used to contribute */}
                  {contributed && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.detailLabel}>Wonder Stage used to contribute (optional)</Text>
                      <View style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }}>
                        <StagePill
                          active={stageVal === 1}
                          label="Stage I"
                          onPress={() => updateDetailedField(stageKey, stageVal === 1 ? undefined : 1)}
                        />
                        <StagePill
                          active={stageVal === 2}
                          label="Stage II"
                          onPress={() => updateDetailedField(stageKey, stageVal === 2 ? undefined : 2)}
                        />
                        <StagePill
                          active={stageVal === 3}
                          label="Stage III"
                          onPress={() => updateDetailedField(stageKey, stageVal === 3 ? undefined : 3)}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Instruction card */}
            <View style={[styles.detailField, { backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 8, marginTop: 12 }]}>
              <Text style={[styles.detailLabel, { fontSize: 11, color: 'rgba(99, 102, 241, 0.8)' }]}>
                💡 <Text style={{ fontWeight: 'bold' }}>How to use these effects:</Text>
              </Text>
              <Text style={[styles.detailLabel, { fontSize: 10, marginTop: 4 }]}>
                • Coin effects: Add/subtract from your Treasury category{'\n'}
                • Military tokens: Add to your Military category total{'\n'}
                • Card removal penalties: Subtract those card points from the relevant color category{'\n'}
                • VP bonuses: Calculate based on your city composition and add to Edifice direct points above
              </Text>
            </View>
          </>
        );
      }

      default:
        return (
          <View style={styles.detailField}>
            <Text style={styles.detailLabel}>
              Detailed entry for {config.name} coming soon!
              Enter direct points above for now.
            </Text>
          </View>
        );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>
            {config.icon} {config.name}
          </Text>
          <Text style={styles.categoryDescription}>
            {config.description}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <TextInput
            style={[
              styles.scoreInput,
              isFocused && styles.scoreInputFocused,
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0"
            placeholderTextColor="rgba(196, 162, 76, 0.3)"
            keyboardType="number-pad"
            maxLength={3}
            returnKeyType="done"
          />
          
          {score?.isDetailed && score.directPoints === null && score.calculatedPoints !== undefined && (
            <View style={styles.tbdLabel}>
              <Text style={styles.tbdText}>Auto: {score.calculatedPoints}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.detailButton,
              showDetailed && styles.detailButtonActive,
            ]}
            onPress={handleDetailedToggle}
          >
            <Text style={styles.detailButtonText}>
              {showDetailed ? 'Hide' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {showDetailed && (
        <ScrollView
          style={styles.detailedContent}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {renderDetailedMode()}
        </ScrollView>
      )}
    </View>
  );
});
