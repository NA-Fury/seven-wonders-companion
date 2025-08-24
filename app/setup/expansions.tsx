
// app/setup/expansions.tsx - FIXED: Navigate to players first
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H1, H2, P, ToggleRow } from '../../components/ui';
import { useSetupStore } from '../../store/setupStore';

export default function ExpansionsScreen() {
  const { expansions, toggleExpansion } = useSetupStore();

  const handleContinue = () => {
    // FIXED: Go to players first, not seating
    router.push('./setup/players');
  };

  const handleBack = () => {
    router.back();
  };

  const getSelectedCount = () => {
    return Object.values(expansions).filter(Boolean).length;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ 
        flex: 1, 
        backgroundColor: '#1C1A1A'
      }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 10 : 20,
            paddingBottom: 120, // Space for fixed navigation
          }}
          showsVerticalScrollIndicator={false}
        >
          <H1>Choose Expansions</H1>
          <P className="mb-6">Select which 7 Wonders expansions you want to include in this game.</P>
          
          <Card>
            <H2>Base Game</H2>
            <P className="mb-4">The core 7 Wonders experience is always included with 7 original wonder boards.</P>
          </Card>

          <Card>
            <H2>Available Expansions</H2>
            
            <View style={{ gap: 4 }}>
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
              {getSelectedCount() === 0 ? 
                '7 original wonder boards available' :
                `${7 + getSelectedCount() * 2} wonder boards available (7 base + ${getSelectedCount() * 2} expansion)`
              }
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
        </ScrollView>

        {/* Fixed Navigation at Bottom */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1C1A1A',
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          borderTopWidth: 1,
          borderTopColor: 'rgba(243, 231, 211, 0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Back"
              variant="ghost"
              onPress={handleBack}
              className="flex-1"
            />
            <Button
              title="Continue to Players"
              onPress={handleContinue}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
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

  return (
    <View style={{
      backgroundColor: enabled ? 'rgba(196, 162, 76, 0.1)' : 'rgba(19, 92, 102, 0.1)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: enabled ? 'rgba(196, 162, 76, 0.3)' : 'rgba(243, 231, 211, 0.1)',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ToggleRow
          label={name}
          value={enabled}
          onToggle={onToggle}
          className="flex-1"
        />
        
        <Pressable
          onPress={() => setShowDetails(!showDetails)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(243, 231, 211, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <Text style={{ 
            color: '#F3E7D3', 
            fontSize: 16, 
            fontWeight: 'bold',
            transform: [{ rotate: showDetails ? '180deg' : '0deg' }]
          }}>
            ⌄
          </Text>
        </Pressable>
      </View>
      
      {showDetails && (
        <View style={{ 
          marginTop: 8, 
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
