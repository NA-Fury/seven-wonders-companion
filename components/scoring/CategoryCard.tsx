// components/scoring/CategoryCard.tsx - Fixed Wonder details and stage calculations
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CategoryKey, CategoryScore, useScoringStore } from '../../store/scoringStore';

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
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(243, 231, 211, 0.7)',
    lineHeight: 16,
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
  const [isFocused, setIsFocused] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [inputValue, setInputValue] = useState(
    score?.directPoints !== null && score?.directPoints !== undefined ? String(score.directPoints) : ''
  );
  
  // Detailed mode states
  const [detailedData, setDetailedData] = useState<any>({});
  
  const config = CATEGORY_CONFIG[category];
  
  // Reset input value when player changes
  useEffect(() => {
    setInputValue(
      score?.directPoints !== null && score?.directPoints !== undefined 
        ? String(score.directPoints) 
        : ''
    );
    setShowDetailed(false);
  }, [playerId, score?.directPoints]);
  
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
  
  const updateDetailedField = (field: string, value: any) => {
    const newData = { ...detailedData, [field]: value };
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
        
        // Update the category score with calculated points
        updateCategoryScore(playerId, category, totalPoints, true);
      }
    }
  };
  
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
            {detailedData.coins > 0 && (
              <View style={styles.calculatedScore}>
                <Text style={styles.calculatedLabel}>Calculated Points</Text>
                <Text style={styles.calculatedValue}>
                  {Math.floor((detailedData.coins - 
                    (detailedData.debtFromCards || 0) - 
                    (detailedData.debtFromTax || 0) - 
                    (detailedData.debtFromPiracy || 0) - 
                    (detailedData.commercialPotTaxes || 0)) / 3)}
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
              <Text style={styles.detailLabel}>Bonus Symbols (from Wonders/Guilds/Leaders/Cities/Islands/etc)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.bonusSymbols?.toString() || ''}
                onChangeText={(text) => updateDetailedField('bonusSymbols', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            {(detailedData.gears > 0 || detailedData.compasses > 0 || detailedData.tablets > 0) && (
              <View style={styles.calculatedScore}>
                <Text style={styles.calculatedLabel}>Calculated Points</Text>
                <Text style={styles.calculatedValue}>
                  {(() => {
                    const g = detailedData.gears || 0;
                    const c = detailedData.compasses || 0;
                    const t = detailedData.tablets || 0;
                    const sets = Math.min(g, c, t);
                    return g*g + c*c + t*t + sets*7;
                  })()}
                </Text>
              </View>
            )}
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
              <Text style={styles.detailLabel}>Leaders Played (enter names)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.leaderNames || ''}
                onChangeText={(text) => updateDetailedField('leaderNames', text)}
                placeholder="e.g., Alexander, Cleopatra"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
                multiline
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Points from Leaders</Text>
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
              <Text style={styles.detailLabel}>Island Cards by Stage</Text>
              <View style={styles.inlineInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Stage 1</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.stage1?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('stage1', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Stage 2</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.stage2?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('stage2', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { fontSize: 10 }]}>Stage 3</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={detailedData.stage3?.toString() || ''}
                    onChangeText={(text) => updateDetailedField('stage3', parseInt(text) || 0)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(196, 162, 76, 0.3)"
                  />
                </View>
              </View>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Green Ship Position (0-7)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.greenShipPosition?.toString() || ''}
                onChangeText={(text) => updateDetailedField('greenShipPosition', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Total Direct Points from Islands</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.directPoints?.toString() || ''}
                onChangeText={(text) => updateDetailedField('directPoints', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
          </>
        );
        
      case 'edifice':
        return (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Completed Edifice Projects</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.completedProjects || ''}
                onChangeText={(text) => updateDetailedField('completedProjects', text)}
                placeholder="Enter project names"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Contributed Projects (Wonder Stages)</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.contributedStages || ''}
                onChangeText={(text) => updateDetailedField('contributedStages', text)}
                placeholder="e.g., Age I-Stage 2, Age II-Stage 3"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Rewards Earned</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.rewards?.toString() || ''}
                onChangeText={(text) => updateDetailedField('rewards', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Penalties Incurred</Text>
              <TextInput
                style={styles.detailInput}
                value={detailedData.penalties?.toString() || ''}
                onChangeText={(text) => updateDetailedField('penalties', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(196, 162, 76, 0.3)"
              />
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
        <ScrollView style={styles.detailedContent} showsVerticalScrollIndicator={false}>
          {renderDetailedMode()}
        </ScrollView>
      )}
    </View>
  );
});