// app/setup/expansions.tsx - Navigate to seating after selecting expansions
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Card, H1, H2, P, SetupScreen } from '../../components/ui';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useSetupStore } from '../../store/setupStore';
import { getWonderBoardSummary } from '../../utils/getWonderBoardSummary';

export default function ExpansionsScreen() {
  const { expansions, toggleExpansion } = useSetupStore();

  const handleContinue = () => {
    // Proceed directly to seating now that players are loaded from profiles
    router.push('/setup/seating');
  };

  const handleBack = () => {
    router.back();
  };

  const getSelectedCount = () => {
    return Object.values(expansions).filter(Boolean).length;
  };

  return (
    <SetupScreen
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.4)',
              backgroundColor: pressed ? 'rgba(243,231,211,0.06)' : 'transparent',
            })}
          >
            <Text style={{ color: '#C4A24C', fontWeight: '700', textAlign: 'center' }}>
              Back to Players
            </Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C',
            })}
          >
            <Text style={{ color: '#1C1A1A', fontWeight: '800', textAlign: 'center' }}>
              Continue to Seating
            </Text>
          </Pressable>
        </View>
      }
    >
      {/* Equal spacing between header, description, and cards */}
      <View style={{ gap: 12 }}>
        <H1>Choose Expansions</H1>
        <P>Select which 7 Wonders expansions you want to include in this game.</P>

        <Card>
          <H2>Base Game</H2>
          <P className="text-parchment/80">
            The core 7 Wonders experience is always included with 7 original wonder boards.
          </P>
        </Card>

        <Card>
          <H2>Available Expansions</H2>
          <View style={{ gap: 12, marginTop: 8 }}>
            <ExpansionToggleItem
              name="Leaders"
              enabled={expansions.leaders}
              onToggle={() => toggleExpansion('leaders')}
              description="Adds leader cards with special abilities drafted before each age"
              wondersAdded="Rome, Abu Simbel"
            />

            <ExpansionToggleItem
              name="Cities"
              enabled={expansions.cities}
              onToggle={() => toggleExpansion('cities')}
              description="Introduces diplomacy, debt, and teamwork mechanics"
              wondersAdded="Byzantium, Petra"
            />

            <ExpansionToggleItem
              name="Armada"
              enabled={expansions.armada}
              onToggle={() => toggleExpansion('armada')}
              description="Naval expansion with shipyards and fleet advancement"
              wondersAdded="Siracusa + Shipyard Selection"
            />

            <ExpansionToggleItem
              name="Edifice"
              enabled={expansions.edifice}
              onToggle={() => toggleExpansion('edifice')}
              description="Collaborative projects for shared benefits"
              wondersAdded="Ur, Carthage"
            />
          </View>
        </Card>

        <Card>
          <H2>Setup Summary</H2>
          <P className="text-aurum mb-2">
            {getSelectedCount() === 0 ? 'Base Game Only' :
             `Base Game + ${getSelectedCount()} Expansion${getSelectedCount() > 1 ? 's' : ''}`}
          </P>
          <P className="text-parchment/60 text-sm">
            {getWonderBoardSummary(getSelectedCount())}
          </P>

          {getSelectedCount() > 0 && (
            <View style={{ marginTop: 8 }}>
              <P className="text-parchment/70 text-sm">
                Active: {Object.entries(expansions)
                  .filter(([_, enabled]) => enabled)
                  .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                  .join(', ')}
              </P>
            </View>
          )}
        </Card>
      </View>
      <View style={{ height: 20 }} />
    </SetupScreen>
  );
}

interface ExpansionToggleItemProps {
  name: string;
  enabled: boolean;
  onToggle: () => void;
  description: string;
  wondersAdded: string;
}

function ExpansionToggleItem({ name, enabled, onToggle, description, wondersAdded }: ExpansionToggleItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const getSymbol = (n: string) => {
    switch (n.toLowerCase()) {
      case 'leaders':
        return 'crown.fill';
      case 'cities':
        return 'building.2.fill';
      case 'armada':
        return 'sailboat.fill';
      case 'edifice':
        return 'building.columns.fill';
      default:
        return 'chevron.right';
    }
  };

  return (
    <View style={{
      backgroundColor: enabled ? 'rgba(196, 162, 76, 0.12)' : 'rgba(19, 92, 102, 0.14)',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: enabled ? 'rgba(196, 162, 76, 0.3)' : 'rgba(243, 231, 211, 0.1)',
    }}>
      {/* Header row: icon + label left, switch + chevron right */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconSymbol name={getSymbol(name) as any} color={'#C4A24C'} size={18} />
          <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>
            {name}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            thumbColor={enabled ? '#C4A24C' : '#9CA3AF'}
            trackColor={{ false: 'rgba(243, 231, 211, 0.25)', true: 'rgba(196,162,76,0.55)' }}
            // keep default size; just add a little spacing from chevron
            style={{ marginRight: 8 }}
          />
          <Pressable
            onPress={() => setShowDetails(!showDetails)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(243, 231, 211, 0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: '#F3E7D3',
              fontSize: 16,
              fontWeight: '600',
              transform: [{ rotate: showDetails ? '180deg' : '0deg' }]
            }}>
              
            </Text>
          </Pressable>
        </View>
      </View>

      {showDetails && (
        <View style={{
          marginTop: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: 'rgba(243, 231, 211, 0.1)'
        }}>
          <Text style={{
            color: 'rgba(243, 231, 211, 0.8)',
            fontSize: 13,
            marginBottom: 4,
            lineHeight: 18
          }}>
            {description}
          </Text>
          <Text style={{
            color: enabled ? '#C4A24C' : 'rgba(196, 162, 76, 0.6)',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            Adds: {wondersAdded}
          </Text>
        </View>
      )}
    </View>
  );
}
