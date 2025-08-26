// components/scoring/CategoryDetailModal.tsx
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import { calculateCategoryPoints } from './scoringCalculations';

// Add proper type definition for local changes
interface LocalChanges {
  [key: string]: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A1A',
  },
  header: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#F3E7D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.25)',
  },
  sectionTitle: {
    color: '#C4A24C',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#FEF3C7',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F3E7D3',
    fontSize: 14,
  },
  numericControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  numericButtonText: {
    color: '#1C1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numericValue: {
    minWidth: 60,
    alignItems: 'center',
  },
  numericValueText: {
    color: '#C4A24C',
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  toggleActive: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderColor: '#C4A24C',
  },
  toggleInactive: {
    backgroundColor: 'rgba(243, 231, 211, 0.03)',
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  toggleLabel: {
    flex: 1,
    color: '#F3E7D3',
    fontSize: 13,
  },
  toggleCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckActive: {
    backgroundColor: '#C4A24C',
    borderColor: '#C4A24C',
  },
  toggleCheckInactive: {
    borderColor: 'rgba(196, 162, 76, 0.5)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    color: 'rgba(243, 231, 211, 0.8)',
    fontSize: 12,
  },
  totalValue: {
    color: '#C4A24C',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#C4A24C',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: '#1C1A1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

interface Props {
  playerId: string;
  categoryId: string;
  onClose: () => void;
}

export default function CategoryDetailModal({ playerId, categoryId, onClose }: Props) {
  const { players, wonders, expansions } = useSetupStore();
  const { getPlayerScore, updateScore, updateMultipleScores } = useScoringStore();
  
  const player = players.find(p => p.id === playerId);
  const score = getPlayerScore(playerId);
  const [localChanges, setLocalChanges] = useState<LocalChanges>({});
  
  const wonderData = wonders[playerId];
  const wonder = wonderData?.boardId 
    ? WONDERS_DATABASE.find(w => w.id === wonderData.boardId)
    : null;

  const handleNumericChange = (field: string, value: any) => {
    // Generic setter (was number-only, causing TS2345 when passing string[] / objects)
    setLocalChanges((prev: LocalChanges) => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field: string, value: boolean) => {
    setLocalChanges((prev: LocalChanges) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, index: number, value: boolean) => {
    const currentArray: any[] = localChanges[field] || (score as any)?.[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setLocalChanges((prev: LocalChanges) => ({ ...prev, [field]: newArray }));
  };

  const handleTextInput = (field: string, value: string) => {
    setLocalChanges((prev: LocalChanges) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMultipleScores(playerId, {
      ...localChanges,
      [`${categoryId}ShowDetails`]: true,
    });
    onClose();
  };

  const currentValue = (field: string) => {
    return localChanges[field] !== undefined ? localChanges[field] : (score as any)?.[field] || 0;
  };

  const renderCategoryDetails = () => {
    switch (categoryId) {
      case 'wonder':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wonder Stages Built</Text>
              {wonder && (wonderData?.side === 'day' 
                ? wonder.daySide?.stages 
                : wonder.nightSide?.stages
              )?.map((stage, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.toggleButton,
                    currentValue(`wonderStagesBuilt`)?.[index] 
                      ? styles.toggleActive 
                      : styles.toggleInactive
                  ]}
                  onPress={() => handleArrayToggle('wonderStagesBuilt', index, 
                    !currentValue('wonderStagesBuilt')?.[index])}
                >
                  <Text style={styles.toggleLabel}>
                    Stage {index + 1} ({stage.points || 0} pts)
                  </Text>
                  <View style={[
                    styles.toggleCheck,
                    currentValue('wonderStagesBuilt')?.[index] 
                      ? styles.toggleCheckActive 
                      : styles.toggleCheckInactive
                  ]}>
                    {currentValue('wonderStagesBuilt')?.[index] && 
                      <Text style={{ color: '#1C1A1A', fontSize: 11 }}>✓</Text>
                    }
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case 'treasure':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coins & Debts</Text>
              
              <NumericInput
                label="Total Coins"
                value={currentValue('treasureTotalCoins')}
                onChange={(v) => handleNumericChange('treasureTotalCoins', v)}
                max={150}
              />
              
              <NumericInput
                label="Permanent Debt"
                value={currentValue('treasurePermanentDebt')}
                onChange={(v) => handleNumericChange('treasurePermanentDebt', v)}
                max={50}
              />
              
              {expansions?.cities && (
                <>
                  <NumericInput
                    label="Card Debt"
                    value={currentValue('treasureCardDebt')}
                    onChange={(v) => handleNumericChange('treasureCardDebt', v)}
                    max={50}
                  />
                  <NumericInput
                    label="Tax Debt"
                    value={currentValue('treasureTaxDebt')}
                    onChange={(v) => handleNumericChange('treasureTaxDebt', v)}
                    max={50}
                  />
                </>
              )}
              
              {expansions?.armada && (
                <>
                  <NumericInput
                    label="Piracy Debt"
                    value={currentValue('treasurePiracyDebt')}
                    onChange={(v) => handleNumericChange('treasurePiracyDebt', v)}
                    max={50}
                  />
                  <NumericInput
                    label="Commercial Pot Taxes"
                    value={currentValue('treasureCommercialDebt')}
                    onChange={(v) => handleNumericChange('treasureCommercialDebt', v)}
                    max={50}
                  />
                </>
              )}
            </View>
          </>
        );

      case 'science':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Science Symbols from Cards</Text>
              
              <NumericInput
                label="🧭 Compass/Astrolabe"
                value={currentValue('scienceCompass')}
                onChange={(v) => handleNumericChange('scienceCompass', v)}
                max={10}
              />
              
              <NumericInput
                label="📜 Stone Tablet"
                value={currentValue('scienceTablet')}
                onChange={(v) => handleNumericChange('scienceTablet', v)}
                max={10}
              />
              
              <NumericInput
                label="⚙️ Gear/Cog"
                value={currentValue('scienceGear')}
                onChange={(v) => handleNumericChange('scienceGear', v)}
                max={10}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Symbols (Wonder/Leaders)</Text>
              
              <NumericInput
                label="Extra Compass"
                value={currentValue('scienceNonCardCompass')}
                onChange={(v) => handleNumericChange('scienceNonCardCompass', v)}
                max={5}
              />
              
              <NumericInput
                label="Extra Tablet"
                value={currentValue('scienceNonCardTablet')}
                onChange={(v) => handleNumericChange('scienceNonCardTablet', v)}
                max={5}
              />
              
              <NumericInput
                label="Extra Gear"
                value={currentValue('scienceNonCardGear')}
                onChange={(v) => handleNumericChange('scienceNonCardGear', v)}
                max={5}
              />
            </View>
          </>
        );

      case 'resources':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resource Cards</Text>
              
              <NumericInput
                label="🟫 Brown Cards (Common Resources)"
                value={currentValue('resourcesBrownCards')}
                onChange={(v) => handleNumericChange('resourcesBrownCards', v)}
                max={20}
              />
              
              <NumericInput
                label="⬜ Grey Cards (Rare Resources)"
                value={currentValue('resourcesGreyCards')}
                onChange={(v) => handleNumericChange('resourcesGreyCards', v)}
                max={20}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discard Pile Retrievals</Text>
              
              <NumericInput
                label="Age I Cards Retrieved"
                value={currentValue('discardRetrievals')?.age1 || 0}
                onChange={(v) => {
                  const current = currentValue('discardRetrievals') || {};
                  handleNumericChange('discardRetrievals', { ...current, age1: v });
                }}
                max={5}
              />
              
              <NumericInput
                label="Age II Cards Retrieved"
                value={currentValue('discardRetrievals')?.age2 || 0}
                onChange={(v) => {
                  const current = currentValue('discardRetrievals') || {};
                  handleNumericChange('discardRetrievals', { ...current, age2: v });
                }}
                max={5}
              />
              
              <NumericInput
                label="Age III Cards Retrieved"
                value={currentValue('discardRetrievals')?.age3 || 0}
                onChange={(v) => {
                  const current = currentValue('discardRetrievals') || {};
                  handleNumericChange('discardRetrievals', { ...current, age3: v });
                }}
                max={5}
              />
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Source (e.g., Halicarnassus, Solomon)</Text>
                <TextInput
                  style={styles.input}
                  value={currentValue('discardRetrievals')?.source || ''}
                  onChangeText={(text) => {
                    const current = currentValue('discardRetrievals') || {};
                    handleNumericChange('discardRetrievals', { ...current, source: text });
                  }}
                  placeholder="Enter source"
                  placeholderTextColor="rgba(243, 231, 211, 0.4)"
                />
              </View>
            </View>
          </>
        );

      case 'leaders':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leaders in Game</Text>
              
              <LeaderInput
                label="Available Leaders (type to add)"
                leaders={currentValue('leadersAvailable') || []}
                onChange={(leaders) => handleNumericChange('leadersAvailable', leaders)}
              />
              
              <LeaderInput
                label="Your Played Leaders"
                leaders={currentValue('leadersPlayed') || []}
                onChange={(leaders) => handleNumericChange('leadersPlayed', leaders)}
              />
              
              <NumericInput
                label="Total Leader Points"
                value={currentValue('leadersDirectPoints')}
                onChange={(v) => handleNumericChange('leadersDirectPoints', v)}
                max={50}
              />
            </View>
          </>
        );

      case 'military':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Military Strength</Text>
              
              <NumericInput
                label="Total Military Strength"
                value={currentValue('militaryTotalStrength')}
                onChange={(v) => handleNumericChange('militaryTotalStrength', v)}
                max={20}
              />
              
              {expansions?.cities && (
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    currentValue('militaryPlayedDove') ? styles.toggleActive : styles.toggleInactive
                  ]}
                  onPress={() => handleToggleChange('militaryPlayedDove', !currentValue('militaryPlayedDove'))}
                >
                  <Text style={styles.toggleLabel}>
                    Played Red Dove Diplomacy Token?
                  </Text>
                  <View style={[
                    styles.toggleCheck,
                    currentValue('militaryPlayedDove') ? styles.toggleCheckActive : styles.toggleCheckInactive
                  ]}>
                    {currentValue('militaryPlayedDove') && 
                      <Text style={{ color: '#1C1A1A', fontSize: 11 }}>✓</Text>
                    }
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            {expansions?.armada && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Boarding Actions</Text>
                
                <NumericInput
                  label="Boarding Applied"
                  value={currentValue('militaryBoardingApplied')}
                  onChange={(v) => handleNumericChange('militaryBoardingApplied', v)}
                  max={10}
                />
                
                <NumericInput
                  label="Boarding Received"
                  value={currentValue('militaryBoardingReceived')}
                  onChange={(v) => handleNumericChange('militaryBoardingReceived', v)}
                  max={10}
                />
              </View>
            )}
          </>
        );

      default:
        return (
          <View style={styles.section}>
            <NumericInput
              label={`${categoryId} Points`}
              value={currentValue(`${categoryId}DirectPoints`)}
              onChange={(v) => handleNumericChange(`${categoryId}DirectPoints`, v)}
              max={100}
            />
          </View>
        );
    }
  };

  const calculatedPoints = useMemo(() => {
    // Ensure an object even if score is undefined and coerce to any to satisfy calculateCategoryPoints
    const mergedScore: any = { ...(score || {}), ...localChanges };
    return calculateCategoryPoints(playerId, categoryId, mergedScore, {
      wonder: wonderData,
      expansions,
    }, false);
  }, [playerId, score, localChanges, categoryId, wonderData, expansions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getCategoryTitle(categoryId)}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCategoryDetails()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalDisplay}>
          <Text style={styles.totalLabel}>Calculated:</Text>
          <Text style={styles.totalValue}>{calculatedPoints} pts</Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save & Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper Components
function NumericInput({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100 
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.numericControls}>
        <TouchableOpacity
          style={[styles.numericButton, !canDecrement && styles.numericButtonDisabled]}
          onPress={() => canDecrement && onChange(Math.max(min, value - 1))}
          disabled={!canDecrement}
        >
          <Text style={styles.numericButtonText}>−</Text>
        </TouchableOpacity>
        
        <View style={styles.numericValue}>
          <Text style={styles.numericValueText}>{value}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.numericButton, !canIncrement && styles.numericButtonDisabled]}
          onPress={() => canIncrement && onChange(Math.min(max, value + 1))}
          disabled={!canIncrement}
        >
          <Text style={styles.numericButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LeaderInput({ 
  label, 
  leaders, 
  onChange 
}: {
  label: string;
  leaders: string[];
  onChange: (leaders: string[]) => void;
}) {
  const [inputText, setInputText] = useState('');

  const addLeader = () => {
    if (inputText.trim() && !leaders.includes(inputText.trim())) {
      onChange([...leaders, inputText.trim()]);
      setInputText('');
    }
  };

  const removeLeader = (index: number) => {
    onChange(leaders.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addLeader}
          placeholder="Type leader name"
          placeholderTextColor="rgba(243, 231, 211, 0.4)"
        />
        <TouchableOpacity 
          style={[styles.numericButton, { width: 60 }]} 
          onPress={addLeader}
        >
          <Text style={styles.numericButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {leaders.map((leader, index) => (
        <TouchableOpacity
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(196, 162, 76, 0.1)',
            borderRadius: 6,
            padding: 8,
            marginBottom: 4,
          }}
          onPress={() => removeLeader(index)}
        >
          <Text style={{ flex: 1, color: '#F3E7D3', fontSize: 12 }}>{leader}</Text>
          <Text style={{ color: '#EF4444', fontSize: 12 }}>✕</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getCategoryTitle(categoryId: string): string {
  const titles: Record<string, string> = {
    wonder: '🏛️ Wonder Board',
    treasure: '💰 Treasure & Coins',
    military: '⚔️ Military Conflicts',
    civilian: '🏛️ Civilian Structures',
    commercial: '🪙 Commercial Structures',
    science: '🔬 Science Structures',
    guilds: '👑 Guild Cards',
    resources: '📦 Resource Cards',
    cities: '🏴 Cities Expansion',
    leaders: '👤 Leaders',
    navy: '⚓ Naval Conflicts',
    islands: '🏝️ Island Cards',
    edifice: '🗿 Edifice Projects',
  };
  return titles[categoryId] || categoryId;
}