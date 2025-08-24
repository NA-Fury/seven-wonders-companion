// components/scoring/CoreScoringInput.tsx - Milestone 5 Core Scoring Components
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Enhanced7WondersScoringEngine, ScoringInput } from '../../lib/scoring/enhancedScoringEngine';
import { Button, Card, H1, P } from '../ui';
import { NumericInput, ScoreCategory, ToggleButtonGroup } from '../ui/scoring';

interface CoreScoringInputProps {
  playerId: string;
  playerName: string;
  position: number;
  wonderData: {
    wonderId: string;
    side: 'day' | 'night';
    maxStages: number;
    stagePointValues: number[];
  };
  expansions: {
    leaders: boolean;
    cities: boolean;
    armada: boolean;
    edifice: boolean;
  };
  onScoreCalculated: (score: any) => void;
  onNext: () => void;
}

export function CoreScoringInput({ 
  playerId, 
  playerName, 
  position, 
  wonderData, 
  expansions,
  onScoreCalculated,
  onNext 
}: CoreScoringInputProps) {
  const [coins, setCoins] = useState(3); // Starting coins
  const [wonderStagesBuilt, setWonderStagesBuilt] = useState(0);
  
  // Card points
  const [civilianPoints, setCivilianPoints] = useState(0);
  const [commercialPoints, setCommercialPoints] = useState(0);
  const [militaryStrength] = useState(0); // Removed unused setter

  // Science symbols
  const [compass, setCompass] = useState(0);
  const [tablet, setTablet] = useState(0);
  const [gear, setGear] = useState(0);
  
  // Military conflicts
  const [militaryResults, setMilitaryResults] = useState({
    age1: { left: 'tie' as 'win' | 'lose' | 'tie', right: 'tie' as 'win' | 'lose' | 'tie' },
    age2: { left: 'tie' as 'win' | 'lose' | 'tie', right: 'tie' as 'win' | 'lose' | 'tie' },
    age3: { left: 'tie' as 'win' | 'lose' | 'tie', right: 'tie' as 'win' | 'lose' | 'tie' },
  });

  const handleCalculateScore = () => {
    const scoringInput: ScoringInput = {
      playerId,
      playerName,
      position,
      coins,
      wonderData: {
        wonderId: wonderData.wonderId,
        side: wonderData.side,
        stagesBuilt: wonderStagesBuilt,
        stagePoints: wonderData.stagePointValues.slice(0, wonderStagesBuilt),
      },
      cards: {
        civilian: { count: 0, points: civilianPoints },
        commercial: { count: 0, points: commercialPoints },
        military: { count: 0, strength: militaryStrength },
        science: { compass, tablet, gear },
        guilds: [], // Will be handled in advanced scoring
      },
      militaryConflicts: {
        age1: { leftNeighbor: militaryResults.age1.left, rightNeighbor: militaryResults.age1.right },
        age2: { leftNeighbor: militaryResults.age2.left, rightNeighbor: militaryResults.age2.right },
        age3: { leftNeighbor: militaryResults.age3.left, rightNeighbor: militaryResults.age3.right },
      },
    };

    const calculatedScore = Enhanced7WondersScoringEngine.calculatePlayerScore(scoringInput);
    onScoreCalculated(calculatedScore);
  };

  const previewScore = () => {
    handleCalculateScore();
    // Show preview alert
    const treasury = Math.floor(coins / 3);
    const wonderPoints = wonderData.stagePointValues.slice(0, wonderStagesBuilt).reduce((sum, p) => sum + p, 0);
    const science = Enhanced7WondersScoringEngine.calculateScience({ compass, tablet, gear });
    
    Alert.alert(
      'Score Preview',
      `Treasury: ${treasury}\nWonder: ${wonderPoints}\nCivilian: ${civilianPoints}\nCommercial: ${commercialPoints}\nScience: ${science.total}\nTotal (Core): ${treasury + wonderPoints + civilianPoints + commercialPoints + science.total}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <H1>Core Scoring - {playerName}</H1>
      <P className="mb-4">Input basic scores for military, treasury, wonder, structures, and science.</P>

      {/* Treasury */}
      <ScoreCategory
        title="💰 Treasury"
        description="Count total coins at game end"
        icon="💰"
      >
        <NumericInput
          label="Total Coins"
          value={coins}
          onChangeValue={setCoins}
          min={0}
          max={50}
          step={1}
          suffix="coins"
          helperText="Coins ÷ 3 = treasury points (rounded down)"
        />
        <View style={{ alignItems: 'center', padding: 12, backgroundColor: 'rgba(196, 162, 76, 0.1)', borderRadius: 8 }}>
          <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold' }}>
            Treasury Points: {Math.floor(coins / 3)}
          </Text>
        </View>
      </ScoreCategory>

      {/* Wonder */}
      <ScoreCategory
        title="🏛️ Wonder Stages"
        description={`${wonderData.wonderId} (${wonderData.side} side)`}
        icon="🏛️"
      >
        <NumericInput
          label="Stages Built"
          value={wonderStagesBuilt}
          onChangeValue={setWonderStagesBuilt}
          min={0}
          max={wonderData.maxStages}
          step={1}
          suffix={`/ ${wonderData.maxStages}`}
        />
        
        {wonderStagesBuilt > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>Stage Points:</Text>
            {wonderData.stagePointValues.slice(0, wonderStagesBuilt).map((points, index) => (
              <Text key={index} style={{ color: '#C4A24C', fontSize: 13 }}>
                Stage {index + 1}: {points} points
              </Text>
            ))}
            <View style={{ alignItems: 'center', padding: 12, backgroundColor: 'rgba(196, 162, 76, 0.1)', borderRadius: 8, marginTop: 8 }}>
              <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold' }}>
                Wonder Points: {wonderData.stagePointValues.slice(0, wonderStagesBuilt).reduce((sum, p) => sum + p, 0)}
              </Text>
            </View>
          </View>
        )}
      </ScoreCategory>

      {/* Military Conflicts */}
      <ScoreCategory
        title="⚔️ Military Conflicts"
        description="Results vs left and right neighbors each age"
        icon="⚔️"
      >
        {[1, 2, 3].map(age => (
          <View key={age} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Age {age} (Tokens worth {age === 1 ? 1 : age === 2 ? 3 : 5} point{age === 1 ? '' : 's'} each)
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>
                  ← Left Neighbor
                </Text>
                <ToggleButtonGroup
                  options={[
                    { value: 'win', label: 'Win' },
                    { value: 'tie', label: 'Tie' },
                    { value: 'lose', label: 'Lose' },
                  ]}
                  selectedValue={militaryResults[`age${age}` as keyof typeof militaryResults].left}
                  onSelect={(value: 'win' | 'lose' | 'tie') => {
                    setMilitaryResults(prev => ({
                      ...prev,
                      [`age${age}`]: { ...prev[`age${age}` as keyof typeof prev], left: value }
                    }));
                  }}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>
                  Right Neighbor →
                </Text>
                <ToggleButtonGroup
                  options={[
                    { value: 'win', label: 'Win' },
                    { value: 'tie', label: 'Tie' },
                    { value: 'lose', label: 'Lose' },
                  ]}
                  selectedValue={militaryResults[`age${age}` as keyof typeof militaryResults].right}
                  onSelect={(value: 'win' | 'lose' | 'tie') => {
                    setMilitaryResults(prev => ({
                      ...prev,
                      [`age${age}`]: { ...prev[`age${age}` as keyof typeof prev], right: value }
                    }));
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </ScoreCategory>

      {/* Civilian Structures */}
      <ScoreCategory
        title="🏘️ Civilian Structures"
        description="Points from blue cards"
        icon="🏘️"
      >
        <NumericInput
          label="Total Points"
          value={civilianPoints}
          onChangeValue={setCivilianPoints}
          min={0}
          max={50}
          step={1}
          suffix="points"
          helperText="Add up all point values from blue cards"
        />
      </ScoreCategory>

      {/* Commercial Structures */}
      <ScoreCategory
        title="💼 Commercial Structures"
        description="Points from yellow cards that give VP"
        icon="💼"
      >
        <NumericInput
          label="Total Points"
          value={commercialPoints}
          onChangeValue={setCommercialPoints}
          min={0}
          max={30}
          step={1}
          suffix="points"
          helperText="Only yellow cards that directly give victory points"
        />
      </ScoreCategory>

      {/* Science */}
      <ScoreCategory
        title="🔬 Science Structures"
        description="Green cards with science symbols"
        icon="🔬"
      >
        <View style={{ gap: 12 }}>
          <NumericInput
            label="🧭 Compass/Astrolabe"
            value={compass}
            onChangeValue={setCompass}
            min={0}
            max={10}
            step={1}
          />
          
          <NumericInput
            label="📜 Stone Tablet"
            value={tablet}
            onChangeValue={setTablet}
            min={0}
            max={10}
            step={1}
          />
          
          <NumericInput
            label="⚙️ Gear/Cog"
            value={gear}
            onChangeValue={setGear}
            min={0}
            max={10}
            step={1}
          />
        </View>

        {(compass > 0 || tablet > 0 || gear > 0) && (
          <ScienceCalculatorPreview 
            compass={compass}
            tablet={tablet}
            gear={gear}
          />
        )}
      </ScoreCategory>

      {/* Score Preview */}
      <Card>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button
            title="🔍 Preview Score"
            variant="ghost"
            onPress={previewScore}
            className="flex-1"
          />
          <Button
            title="Continue"
            onPress={() => {
              handleCalculateScore();
              onNext();
            }}
            className="flex-1"
          />
        </View>
      </Card>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Science Calculator Preview Component
function ScienceCalculatorPreview({ compass, tablet, gear }: { compass: number; tablet: number; gear: number }) {
  const science = Enhanced7WondersScoringEngine.calculateScience({ compass, tablet, gear });

  return (
    <View style={{ 
      padding: 16, 
      backgroundColor: 'rgba(19, 92, 102, 0.2)', 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: 'rgba(99, 102, 241, 0.3)',
      marginTop: 12 
    }}>
      <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Science Calculation
      </Text>
      
      <Text style={{ color: '#F3E7D3', fontSize: 13, marginBottom: 4 }}>
        Sets of 3 different symbols: {science.sets} × 7 = {science.sets * 7} points
      </Text>
      
      <Text style={{ color: '#F3E7D3', fontSize: 13, marginBottom: 4 }}>
        Symbol squares: {compass}² + {tablet}² + {gear}² = {science.squaredPoints} points
      </Text>
      
      <View style={{ 
        alignItems: 'center', 
        padding: 8, 
        backgroundColor: 'rgba(99, 102, 241, 0.2)', 
        borderRadius: 8, 
        marginTop: 8 
      }}>
        <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold' }}>
          Science Total: {science.total} points
        </Text>
      </View>
    </View>
  );
}