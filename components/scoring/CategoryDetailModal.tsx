// components/scoring/CategoryDetailModal.tsx
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { PlayerScoreData, useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E1A',
  },
  header: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(196, 162, 76, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FEF3C7',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#F3E7D3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  sectionTitle: {
    color: '#C4A24C',
    fontSize: 15,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F3E7D3',
    fontSize: 14,
  },
  numericControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.4)',
  },
  numericButtonText: {
    color: '#0F0E1A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numericValue: {
    minWidth: 80,
    alignItems: 'center',
  },
  numericValueText: {
    color: '#C4A24C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(196, 162, 76, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    marginBottom: 8,
  },
  checkboxActive: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderColor: '#C4A24C',
  },
  checkboxText: {
    flex: 1,
    color: '#F3E7D3',
    fontSize: 14,
  },
  checkboxIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(196, 162, 76, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIndicatorActive: {
    backgroundColor: '#C4A24C',
    borderColor: '#C4A24C',
  },
  infoBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  calculationResult: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  calculationText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.98)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(196, 162, 76, 0.3)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#C4A24C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(107, 114, 128, 0.5)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#0F0E1A',
  },
  cancelButtonText: {
    color: '#F3E7D3',
  },
});

interface Props {
  playerId: string;
  category: { id: string; title: string; icon: string };
  onClose: () => void;
}

function NumericInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
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
          onPress={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
        >
          <Text style={styles.numericButtonText}>−</Text>
        </TouchableOpacity>

        <View style={styles.numericValue}>
          <Text style={styles.numericValueText}>{value}</Text>
        </View>

        <TouchableOpacity
          style={[styles.numericButton, !canIncrement && styles.numericButtonDisabled]}
          onPress={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
        >
          <Text style={styles.numericButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CheckboxInput({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.checkbox, checked && styles.checkboxActive]}
      onPress={onToggle}
    >
      <Text style={styles.checkboxText}>{label}</Text>
      <View style={[styles.checkboxIndicator, checked && styles.checkboxIndicatorActive]}>
        {checked && <Text style={{ color: '#0F0E1A', fontSize: 12 }}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function CategoryDetailModal({ playerId, category, onClose }: Props) {
  const { getPlayerScore, updateDetailedScore } = useScoringStore();
  const { wonders, expansions, edificeProjects } = useSetupStore();
  
  const initialScore = getPlayerScore(playerId);
  const [localChanges, setLocalChanges] = useState<Partial<PlayerScoreData>>({});
  
  const wonderData = wonders?.[playerId];
  const wonder = wonderData?.boardId
    ? WONDERS_DATABASE.find(w => w.id === wonderData.boardId)
    : null;

  const updateField = (field: keyof PlayerScoreData, value: any) => {
    setLocalChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateDetailedScore(playerId, {
      ...localChanges,
      [`${category.id}DetailsEntered`]: true,
    });
    onClose();
  };

  const getValue = (field: keyof PlayerScoreData) => {
    return localChanges[field] !== undefined ? localChanges[field] : initialScore[field];
  };

  const renderCategoryDetails = () => {
    switch (category.id) {
      case 'wonder':
        return renderWonderDetails();
      case 'treasure':
        return renderTreasureDetails();
      case 'military':
        return renderMilitaryDetails();
      case 'civilian':
        return renderCivilianDetails();
      case 'commercial':
        return renderCommercialDetails();
      case 'science':
        return renderScienceDetails();
      case 'guilds':
        return renderGuildDetails();
      case 'cities':
        return renderCitiesDetails();
      case 'leaders':
        return renderLeadersDetails();
      case 'navy':
        return renderNavyDetails();
      case 'island':
        return renderIslandDetails();
      case 'edifice':
        return renderEdificeDetails();
      default:
        return null;
    }
  };

  const renderWonderDetails = () => {
    const stages = wonderData?.side === 'day' 
      ? wonder?.daySide?.stages 
      : wonder?.nightSide?.stages;
    
    const stagesCompleted = getValue('wonderStagesCompleted') as boolean[] || [];

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wonder Stages Built</Text>
          {stages?.map((stage, index) => (
            <CheckboxInput
              key={index}
              label={`Stage ${index + 1} - ${stage.effect.description}`}
              checked={stagesCompleted[index] || false}
              onToggle={() => {
                const newStages = [...stagesCompleted];
                newStages[index] = !newStages[index];
                updateField('wonderStagesCompleted', newStages);
              }}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Mark which wonder stages you've completed. Points will be calculated based on your wonder board.
          </Text>
        </View>
      </>
    );
  };

  const renderTreasureDetails = () => {
    const coins = getValue('totalCoins') as number || 0;
    const permanentDebt = getValue('permanentDebt') as number || 0;
    const cardDebt = getValue('cardDebt') as number || 0;
    const taxDebt = getValue('taxDebt') as number || 0;
    const piracyDebt = getValue('piracyDebt') as number || 0;
    const commercialPotTaxes = getValue('commercialPotTaxes') as number || 0;

    const calculatedPoints = Math.max(0, Math.floor(coins / 3) - 
      permanentDebt - cardDebt - taxDebt - piracyDebt - commercialPotTaxes);

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coins & Treasury</Text>
          <NumericInput
            label="Total Coins"
            value={coins}
            onChange={(v) => updateField('totalCoins', v)}
            max={150}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debts Incurred</Text>
          <NumericInput
            label="Permanent Debt"
            value={permanentDebt}
            onChange={(v) => updateField('permanentDebt', v)}
            max={50}
          />
          
          {expansions?.cities && (
            <>
              <NumericInput
                label="Card Debt (Cities)"
                value={cardDebt}
                onChange={(v) => updateField('cardDebt', v)}
                max={50}
              />
              <NumericInput
                label="Tax Debt (Cities)"
                value={taxDebt}
                onChange={(v) => updateField('taxDebt', v)}
                max={50}
              />
            </>
          )}
          
          {expansions?.armada && (
            <>
              <NumericInput
                label="Piracy Debt (Armada)"
                value={piracyDebt}
                onChange={(v) => updateField('piracyDebt', v)}
                max={50}
              />
              <NumericInput
                label="Commercial Pot Taxes (Armada)"
                value={commercialPotTaxes}
                onChange={(v) => updateField('commercialPotTaxes', v)}
                max={50}
              />
            </>
          )}
        </View>

        <View style={styles.calculationResult}>
          <Text style={styles.calculationText}>
            Calculated: {calculatedPoints} Points
          </Text>
          <Text style={[styles.infoText, { textAlign: 'center', marginTop: 4 }]}>
            ({coins} ÷ 3) - {permanentDebt + cardDebt + taxDebt + piracyDebt + commercialPotTaxes} debt
          </Text>
        </View>
      </>
    );
  };

  const renderMilitaryDetails = () => {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Military Strength by Age</Text>
          <NumericInput
            label="Age I Military Strength"
            value={(getValue('militaryStrengthAge1') as number) || 0}
            onChange={(v) => updateField('militaryStrengthAge1', v)}
            max={20}
          />
          <NumericInput
            label="Age II Military Strength"
            value={(getValue('militaryStrengthAge2') as number) || 0}
            onChange={(v) => updateField('militaryStrengthAge2', v)}
            max={20}
          />
          <NumericInput
            label="Age III Military Strength"
            value={(getValue('militaryStrengthAge3') as number) || 0}
            onChange={(v) => updateField('militaryStrengthAge3', v)}
            max={20}
          />
        </View>

        {expansions?.cities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diplomacy (Cities)</Text>
            <CheckboxInput
              label="Played Red Dove Token in Age I"
              checked={(getValue('redDoveTokensPlayed') as number[])?.[0] === 1}
              onToggle={() => {
                const tokens = getValue('redDoveTokensPlayed') as number[] || [0, 0, 0];
                tokens[0] = tokens[0] === 1 ? 0 : 1;
                updateField('redDoveTokensPlayed', tokens);
              }}
            />
            <CheckboxInput
              label="Played Red Dove Token in Age II"
              checked={(getValue('redDoveTokensPlayed') as number[])?.[1] === 1}
              onToggle={() => {
                const tokens = getValue('redDoveTokensPlayed') as number[] || [0, 0, 0];
                tokens[1] = tokens[1] === 1 ? 0 : 1;
                updateField('redDoveTokensPlayed', tokens);
              }}
            />
            <CheckboxInput
              label="Played Red Dove Token in Age III"
              checked={(getValue('redDoveTokensPlayed') as number[])?.[2] === 1}
              onToggle={() => {
                const tokens = getValue('redDoveTokensPlayed') as number[] || [0, 0, 0];
                tokens[2] = tokens[2] === 1 ? 0 : 1;
                updateField('redDoveTokensPlayed', tokens);
              }}
            />
          </View>
        )}

        {expansions?.armada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Naval Combat (Armada)</Text>
            <NumericInput
              label="Red Ship Position (0-7)"
              value={(getValue('redShipPosition') as number) || 0}
              onChange={(v) => updateField('redShipPosition', v)}
              min={0}
              max={7}
            />
            <NumericInput
              label="Boarding Tokens Applied"
              value={(getValue('militaryBoardingApplied') as number) || 0}
              onChange={(v) => updateField('militaryBoardingApplied', v)}
              max={10}
            />
            <NumericInput
              label="Boarding Tokens Received"
              value={(getValue('militaryBoardingReceived') as number) || 0}
              onChange={(v) => updateField('militaryBoardingReceived', v)}
              max={10}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Military Info</Text>
          <NumericInput
            label="Total Red Cards Played"
            value={(getValue('totalRedCards') as number) || 0}
            onChange={(v) => updateField('totalRedCards', v)}
            max={20}
          />
          <NumericInput
            label="Chain Links Applied"
            value={(getValue('militaryChainLinks') as number) || 0}
            onChange={(v) => updateField('militaryChainLinks', v)}
            max={10}
          />
        </View>
      </>
    );
  };

  const renderScienceDetails = () => {
    const compass = (getValue('scienceCompass') as number) || 0;
    const tablet = (getValue('scienceTablet') as number) || 0;
    const gear = (getValue('scienceGear') as number) || 0;
    const nonCardCompass = (getValue('nonCardCompass') as number) || 0;
    const nonCardTablet = (getValue('nonCardTablet') as number) || 0;
    const nonCardGear = (getValue('nonCardGear') as number) || 0;

    const totalCompass = compass + nonCardCompass;
    const totalTablet = tablet + nonCardTablet;
    const totalGear = gear + nonCardGear;

    const calculatedPoints = 
      (totalCompass * totalCompass) + 
      (totalTablet * totalTablet) + 
      (totalGear * totalGear) + 
      (Math.min(totalCompass, totalTablet, totalGear) * 7);

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Science Symbols from Cards</Text>
          <NumericInput
            label="🧭 Compass/Astrolabe"
            value={compass}
            onChange={(v) => updateField('scienceCompass', v)}
            max={10}
          />
          <NumericInput
            label="📜 Stone Tablet"
            value={tablet}
            onChange={(v) => updateField('scienceTablet', v)}
            max={10}
          />
          <NumericInput
            label="⚙️ Gear/Cog"
            value={gear}
            onChange={(v) => updateField('scienceGear', v)}
            max={10}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Symbols (Wonder/Leaders/Islands)</Text>
          <NumericInput
            label="Extra Compass"
            value={nonCardCompass}
            onChange={(v) => updateField('nonCardCompass', v)}
            max={5}
          />
          <NumericInput
            label="Extra Tablet"
            value={nonCardTablet}
            onChange={(v) => updateField('nonCardTablet', v)}
            max={5}
          />
          <NumericInput
            label="Extra Gear"
            value={nonCardGear}
            onChange={(v) => updateField('nonCardGear', v)}
            max={5}
          />
        </View>

        {expansions?.armada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Green Fleet (Armada)</Text>
            <NumericInput
              label="Green Ship Position (0-7)"
              value={(getValue('greenShipPosition') as number) || 0}
              onChange={(v) => updateField('greenShipPosition', v)}
              min={0}
              max={7}
            />
          </View>
        )}

        <View style={styles.calculationResult}>
          <Text style={styles.calculationText}>
            Calculated: {calculatedPoints} Points
          </Text>
          <Text style={[styles.infoText, { textAlign: 'center', marginTop: 4 }]}>
            {totalCompass}² + {totalTablet}² + {totalGear}² + ({Math.min(totalCompass, totalTablet, totalGear)} × 7)
          </Text>
        </View>
      </>
    );
  };

  const renderCivilianDetails = () => {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Civilian Buildings</Text>
          <NumericInput
            label="Total Blue Cards"
            value={(getValue('totalBlueCards') as number) || 0}
            onChange={(v) => updateField('totalBlueCards', v)}
            max={20}
          />
          <NumericInput
            label="Chain Links Applied"
            value={(getValue('civilChainLinks') as number) || 0}
            onChange={(v) => updateField('civilChainLinks', v)}
            max={10}
          />
        </View>

        {expansions?.armada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Blue Fleet (Armada)</Text>
            <NumericInput
              label="Blue Ship Position (0-7)"
              value={(getValue('blueShipPosition') as number) || 0}
              onChange={(v) => updateField('blueShipPosition', v)}
              min={0}
              max={7}
            />
            <NumericInput
              label="Cards with Armada Ship Icons"
              value={(getValue('armadaShipIconCards') as number) || 0}
              onChange={(v) => updateField('armadaShipIconCards', v)}
              max={10}
            />
          </View>
        )}
      </>
    );
  };

  const renderCommercialDetails = () => {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commercial Buildings</Text>
          <NumericInput
            label="Total Yellow Cards"
            value={(getValue('totalYellowCards') as number) || 0}
            onChange={(v) => updateField('totalYellowCards', v)}
            max={20}
          />
          <NumericInput
            label="Chain Links Applied"
            value={(getValue('commercialChainLinks') as number) || 0}
            onChange={(v) => updateField('commercialChainLinks', v)}
            max={10}
          />
        </View>

        {expansions?.armada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yellow Fleet (Armada)</Text>
            <NumericInput
              label="Yellow Ship Position (0-7)"
              value={(getValue('yellowShipPosition') as number) || 0}
              onChange={(v) => updateField('yellowShipPosition', v)}
              min={0}
              max={7}
            />
            <NumericInput
              label="Armada Commercial Cards"
              value={(getValue('commercialArmadaCards') as number) || 0}
              onChange={(v) => updateField('commercialArmadaCards', v)}
              max={10}
            />
          </View>
        )}

        {expansions?.cities && (
          <NumericInput
            label="Cities Commercial Cards"
            value={(getValue('commercialCitiesCards') as number) || 0}
            onChange={(v) => updateField('commercialCitiesCards', v)}
            max={10}
          />
        )}
      </>
    );
  };

  const renderGuildDetails = () => {
    const [guildInput, setGuildInput] = useState('');
    const guilds = getValue('guildCards') as string[] || [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guild Cards</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Add Guild</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={guildInput}
              onChangeText={setGuildInput}
              placeholder="Enter guild name"
              placeholderTextColor="rgba(243, 231, 211, 0.4)"
            />
            <TouchableOpacity
              style={[styles.numericButton, { width: 60 }]}
              onPress={() => {
                if (guildInput.trim()) {
                  updateField('guildCards', [...guilds, guildInput.trim()]);
                  setGuildInput('');
                }
              }}
            >
              <Text style={styles.numericButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {guilds.map((guild, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(128, 0, 128, 0.1)',
              borderRadius: 8,
              padding: 10,
              marginBottom: 6,
            }}
          >
            <Text style={{ flex: 1, color: '#F3E7D3' }}>{guild}</Text>
            <TouchableOpacity
              onPress={() => {
                updateField('guildCards', guilds.filter((_, i) => i !== index));
              }}
            >
              <Text style={{ color: '#EF4444' }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderCitiesDetails = () => {
    if (!expansions?.cities) return null;

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cities Black Cards</Text>
          <NumericInput
            label="Total Black Cards"
            value={(getValue('totalBlackCards') as number) || 0}
            onChange={(v) => updateField('totalBlackCards', v)}
            max={20}
          />
          <NumericInput
            label="Black Cards with Direct Points"
            value={(getValue('blackCardsWithPoints') as number) || 0}
            onChange={(v) => updateField('blackCardsWithPoints', v)}
            max={20}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Black Card Effects</Text>
          <NumericInput
            label="Cards Affecting Neighbors"
            value={(getValue('blackCardsAffectingNeighbors') as number) || 0}
            onChange={(v) => updateField('blackCardsAffectingNeighbors', v)}
            max={10}
          />
          <NumericInput
            label="Positive Effect Cards"
            value={(getValue('blackCardsPositiveEffects') as number) || 0}
            onChange={(v) => updateField('blackCardsPositiveEffects', v)}
            max={10}
          />
          <NumericInput
            label="Negative Effect Cards (Tax/Debt)"
            value={(getValue('blackCardsNegativeEffects') as number) || 0}
            onChange={(v) => updateField('blackCardsNegativeEffects', v)}
            max={10}
          />
        </View>
      </>
    );
  };

  const renderLeadersDetails = () => {
    if (!expansions?.leaders) return null;

    const [leaderInput, setLeaderInput] = useState('');
    const leaders = getValue('leadersPlayed') as string[] || [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaders Played</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Add Leader</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={leaderInput}
              onChangeText={setLeaderInput}
              placeholder="Enter leader name"
              placeholderTextColor="rgba(243, 231, 211, 0.4)"
            />
            <TouchableOpacity
              style={[styles.numericButton, { width: 60 }]}
              onPress={() => {
                if (leaderInput.trim()) {
                  updateField('leadersPlayed', [...leaders, leaderInput.trim()]);
                  setLeaderInput('');
                }
              }}
            >
              <Text style={styles.numericButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {leaders.map((leader, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 10,
              marginBottom: 6,
            }}
          >
            <Text style={{ flex: 1, color: '#F3E7D3' }}>{leader}</Text>
            <TouchableOpacity
              onPress={() => {
                updateField('leadersPlayed', leaders.filter((_, i) => i !== index));
              }}
            >
              <Text style={{ color: '#EF4444' }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderNavyDetails = () => {
    if (!expansions?.armada) return null;

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Naval Strength by Age</Text>
          <NumericInput
            label="Age I Naval Strength"
            value={(getValue('navyStrengthAge1') as number) || 0}
            onChange={(v) => updateField('navyStrengthAge1', v)}
            max={20}
          />
          <NumericInput
            label="Age II Naval Strength"
            value={(getValue('navyStrengthAge2') as number) || 0}
            onChange={(v) => updateField('navyStrengthAge2', v)}
            max={20}
          />
          <NumericInput
            label="Age III Naval Strength"
            value={(getValue('navyStrengthAge3') as number) || 0}
            onChange={(v) => updateField('navyStrengthAge3', v)}
            max={20}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Naval Fleet</Text>
          <NumericInput
            label="Red Ship Position (Naval Combat)"
            value={(getValue('navyRedShipPosition') as number) || 0}
            onChange={(v) => updateField('navyRedShipPosition', v)}
            min={0}
            max={7}
          />
          <NumericInput
            label="Cards Contributing to Navy"
            value={(getValue('navyContributingCards') as number) || 0}
            onChange={(v) => updateField('navyContributingCards', v)}
            max={20}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blue Dove Diplomacy</Text>
          <CheckboxInput
            label="Played Blue Dove Token in Age I"
            checked={(getValue('blueDoveTokensPlayed') as number[])?.[0] === 1}
            onToggle={() => {
              const tokens = getValue('blueDoveTokensPlayed') as number[] || [0, 0, 0];
              tokens[0] = tokens[0] === 1 ? 0 : 1;
              updateField('blueDoveTokensPlayed', tokens);
            }}
          />
          <CheckboxInput
            label="Played Blue Dove Token in Age II"
            checked={(getValue('blueDoveTokensPlayed') as number[])?.[1] === 1}
            onToggle={() => {
              const tokens = getValue('blueDoveTokensPlayed') as number[] || [0, 0, 0];
              tokens[1] = tokens[1] === 1 ? 0 : 1;
              updateField('blueDoveTokensPlayed', tokens);
            }}
          />
          <CheckboxInput
            label="Played Blue Dove Token in Age III"
            checked={(getValue('blueDoveTokensPlayed') as number[])?.[2] === 1}
            onToggle={() => {
              const tokens = getValue('blueDoveTokensPlayed') as number[] || [0, 0, 0];
              tokens[2] = tokens[2] === 1 ? 0 : 1;
              updateField('blueDoveTokensPlayed', tokens);
            }}
          />
        </View>
      </>
    );
  };

  const renderIslandDetails = () => {
    if (!expansions?.armada) return null;

    const stage1 = (getValue('islandStage1Count') as number) || 0;
    const stage2 = (getValue('islandStage2Count') as number) || 0;
    const stage3 = (getValue('islandStage3Count') as number) || 0;
    const directPoints = (getValue('islandDirectPoints') as number) || 0;

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Island Exploration</Text>
          <NumericInput
            label="Green Ship Position (0-7)"
            value={(getValue('islandGreenShipPosition') as number) || 0}
            onChange={(v) => updateField('islandGreenShipPosition', v)}
            min={0}
            max={7}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Islands Collected</Text>
          <NumericInput
            label="Stage 1 Islands"
            value={stage1}
            onChange={(v) => updateField('islandStage1Count', v)}
            max={10}
          />
          <NumericInput
            label="Stage 2 Islands"
            value={stage2}
            onChange={(v) => updateField('islandStage2Count', v)}
            max={10}
          />
          <NumericInput
            label="Stage 3 Islands"
            value={stage3}
            onChange={(v) => updateField('islandStage3Count', v)}
            max={10}
          />
          <NumericInput
            label="Direct Points from Islands"
            value={directPoints}
            onChange={(v) => updateField('islandDirectPoints', v)}
            max={50}
          />
        </View>

        <View style={styles.calculationResult}>
          <Text style={styles.calculationText}>
            Total Islands: {stage1 + stage2 + stage3}
          </Text>
          <Text style={[styles.infoText, { textAlign: 'center', marginTop: 4 }]}>
            Direct Points: {directPoints}
          </Text>
        </View>
      </>
    );
  };

  const renderEdificeDetails = () => {
    if (!expansions?.edifice) return null;

    const contributions = getValue('edificeContributions') as any || {};

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edifice Contributions</Text>
          
          {edificeProjects?.age1 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age I - {edificeProjects.age1}</Text>
              <CheckboxInput
                label="Contributed on Stage 1"
                checked={contributions.age1 === 1}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age1: contributions.age1 === 1 ? 0 : 1,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 2"
                checked={contributions.age1 === 2}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age1: contributions.age1 === 2 ? 0 : 2,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 3"
                checked={contributions.age1 === 3}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age1: contributions.age1 === 3 ? 0 : 3,
                  });
                }}
              />
            </View>
          )}

          {edificeProjects?.age2 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age II - {edificeProjects.age2}</Text>
              <CheckboxInput
                label="Contributed on Stage 1"
                checked={contributions.age2 === 1}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age2: contributions.age2 === 1 ? 0 : 1,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 2"
                checked={contributions.age2 === 2}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age2: contributions.age2 === 2 ? 0 : 2,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 3"
                checked={contributions.age2 === 3}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age2: contributions.age2 === 3 ? 0 : 3,
                  });
                }}
              />
            </View>
          )}

          {edificeProjects?.age3 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age III - {edificeProjects.age3}</Text>
              <CheckboxInput
                label="Contributed on Stage 1"
                checked={contributions.age3 === 1}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age3: contributions.age3 === 1 ? 0 : 1,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 2"
                checked={contributions.age3 === 2}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age3: contributions.age3 === 2 ? 0 : 2,
                  });
                }}
              />
              <CheckboxInput
                label="Contributed on Stage 3"
                checked={contributions.age3 === 3}
                onToggle={() => {
                  updateField('edificeContributions', {
                    ...contributions,
                    age3: contributions.age3 === 3 ? 0 : 3,
                  });
                }}
              />
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Mark which wonder stage you used to contribute to each Edifice project.
            Points depend on project completion and your contribution.
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{category.icon} {category.title} Details</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCategoryDetails()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[styles.buttonText, styles.saveButtonText]}>Save Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}