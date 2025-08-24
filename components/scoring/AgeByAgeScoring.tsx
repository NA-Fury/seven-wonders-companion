// components/scoring/AgeByAgeScoring.tsx - Age-by-Age Scoring Mode for Deep Analysis
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { H1, H2, P, Card, Button } from '../ui';
import { NumericInput, ToggleButtonGroup, ScoreCategory } from '../ui/scoring';

interface AgeByAgeScoringProps {
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
  onScoreCalculated: (ageScores: AgeScoreData) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface AgeScoreData {
  playerId: string;
  playerName: string;
  position: number;
  
  // Age-by-age progression
  ages: {
    age1: AgeScore;
    age2: AgeScore;
    age3: AgeScore;
  };
  
  // Final totals
  finalCoins: number;
  wonderStagesBuilt: number[];
  scienceTotal: { compass: number; tablet: number; gear: number; };
  guilds: any[];
  
  // Expansion data
  leaders?: any;
  cities?: any;
  armada?: any;
  edifice?: any;
}

export interface AgeScore {
  // Cards played this age
  cardsPlayed: {
    brown: number;
    grey: number;
    blue: number;
    green: number;
    red: number;
    yellow: number;
    purple: number;
  };
  
  // Points earned this age
  civilianPoints: number;
  commercialPoints: number;
  scienceSymbols: { compass: number; tablet: number; gear: number; };
  
  // Military results
  militaryStrength: number;
  militaryResults: {
    left: 'win' | 'lose' | 'tie';
    right: 'win' | 'lose' | 'tie';
  };
  
  // Wonder progress
  wonderStageBuilt?: number;
  wonderPoints?: number;
  
  // Resources and coins
  coinsGained: number;
  coinsSpent: number;
  coinsEndOfAge: number;
  
  // Age-specific expansion content
  leaderPlayed?: any;
  armadaProgress?: any;
  edificeContributions?: any;
}

export function AgeByAgeScoring({
  playerId,
  playerName,
  position,
  wonderData,
  expansions,
  onScoreCalculated,
  onNext,
  onBack
}: AgeByAgeScoringProps) {
  const [currentAge, setCurrentAge] = useState<1 | 2 | 3>(1);
  const [ageScores, setAgeScores] = useState<AgeScoreData>({
    playerId,
    playerName,
    position,
    ages: {
      age1: createEmptyAgeScore(),
      age2: createEmptyAgeScore(),
      age3: createEmptyAgeScore(),
    },
    finalCoins: 3, // Starting coins
    wonderStagesBuilt: [],
    scienceTotal: { compass: 0, tablet: 0, gear: 0 },
    guilds: [],
  });

  const updateAgeScore = (age: 1 | 2 | 3, updates: Partial<AgeScore>) => {
    setAgeScores(prev => ({
      ...prev,
      ages: {
        ...prev.ages,
        [`age${age}`]: { ...prev.ages[`age${age}`], ...updates }
      }
    }));
  };

  const calculateCumulativeScience = () => {
    const total = { compass: 0, tablet: 0, gear: 0 };
    Object.values(ageScores.ages).forEach(age => {
      total.compass += age.scienceSymbols.compass;
      total.tablet += age.scienceSymbols.tablet;
      total.gear += age.scienceSymbols.gear;
    });
    return total;
  };

  const getCurrentAgeScore = () => ageScores.ages[`age${currentAge}`];

  const handleFinishScoring = () => {
    // Calculate final totals
    const finalData = {
      ...ageScores,
      scienceTotal: calculateCumulativeScience(),
      // Add other final calculations
    };
    
    onScoreCalculated(finalData);
    onNext();
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <H1>Age-by-Age Scoring - {playerName}</H1>
      <P className="mb-4">
        Track detailed progression through each age for comprehensive analysis.
      </P>

      {/* Age Navigation */}
      <Card>
        <H2>Select Age</H2>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[1, 2, 3].map(age => (
            <Button
              key={age}
              title={`Age ${age}`}
              variant={currentAge === age ? 'primary' : 'ghost'}
              onPress={() => setCurrentAge(age as 1 | 2 | 3)}
              className="flex-1"
            />
          ))}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
            Current: Age {currentAge}
          </Text>
          <Text style={{ color: '#C4A24C', fontSize: 12 }}>
            {currentAge === 1 ? '7 cards per player' : currentAge === 2 ? '6 cards per player' : '7 cards per player'}
          </Text>
        </View>
      </Card>

      {/* Age-Specific Content */}
      <AgeProgressionContent
        age={currentAge}
        ageScore={getCurrentAgeScore()}
        wonderData={wonderData}
        expansions={expansions}
        onUpdateAge={(updates: Partial<AgeScore>) => updateAgeScore(currentAge, updates)}
        previousAges={currentAge > 1 ? Object.values(ageScores.ages).slice(0, currentAge - 1) : []}
      />

      {/* Science Progression Tracker */}
      <ScoreCategory
        title="🔬 Science Progression"
        description="Track science symbols accumulated through ages"
        icon="🔬"
      >
        <ScienceProgressionDisplay
          currentAge={currentAge}
          ageScores={ageScores.ages}
          onUpdateScience={(compass: any, tablet: any, gear: any) => {
            updateAgeScore(currentAge, {
              scienceSymbols: { compass, tablet, gear }
            });
          }}
        />
      </ScoreCategory>

      {/* Military Conflict Resolution */}
      <ScoreCategory
        title="⚔️ Military Conflict"
        description={`End of Age ${currentAge} military battles`}
        icon="⚔️"
      >
        <MilitaryConflictInput
          age={currentAge}
          militaryStrength={getCurrentAgeScore().militaryStrength}
          results={getCurrentAgeScore().militaryResults}
          onUpdateMilitary={(strength: any, results: any) => {
            updateAgeScore(currentAge, {
              militaryStrength: strength,
              militaryResults: results
            });
          }}
        />
      </ScoreCategory>

      {/* Coin Management */}
      <ScoreCategory
        title="💰 Coin Management"
        description="Track coins gained and spent this age"
        icon="💰"
      >
        <CoinTracker
          age={currentAge}
          coinsStartOfAge={currentAge === 1 ? 3 : ageScores.ages[`age${currentAge - 1 as 1 | 2}`].coinsEndOfAge}
          coinsGained={getCurrentAgeScore().coinsGained}
          coinsSpent={getCurrentAgeScore().coinsSpent}
          onUpdateCoins={(gained: number, spent: number) => {
            const startCoins = currentAge === 1 ? 3 : ageScores.ages[`age${currentAge - 1 as 1 | 2}`].coinsEndOfAge;
            const endCoins = startCoins + gained - spent;
            updateAgeScore(currentAge, {
              coinsGained: gained,
              coinsSpent: spent,
              coinsEndOfAge: endCoins
            });
          }}
        />
      </ScoreCategory>

      {/* Age Summary */}
      <Card>
        <H2>Age {currentAge} Summary</H2>
        <AgeScoreSummary
          age={currentAge}
          ageScore={getCurrentAgeScore()}
          cumulativeScience={calculateCumulativeScience()}
        />
      </Card>

      {/* Navigation */}
      <Card className="flex-row gap-3">
        <Button
          title="Back"
          variant="ghost"
          onPress={onBack}
          className="flex-1"
        />
        {currentAge < 3 ? (
          <Button
            title={`Continue to Age ${currentAge + 1}`}
            onPress={() => setCurrentAge((currentAge + 1) as 1 | 2 | 3)}
            className="flex-1"
          />
        ) : (
          <Button
            title="Finish Scoring"
            onPress={handleFinishScoring}
            className="flex-1"
          />
        )}
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Helper Components

function AgeProgressionContent({ 
  age, 
  ageScore, 
  wonderData,
  expansions,
  onUpdateAge,
  previousAges 
}: any) {
  return (
    <View>
      {/* Cards Played This Age */}
      <ScoreCategory
        title={`📋 Cards Played (Age ${age})`}
        description="Track all cards you played this age"
        icon="📋"
      >
        <CardCountTracker
          cardsPlayed={ageScore.cardsPlayed}
          onUpdateCards={(cardCounts: any) => onUpdateAge({ cardsPlayed: cardCounts })}
        />
      </ScoreCategory>

      {/* Points Earned This Age */}
      <ScoreCategory
        title="🏆 Points Earned"
        description="Victory points gained directly this age"
        icon="🏆"
      >
        <View style={{ gap: 12 }}>
          <NumericInput
            label="Civilian Points (Blue Cards)"
            value={ageScore.civilianPoints}
            onChangeValue={(value) => onUpdateAge({ civilianPoints: value })}
            min={0}
            max={20}
            step={1}
            suffix="points"
          />
          
          <NumericInput
            label="Commercial Points (Yellow Cards)"
            value={ageScore.commercialPoints}
            onChangeValue={(value) => onUpdateAge({ commercialPoints: value })}
            min={0}
            max={15}
            step={1}
            suffix="points"
          />
        </View>
      </ScoreCategory>

      {/* Wonder Progress */}
      <ScoreCategory
        title="🏛️ Wonder Progress"
        description="Wonder stage built this age (if any)"
        icon="🏛️"
      >
        <WonderProgressTracker
          age={age}
          wonderData={wonderData}
          stageBuilt={ageScore.wonderStageBuilt}
          points={ageScore.wonderPoints}
          onUpdateWonder={(stage: any, points: any) => {
            onUpdateAge({
              wonderStageBuilt: stage,
              wonderPoints: points
            });
          }}
        />
      </ScoreCategory>
    </View>
  );
}

function ScienceProgressionDisplay({ currentAge, ageScores, onUpdateScience }: any) {
  const currentScience = ageScores[`age${currentAge}`].scienceSymbols;
  const cumulativeScience = { compass: 0, tablet: 0, gear: 0 };
  
  Object.values(ageScores).forEach((age: any) => {
    cumulativeScience.compass += age.scienceSymbols.compass;
    cumulativeScience.tablet += age.scienceSymbols.tablet;
    cumulativeScience.gear += age.scienceSymbols.gear;
  });

  return (
    <View>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 12 }}>
        Science symbols gained in Age {currentAge}:
      </Text>
      
      <View style={{ gap: 12, marginBottom: 16 }}>
        <NumericInput
          label="🧭 Compass/Astrolabe"
          value={currentScience.compass}
          onChangeValue={(value) => onUpdateScience(value, currentScience.tablet, currentScience.gear)}
          min={0}
          max={3}
          step={1}
        />
        
        <NumericInput
          label="📜 Stone Tablet"
          value={currentScience.tablet}
          onChangeValue={(value) => onUpdateScience(currentScience.compass, value, currentScience.gear)}
          min={0}
          max={3}
          step={1}
        />
        
        <NumericInput
          label="⚙️ Gear/Cog"
          value={currentScience.gear}
          onChangeValue={(value) => onUpdateScience(currentScience.compass, currentScience.tablet, value)}
          min={0}
          max={3}
          step={1}
        />
      </View>

      <View style={{
        padding: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 8,
      }}>
        <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
          Cumulative Science
        </Text>
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>
          🧭 {cumulativeScience.compass} • 📜 {cumulativeScience.tablet} • ⚙️ {cumulativeScience.gear}
        </Text>
      </View>
    </View>
  );
}

function MilitaryConflictInput({ age, militaryStrength, results, onUpdateMilitary }: any) {
  return (
    <View>
      <NumericInput
        label="Military Strength"
        value={militaryStrength}
        onChangeValue={(value) => onUpdateMilitary(value, results)}
        min={0}
        max={20}
        step={1}
        suffix="shields"
        helperText="Total military symbols (shields) from red cards"
      />

      <Text style={{ color: '#F3E7D3', fontSize: 14, marginTop: 16, marginBottom: 8 }}>
        Battle Results (Age {age} tokens worth {age === 1 ? 1 : age === 2 ? 3 : 5} point{age === 1 ? '' : 's'} each):
      </Text>

      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>
            ← Left Neighbor
          </Text>
          <ToggleButtonGroup
            options={[
              { value: 'win', label: 'Win' },
              { value: 'tie', label: 'Tie' },
              { value: 'lose', label: 'Lose' },
            ]}
            selectedValue={results.left}
            onSelect={(value) => onUpdateMilitary(militaryStrength, { ...results, left: value })}
          />
        </View>
        
        <View>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>
            Right Neighbor →
          </Text>
          <ToggleButtonGroup
            options={[
              { value: 'win', label: 'Win' },
              { value: 'tie', label: 'Tie' },
              { value: 'lose', label: 'Lose' },
            ]}
            selectedValue={results.right}
            onSelect={(value) => onUpdateMilitary(militaryStrength, { ...results, right: value })}
          />
        </View>
      </View>
    </View>
  );
}

function CoinTracker({ age, coinsStartOfAge, coinsGained, coinsSpent, onUpdateCoins }: any) {
  const coinsEndOfAge = coinsStartOfAge + coinsGained - coinsSpent;

  return (
    <View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        padding: 8,
        backgroundColor: 'rgba(196, 162, 76, 0.1)',
        borderRadius: 8,
      }}>
        <Text style={{ color: '#C4A24C', fontSize: 12 }}>
          Start of Age {age}: {coinsStartOfAge} coins
        </Text>
        <Text style={{ color: '#C4A24C', fontSize: 12 }}>
          End of Age {age}: {coinsEndOfAge} coins
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <NumericInput
          label="Coins Gained"
          value={coinsGained}
          onChangeValue={(value) => onUpdateCoins(value, coinsSpent)}
          min={0}
          max={20}
          step={1}
          suffix="coins"
          helperText="From yellow cards, wonder effects, selling cards"
        />
        
        <NumericInput
          label="Coins Spent"
          value={coinsSpent}
          onChangeValue={(value) => onUpdateCoins(coinsGained, value)}
          min={0}
          max={coinsStartOfAge + coinsGained}
          step={1}
          suffix="coins"
          helperText="Trading with neighbors, building costs"
        />
      </View>
    </View>
  );
}

function CardCountTracker({ cardsPlayed, onUpdateCards }: any) {
  const colors = [
    { key: 'brown', label: 'Brown (Raw Materials)', icon: '🪵' },
    { key: 'grey', label: 'Grey (Manufactured)', icon: '⚒️' },
    { key: 'blue', label: 'Blue (Civilian)', icon: '🏛️' },
    { key: 'green', label: 'Green (Science)', icon: '🔬' },
    { key: 'red', label: 'Red (Military)', icon: '⚔️' },
    { key: 'yellow', label: 'Yellow (Commercial)', icon: '💼' },
    { key: 'purple', label: 'Purple (Guilds)', icon: '🎭' },
  ];

  return (
    <View style={{ gap: 8 }}>
      {colors.map(color => (
        <View key={color.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>{color.icon}</Text>
          <Text style={{ color: '#F3E7D3', fontSize: 13, flex: 1 }}>
            {color.label}
          </Text>
          <NumericInput
            label=""
            value={cardsPlayed[color.key] || 0}
            onChangeValue={(value) => onUpdateCards({ ...cardsPlayed, [color.key]: value })}
            min={0}
            max={3}
            step={1}
          />
        </View>
      ))}
    </View>
  );
}

function WonderProgressTracker({ age, wonderData, stageBuilt, points, onUpdateWonder }: any) {
  const availableStages = wonderData.stagePointValues.map((pts: number, index: number) => ({
    stage: index + 1,
    points: pts
  }));

  return (
    <View>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
        Wonder stage built in Age {age} (if any):
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button
          title="No Stage"
          variant={!stageBuilt ? 'primary' : 'ghost'}
          onPress={() => onUpdateWonder(undefined, 0)}
        />
        {availableStages.map((stage: any) => (
          <Button
            key={stage.stage}
            title={`Stage ${stage.stage} (${stage.points}pts)`}
            variant={stageBuilt === stage.stage ? 'primary' : 'ghost'}
            onPress={() => onUpdateWonder(stage.stage, stage.points)}
          />
        ))}
      </View>

      {stageBuilt && (
        <View style={{
          padding: 8,
          backgroundColor: 'rgba(196, 162, 76, 0.1)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#C4A24C', fontSize: 13 }}>
            Built {wonderData.wonderId} Stage {stageBuilt} for {points} points
          </Text>
        </View>
      )}
    </View>
  );
}

function AgeScoreSummary({ age, ageScore, cumulativeScience }: any) {
  const totalCards = Object.values(ageScore.cardsPlayed).reduce((sum: number, count: any) => sum + count, 0);
  const totalPoints = ageScore.civilianPoints + ageScore.commercialPoints + (ageScore.wonderPoints || 0);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>Cards played:</Text>
        <Text style={{ color: '#C4A24C', fontSize: 13, fontWeight: 'bold' }}>{totalCards}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>Direct points:</Text>
        <Text style={{ color: '#C4A24C', fontSize: 13, fontWeight: 'bold' }}>{totalPoints}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>Military results:</Text>
        <Text style={{ color: '#C4A24C', fontSize: 13, fontWeight: 'bold' }}>
          {ageScore.militaryResults.left}/{ageScore.militaryResults.right}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>Coins end of age:</Text>
        <Text style={{ color: '#C4A24C', fontSize: 13, fontWeight: 'bold' }}>{ageScore.coinsEndOfAge}</Text>
      </View>
    </View>
  );
}

// Helper function
function createEmptyAgeScore(): AgeScore {
  return {
    cardsPlayed: {
      brown: 0,
      grey: 0,
      blue: 0,
      green: 0,
      red: 0,
      yellow: 0,
      purple: 0,
    },
    civilianPoints: 0,
    commercialPoints: 0,
    scienceSymbols: { compass: 0, tablet: 0, gear: 0 },
    militaryStrength: 0,
    militaryResults: { left: 'tie', right: 'tie' },
    coinsGained: 0,
    coinsSpent: 0,
    coinsEndOfAge: 3,
  };
}