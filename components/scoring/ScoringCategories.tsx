import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { PlayerScoreData } from '../../types/scoring';
import { NumericInput, ScoreCategory, ToggleRow } from './ui/ScoringInputs';

export function WonderScoringSection({ 
  playerScore, 
  onUpdate 
}: { 
  playerScore: PlayerScoreData;
  onUpdate: (updates: any) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore?.scoring?.wonder?.directPoints || 0);
  const [stagesBuilt, setStagesBuilt] = useState<boolean[]>(
    playerScore?.scoring?.wonder?.stagesBuilt || 
    new Array(playerScore?.wonderData?.maxStages || 0).fill(false)
  );

  useEffect(() => {
    if (showDetails) {
      const calculated = stagesBuilt.reduce(
        (s, b, i) => s + (b ? (playerScore.wonderData.stagePoints[i] || 0) : 0), 
        0
      );
      onUpdate({ stagesBuilt: [...stagesBuilt], calculatedPoints: calculated, directPoints: 0 });
    } else {
      onUpdate({ directPoints });
    }
  }, [showDetails, directPoints, stagesBuilt]);

  return (
    <ScoreCategory 
      title="Wonder" 
      description="Points from your wonder" 
      icon="🏛️"
    >
      <ToggleRow 
        label="Detailed stages" 
        value={showDetails} 
        onToggle={setShowDetails} 
      />
      {!showDetails ? (
        <NumericInput 
          label="Wonder Points" 
          value={directPoints} 
          onChangeValue={setDirectPoints} 
          min={0} 
          max={50} 
          step={1} 
          suffix="pts" 
        />
      ) : (
        <View>
          {playerScore.wonderData.stagePoints.map((p: number, i: number) => (
            <ToggleRow 
              key={i}
              label={`Stage ${i + 1} (${p} pts)`} 
              value={!!stagesBuilt[i]} 
              onToggle={(v: boolean) => {
                const copy = [...stagesBuilt];
                copy[i] = v;
                setStagesBuilt(copy);
              }}
            />
          ))}
        </View>
      )}
    </ScoreCategory>
  );
}

export function SimpleDirectPointsSection({ 
  title, 
  icon, 
  playerScore, 
  keyName, 
  onUpdate, 
  min = 0, 
  max = 50 
}: {
  title: string;
  icon: string;
  playerScore: PlayerScoreData;
  keyName: 'wonder' | 'military' | 'civilian' | 'commercial' | 'guilds' | 'science' | 'leaders' | 'cities' | 'armada' | 'edifice';
  onUpdate: (updates: any) => void;
  min?: number;
  max?: number;
}) {
  const category = playerScore?.scoring?.[keyName as keyof typeof playerScore.scoring];
  const initialValue = (category && typeof category === 'object' && 'directPoints' in category)
    ? (category as any).directPoints || 0
    : 0;
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onUpdate({ directPoints: value });
  }, [value]);

  return (
    <ScoreCategory 
      title={title} 
      description="Direct points entry" 
      icon={icon}
    >
      <NumericInput 
        label={`${title} (total)`} 
        value={value} 
        onChangeValue={setValue} 
        min={min} 
        max={max} 
        step={1} 
        suffix="pts" 
      />
    </ScoreCategory>
  );
}

export function ScienceScoringSection({
  playerScore,
  onUpdate
}: {
  playerScore: PlayerScoreData;
  onUpdate: (updates: any) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore?.scoring?.science?.directPoints || 0);
  const [compass, setCompass] = useState(playerScore?.scoring?.science?.compass || 0);
  const [tablet, setTablet] = useState(playerScore?.scoring?.science?.tablet || 0);
  const [gear, setGear] = useState(playerScore?.scoring?.science?.gear || 0);

  const calculateSciencePoints = () => {
    const sets = Math.min(compass, tablet, gear);
    const squares = (compass * compass) + (tablet * tablet) + (gear * gear);
    return (sets * 7) + squares;
  };

  useEffect(() => {
    if (showDetails) {
      const calculatedPoints = calculateSciencePoints();
      onUpdate({ compass, tablet, gear, calculatedPoints, directPoints: 0 });
    } else {
      onUpdate({ directPoints, compass: 0, tablet: 0, gear: 0, calculatedPoints: 0 });
    }
  }, [showDetails, directPoints, compass, tablet, gear]);

  return (
    <ScoreCategory 
      title="Science Structures" 
      description="Science symbols and point calculations" 
      icon="🔬"
    >
      <ToggleRow 
        label="Show detailed science symbol breakdown" 
        value={showDetails} 
        onToggle={setShowDetails} 
      />
      {!showDetails ? (
        <NumericInput
          label="Science Points (Total)"
          value={directPoints}
          onChangeValue={setDirectPoints}
          min={0}
          max={100}
          step={1}
          suffix="points"
          helperText="Enter total science points if you know the calculation"
        />
      ) : (
        <View>
          <NumericInput
            label="🧭 Compass/Astrolabe"
            value={compass}
            onChangeValue={setCompass}
            min={0}
            max={10}
            step={1}
            suffix="symbols"
          />
          <NumericInput
            label="📜 Stone Tablet"
            value={tablet}
            onChangeValue={setTablet}
            min={0}
            max={10}
            step={1}
            suffix="symbols"
          />
          <NumericInput
            label="⚙️ Gear/Cog"
            value={gear}
            onChangeValue={setGear}
            min={0}
            max={10}
            step={1}
            suffix="symbols"
          />
          <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', borderRadius: 8, padding: 12, marginTop: 12 }}>
            <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
              Total Science: {calculateSciencePoints()} points
            </Text>
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}
