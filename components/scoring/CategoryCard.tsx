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
import {
  edificeOutcomeForPlayer,
  evaluateEdificeCompletion,
  getProjectById
} from '../../data/edificeDatabase';
import { getIslandByName, searchIslands, sumImmediateIslandVP } from '../../data/islandsDatabase';
import { getLeaderByName, searchLeaders, sumImmediateVP } from '../../data/leadersDatabase';
import { CategoryKey, CategoryScore, useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

// Get actual wonder stages from the database
function getWonderStagesData(playerId: string): { stages: any[], wonderName: string } | null {
  try {
    const { players, wonders } = require('../../store/setupStore').useSetupStore.getState();
    const { getWonderById, getWonderSide } = require('../../data/wondersDatabase');
    
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
      wonderName: wonder.name
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

export const CategoryCard = memo<CategoryCardProps>(({
  category,
  score,
  playerId,
  wonderData,
  expansions,
}) => {
  const { updateCategoryScore, updateDetailedData } = useScoringStore();
  
  // Setup info (players + selected Edifice projects) and all scores
  const { players, edificeProjects } = useSetupStore();
  // Use correct store key instead of a non-existent `scores`
  const playerScores = useScoringStore((s) => s.playerScores);

  // FIXED: Move all memoized calculations here with better dependency tracking
  const playerIds = useMemo(() => (players || []).map((p: any) => p.id), [players]);
  
  // Add a refresh trigger to force re-evaluation
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
    [playerId, playerIds, playerScores, refreshTrigger]
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
    if (category === 'wonder' && field.startsWith('stage')) {
      const wonderStagesData = getWonderStagesData(playerId);
      if (wonderStagesData) {
        let totalPoints = 0;
        wonderStagesData.stages.forEach((stage, index) => {
          const stageKey = `stage${index + 1}`;
          if (newData[stageKey] && stage.points) {
            totalPoints += stage.points;
          }
        });
        updateCategoryScore(playerId, category, totalPoints, true);
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
    // Force recompute in case store selector memoization delays updates
    setRefreshTrigger((prev) => prev + 1);
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
  const suggestions = leaderQuery.length >= 1 ? searchLeaders(leaderQuery, 8) : [];
  const selectedLeaders: string[] = Array.isArray(detailedData.selectedLeaders) ? (detailedData.selectedLeaders as string[]) : [];
  const totalDirectVP = sumImmediateVP(selectedLeaders);
  
  const islandSuggestions = islandQuery.length >= 1 ? searchIslands(islandQuery, 8) : [];
  const selectedIslands: string[] = Array.isArray(detailedData.selectedIslands) ? detailedData.selectedIslands : [];
  const islandsDirectVP = sumImmediateIslandVP(selectedIslands);

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
                
                return (
                  <Checkbox
                    key={stageKey}
                    checked={detailedData[stageKey] || false}
                    onToggle={() => updateDetailedField(stageKey, !detailedData[stageKey])}
                    label={`Stage ${stageNumber}: ${effectDescription}${points > 0 ? ` (+${points} VP)` : ''}`}
                  />
                );
              })}
            </View>
            
            {Object.keys(detailedData).some(key => key.startsWith('stage') && detailedData[key]) && (
              <View style={styles.calculatedScore}>
                <Text style={styles.calculatedLabel}>Calculated Points</Text>
                <Text style={styles.calculatedValue}>
                  {wonderStagesData.stages.reduce((total, stage, index) => {
                    const stageKey = `stage${index + 1}`;
                    return total + (detailedData[stageKey] && stage.points ? stage.points : 0);
                  }, 0)}
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
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Yellow Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.yellowCardsCount?.toString() || ''}
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
              <Text style={styles.detailLabel}>Guild Cards Played (enter names)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.guildNames || ''}
                onChangeText={(text) => updateDetailedField('guildNames', text)}
                placeholder="e.g., Traders Guild, Builders Guild"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Points from Guild Cards</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.totalPoints?.toString() || ''}
                onChangeText={(text) => updateDetailedField('totalPoints', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
          </>
        );
        
      case 'cities':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Black Cards Played</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.blackCardsCount?.toString() || ''}
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
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Cards Affecting Neighbors (Positive)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.positiveNeighbor?.toString() || ''}
                onChangeText={(text) => updateDetailedField('positiveNeighbor', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Cards Affecting Neighbors (Negative/Tax)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.negativeNeighbor?.toString() || ''}
                onChangeText={(text) => updateDetailedField('negativeNeighbor', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
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

            {/* Selected leaders list as removable chips */}
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
                        <TouchableOpacity 
                          onPress={() => removeLeader(name)} 
                          style={{ marginLeft:8 }}
                        >
                          <Text style={{ color:'#818CF8', fontSize:12 }}>✕</Text>
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
                Coins, military, diplomacy, and end-game effects are stored for future analysis.
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
        let totalEdificePoints = 0;
        let totalCoinsDelta = 0;
        let totalMilitaryTokensII = 0;
        let totalMilitaryTokensIII = 0;
        let totalMilitaryStrength = 0;
        let totalPenaltyEffects: string[] = [];
        const effectsBreakdown: string[] = [];

        ages.forEach(age => {
          const project = projByAge[age];
          if (!project) return;

          const contributed = !!detailedData[`contributedAge${age}`];
          const complete = !!edificeCompletion.completeByAge[age];
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

      case 'military':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Strength by Age</Text>
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
              <Text style={styles.detailLabel}>Diplomacy (skip conflicts this Age)</Text>
              <View style={styles.inlineInputs}>
                <Checkbox
                  checked={!!detailedData.doveAgeI}
                  onToggle={() => updateDetailedField('doveAgeI', !detailedData.doveAgeI)}
                  label="Age I"
                />
                <Checkbox
                  checked={!!detailedData.doveAgeII}
                  onToggle={() => updateDetailedField('doveAgeII', !detailedData.doveAgeII)}
                  label="Age II"
                />
                <Checkbox
                  checked={!!detailedData.doveAgeIII}
                  onToggle={() => updateDetailedField('doveAgeIII', !detailedData.doveAgeIII)}
                  label="Age III"
                />
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Boarding token cards (Armada)</Text>
              <View style={styles.inlineInputs}>
                <Checkbox
                  checked={!!detailedData.playedPontoon}
                  onToggle={() => updateDetailedField('playedPontoon', !detailedData.playedPontoon)}
                  label="Pontoon (Age I)"
                />
                <Checkbox
                  checked={!!detailedData.playedBallista}
                  onToggle={() => updateDetailedField('playedBallista', !detailedData.playedBallista)}
                  label="Ballista (Age II)"
                />
                <Checkbox
                  checked={!!detailedData.playedPier}
                  onToggle={() => updateDetailedField('playedPier', !detailedData.playedPier)}
                  label="Pier (Age III)"
                />
              </View>
            </View>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Military conflicts auto-score based on strengths and table seating. Diplomacy skips adjacency but Boarding still forces an extra conflict.
              </Text>
            </View>
          </>
        );

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
