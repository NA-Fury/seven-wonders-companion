// components/scoring/EndOfGameScoring.tsx - Complete End of Game Scoring System
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';
import { Button, H1, P } from '../ui';
import { NumericInput, ScoreCategory, ToggleRow } from '../ui/scoring';

interface EndOfGameScoringProps {
  onComplete: (allPlayerScores: PlayerEndGameScore[]) => void;
  onBack: () => void;
}

// Update the scoring types in PlayerEndGameScore interface
interface PlayerEndGameScore {
  playerId: string;
  playerName: string;
  position: number;
  wonderData: {
    wonderId: string;
    side: 'day' | 'night';
    maxStages: number;
    stagePoints: number[];
  };
  shipyardData?: {
    shipyardId: string;
    name: string;
    wonderTrack: string;
  };
  scoring: {
    wonder: Partial<WonderScoring>;
    military: Partial<MilitaryScoring>;
    civilian: Partial<CivilianScoring>;
    commercial: Partial<CommercialScoring>;
    science: Partial<ScienceScoring>;
    total: number;
    isComplete: boolean;
  };
}

interface WonderScoring {
  directPoints?: number;
  calculatedPoints?: number;
  stagesBuilt?: boolean[];
  edificeStageBuilt?: { age: 1 | 2 | 3; edificeProject: string };
}

interface MilitaryScoring {
  directPoints?: number;
  calculatedPoints?: number;
  totalStrength?: number;
  doveTokensUsed?: boolean[];
  boardingTokensApplied?: number;
  boardingTokensReceived?: number;
}

interface CivilianScoring {
  directPoints?: number;
  calculatedPoints?: number;
  blueShipPosition?: number;
  chainLinksUsed?: number;
  armadaShipCards?: number;
  totalBlueCards?: number;
}

interface CommercialScoring {
  directPoints?: number;
  calculatedPoints?: number;
  yellowShipPosition?: number;
  chainLinksUsed?: number;
  totalYellowCards?: number;
  pointGivingYellowCards?: number;
  expansionYellowCards?: number;
}

interface ScienceScoring {
  directPoints?: number;
  calculatedPoints?: number;
  compass?: number;
  tablet?: number;
  gear?: number;
  nonGreenSymbols?: number;
}

export function EndOfGameScoring({ onComplete, onBack }: EndOfGameScoringProps) {
  const { players, seating, expansions, wonders, edificeProjects } = useSetupStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState<PlayerEndGameScore[]>([]);

  const getOrderedPlayers = () => {
    if (!players || !Array.isArray(players)) return [];
    if (!seating || !Array.isArray(seating) || seating.length === 0) return players;
    return seating.map(seatId => players.find(p => p.id === seatId)).filter(Boolean) as typeof players;
  };

  const orderedPlayers = getOrderedPlayers();
  const currentPlayer = orderedPlayers[currentPlayerIndex];

  // Stable initializer so it's safe to include in effect deps
  const createInitialPlayerScore = React.useCallback((player: any, position: number): PlayerEndGameScore => {
    const wonderAssignment = wonders?.[player.id];
    const wonder = wonderAssignment?.boardId ? WONDERS_DATABASE.find(w => w.id === wonderAssignment.boardId) : null;

    const shipyard = wonderAssignment?.shipyardId && expansions?.armada
      ? ARMADA_SHIPYARDS.find(s => s.id === wonderAssignment.shipyardId)
      : undefined;

    return {
      playerId: player.id,
      playerName: player.name,
      position,
      wonderData: wonder ? {
        wonderId: wonder.name,
        side: (wonderAssignment?.side as 'day' | 'night') || 'day',
        maxStages: wonder.stages?.length || 0,
        stagePoints: wonder.stages?.map((s: any) => s.points || 0) || [],
      } : {
        wonderId: 'Unknown',
        side: 'day',
        maxStages: 0,
        stagePoints: [],
      },
      shipyardData: shipyard ? {
        shipyardId: shipyard.id,
        name: shipyard.name,
        wonderTrack: shipyard.wonderTrack,
      } : undefined,
      scoring: {
        wonder: {},
        military: {},
        civilian: {},
        commercial: {},
        science: {},
        total: 0,
        isComplete: false,
      },
    };
  }, [wonders, expansions]);

  // Initialize player scores once orderedPlayers are available
  useEffect(() => {
    if (orderedPlayers.length > 0 && playerScores.length === 0) {
      const initialScores = orderedPlayers.map((player, index) =>
        createInitialPlayerScore(player, index)
      );
      setPlayerScores(initialScores);
    }
  }, [orderedPlayers, playerScores.length, createInitialPlayerScore]);

  const updatePlayerScore = (playerId: string, updates: Partial<PlayerEndGameScore['scoring']>) => {
    setPlayerScores(prev => prev.map(score =>
      score.playerId === playerId
        ? {
            ...score,
            scoring: {
              ...score.scoring,
              ...updates,
              total: calculatePlayerTotal({ ...score.scoring, ...updates }),
              isComplete: checkPlayerComplete({ ...score.scoring, ...updates }),
            }
          }
        : score
    ));
  };

  const calculatePlayerTotal = (scoring: PlayerEndGameScore['scoring']): number => {
    let total = 0;
    total += (scoring.wonder?.directPoints ?? scoring.wonder?.calculatedPoints ?? 0);
    total += (scoring.military?.directPoints ?? scoring.military?.calculatedPoints ?? 0);
    total += (scoring.civilian?.directPoints ?? scoring.civilian?.calculatedPoints ?? 0);
    total += (scoring.commercial?.directPoints ?? scoring.commercial?.calculatedPoints ?? 0);
    total += (scoring.science?.directPoints ?? scoring.science?.calculatedPoints ?? 0);
    return total;
  };

  const checkPlayerComplete = (scoring: PlayerEndGameScore['scoring']): boolean => {
    const wonderComplete = scoring.wonder?.directPoints !== undefined || scoring.wonder?.stagesBuilt !== undefined;
    const militaryComplete = scoring.military?.directPoints !== undefined || scoring.military?.totalStrength !== undefined;
    const civilianComplete = scoring.civilian?.directPoints !== undefined || scoring.civilian?.totalBlueCards !== undefined;
    const commercialComplete = scoring.commercial?.directPoints !== undefined || scoring.commercial?.totalYellowCards !== undefined;
    const scienceComplete = scoring.science?.directPoints !== undefined ||
      (scoring.science?.compass !== undefined && scoring.science?.tablet !== undefined && scoring.science?.gear !== undefined);

    return !!(wonderComplete && militaryComplete && civilianComplete && commercialComplete && scienceComplete);
  };

  const navigateToPlayer = (index: number) => {
    if (index >= 0 && index < orderedPlayers.length) {
      setCurrentPlayerIndex(index);
    }
  };

  const allPlayersComplete = playerScores.length > 0 && playerScores.every(score => score.scoring.isComplete);
  const currentPlayerScore = playerScores.find(score => score.playerId === currentPlayer?.id);

  if (!currentPlayer || !currentPlayerScore) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <H1>Setup Required</H1>
          <P>No players found. Please complete the game setup first.</P>
          <Button title="Back to Setup" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ flex: 1 }}>
        {/* Fixed Header */}
        <PlayerHeader
          playerScore={currentPlayerScore}
          currentIndex={currentPlayerIndex}
          totalPlayers={orderedPlayers.length}
          onNavigate={navigateToPlayer}
          gameDate={new Date().toLocaleDateString()}
        />

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <PlayerScoringInterface
            playerScore={currentPlayerScore}
            expansions={expansions}
            edificeProjects={edificeProjects}
            onUpdateScore={(updates) => updatePlayerScore(currentPlayer.id, updates)}
          />
        </ScrollView>

        {/* Fixed Bottom Total and Navigation */}
        <FixedBottomSection
          playerScore={currentPlayerScore}
          allPlayersComplete={allPlayersComplete}
          currentIndex={currentPlayerIndex}
          totalPlayers={orderedPlayers.length}
          onNavigate={navigateToPlayer}
          onComplete={() => onComplete(playerScores)}
          onBack={onBack}
        />
      </View>
    </SafeAreaView>
  );
}

// Player Header Component
function PlayerHeader({
  playerScore,
  currentIndex,
  totalPlayers,
  onNavigate,
  gameDate
}: {
  playerScore: PlayerEndGameScore;
  currentIndex: number;
  totalPlayers: number;
  onNavigate: (index: number) => void;
  gameDate: string;
}) {
  return (
    <View style={{
      backgroundColor: '#1C1A1A',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(243, 231, 211, 0.2)',
    }}>
      {/* Player Navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Pressable
          onPress={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: currentIndex === 0 ? 'rgba(107, 114, 128, 0.3)' : '#C4A24C',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            color: currentIndex === 0 ? '#6B7280' : '#1C1A1A',
            fontSize: 20,
            fontWeight: 'bold',
          }}>
            ←
          </Text>
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#C4A24C', fontSize: 18, fontWeight: 'bold' }}>
            {playerScore.playerName}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
            Player {currentIndex + 1} of {totalPlayers} • {gameDate}
          </Text>
        </View>

        <Pressable
          onPress={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === totalPlayers - 1}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: currentIndex === totalPlayers - 1 ? 'rgba(107, 114, 128, 0.3)' : '#C4A24C',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            color: currentIndex === totalPlayers - 1 ? '#6B7280' : '#1C1A1A',
            fontSize: 20,
            fontWeight: 'bold',
          }}>
            →
          </Text>
        </Pressable>
      </View>

      {/* Player Details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold' }}>
            {playerScore.wonderData.wonderId}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
            {playerScore.wonderData.side.charAt(0).toUpperCase() + playerScore.wonderData.side.slice(1)} Side
          </Text>
        </View>

        {playerScore.shipyardData && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold' }}>
              ⚓ {playerScore.shipyardData.name}
            </Text>
            <Text style={{ color: 'rgba(99, 102, 241, 0.7)', fontSize: 12 }}>
              Wonder Track: {playerScore.shipyardData.wonderTrack}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Main Scoring Interface
function PlayerScoringInterface({
  playerScore,
  expansions,
  edificeProjects,
  onUpdateScore
}: {
  playerScore: PlayerEndGameScore;
  expansions: any;
  edificeProjects: any;
  onUpdateScore: (updates: Partial<PlayerEndGameScore['scoring']>) => void;
}) {
  return (
    <View>
      <Text style={{
        color: '#F3E7D3',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 16,
        fontStyle: 'italic',
      }}>
        💡 The more details you enter, the more analysis can be run personally for you!
      </Text>

      {/* Wonder Scoring */}
      <WonderScoringSection
        playerScore={playerScore}
        edificeProjects={edificeProjects}
        onUpdate={(wonder) => onUpdateScore({ wonder })}
      />

      {/* Military Scoring */}
      <MilitaryScoringSection
        playerScore={playerScore}
        expansions={expansions}
        onUpdate={(military) => onUpdateScore({ military })}
      />

      {/* Civilian (Blue) Scoring */}
      <CivilianScoringSection
        playerScore={playerScore}
        expansions={expansions}
        onUpdate={(civilian) => onUpdateScore({ civilian })}
      />

      {/* Commercial (Yellow) Scoring */}
      <CommercialScoringSection
        playerScore={playerScore}
        expansions={expansions}
        onUpdate={(commercial) => onUpdateScore({ commercial })}
      />

      {/* Science (Green) Scoring */}
      <ScienceScoringSection
        playerScore={playerScore}
        expansions={expansions}
        onUpdate={(science) => onUpdateScore({ science })}
      />
    </View>
  );
}

// Wonder Scoring Section
function WonderScoringSection({
  playerScore,
  edificeProjects,
  onUpdate
}: {
  playerScore: PlayerEndGameScore;
  edificeProjects: any;
  onUpdate: (wonder: WonderScoring) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore.scoring.wonder.directPoints || 0);
  const [stagesBuilt, setStagesBuilt] = useState<boolean[]>(
    playerScore.scoring.wonder.stagesBuilt ||
    new Array(playerScore.wonderData.maxStages).fill(false)
  );
  const [edificeStage, setEdificeStage] = useState<{ age: 1 | 2 | 3; edificeProject: string } | undefined>(
    playerScore.scoring.wonder.edificeStageBuilt
  );

  const calculateWonderPoints = useCallback(() => {
    let total = 0;
    stagesBuilt.forEach((built, index) => {
      if (built && playerScore.wonderData.stagePoints[index]) {
        total += playerScore.wonderData.stagePoints[index];
      }
    });
    return total;
  }, [stagesBuilt, playerScore.wonderData.stagePoints]);

  // Inside WonderScoringSection component
  const handleUpdate = useCallback(() => {
    const calculatedPoints = showDetails ? calculateWonderPoints() : undefined;
    onUpdate({
      directPoints: showDetails ? undefined : directPoints,
      stagesBuilt: showDetails ? stagesBuilt : undefined,
      edificeStageBuilt: showDetails ? edificeStage : undefined,
      calculatedPoints,
    });
  }, [showDetails, calculateWonderPoints, directPoints, stagesBuilt, edificeStage, onUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <ScoreCategory
      title="🏛️ Wonder Board"
      description="Points from wonder stages and edifice buildings"
      icon="🏛️"
    >
      <ToggleRow
        label="Show detailed breakdown"
        value={showDetails}
        onToggle={setShowDetails}
      />

      {!showDetails ? (
        <NumericInput
          label="Wonder Points (Total)"
          value={directPoints}
          onChangeValue={setDirectPoints}
          min={0}
          max={50}
          step={1}
          suffix="points"
          helperText="Enter total points from all wonder stages built"
        />
      ) : (
        <View>
          <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
            Select wonder stages built:
          </Text>

          {playerScore.wonderData.stagePoints.map((points, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: stagesBuilt[index] ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.1)',
              borderRadius: 8,
              marginBottom: 4,
              borderWidth: 1,
              borderColor: stagesBuilt[index] ? 'rgba(34, 197, 94, 0.4)' : 'rgba(107, 114, 128, 0.3)',
            }}>
              <ToggleRow
                label={`Stage ${index + 1} (${points} points)`}
                value={stagesBuilt[index]}
                onToggle={(built) => {
                  const newStages = [...stagesBuilt];
                  newStages[index] = built;
                  setStagesBuilt(newStages);
                }}
              />
            </View>
          ))}

          <View style={{
            backgroundColor: 'rgba(196, 162, 76, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
          }}>
            <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
              Calculated Wonder Points: {calculateWonderPoints()}
            </Text>
          </View>

          {/* Edifice Stage Selection */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
              Did you complete any wonder stage using an Edifice?
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {[1, 2, 3].map(age => (
                <Pressable
                  key={age}
                  onPress={() => setEdificeStage(edificeStage?.age === age ? undefined : { age: age as 1 | 2 | 3, edificeProject: `Age ${age}` })}
                  style={{
                    flex: 1,
                    backgroundColor: edificeStage?.age === age ? '#8B4513' : 'rgba(139, 69, 19, 0.2)',
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: edificeStage?.age === age ? '#8B4513' : 'rgba(139, 69, 19, 0.4)',
                  }}
                >
                  <Text style={{
                    color: edificeStage?.age === age ? 'white' : '#8B4513',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    Age {age} Edifice
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}

// Military Scoring Section
function MilitaryScoringSection({
  playerScore,
  expansions,
  onUpdate
}: {
  playerScore: PlayerEndGameScore;
  expansions: any;
  onUpdate: (military: MilitaryScoring) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore.scoring.military.directPoints || 0);
  const [totalStrength, setTotalStrength] = useState(playerScore.scoring.military.totalStrength || 0);
  const [doveTokensUsed, setDoveTokensUsed] = useState<boolean[]>(
    playerScore.scoring.military.doveTokensUsed || [false, false, false]
  );
  const [boardingApplied, setBoardingApplied] = useState(playerScore.scoring.military.boardingTokensApplied || 0);
  const [boardingReceived, setBoardingReceived] = useState(playerScore.scoring.military.boardingTokensReceived || 0);

  // Inside MilitaryScoringSection component
  const handleUpdate = useCallback(() => {
    onUpdate({
      directPoints: showDetails ? undefined : directPoints,
      totalStrength: showDetails ? totalStrength : undefined,
      doveTokensUsed: showDetails ? doveTokensUsed : undefined,
      boardingTokensApplied: showDetails ? boardingApplied : undefined,
      boardingTokensReceived: showDetails ? boardingReceived : undefined,
    });
  }, [showDetails, directPoints, totalStrength, doveTokensUsed, boardingApplied, boardingReceived, onUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <ScoreCategory
      title="⚔️ Military"
      description="Victory points from military conflicts and strength"
      icon="⚔️"
    >
      <ToggleRow
        label="Show detailed breakdown"
        value={showDetails}
        onToggle={setShowDetails}
      />

      {!showDetails ? (
        <NumericInput
          label="Military Points (Total)"
          value={directPoints}
          onChangeValue={setDirectPoints}
          min={-6}
          max={30}
          step={1}
          suffix="points"
          helperText="Enter total military victory points (can be negative)"
        />
      ) : (
        <View>
          <NumericInput
            label="Total Military Strength"
            value={totalStrength}
            onChangeValue={setTotalStrength}
            min={0}
            max={30}
            step={1}
            suffix="shields"
            helperText="Total military symbols from red cards, leaders, islands, etc."
          />

          {expansions.cities && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
                🕊️ Red Dove Tokens Used (Skip Military):
              </Text>

              <View style={{ gap: 8 }}>
                {['Age I', 'Age II', 'Age III'].map((age, index) => (
                  <ToggleRow
                    key={age}
                    label={`${age} - Red Dove Token`}
                    value={doveTokensUsed[index]}
                    onToggle={(used) => {
                      const newTokens = [...doveTokensUsed];
                      newTokens[index] = used;
                      setDoveTokensUsed(newTokens);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {expansions.armada && (
            <View style={{ marginTop: 16 }}>
              <NumericInput
                label="⚔️ Military Boarding Tokens Applied"
                value={boardingApplied}
                onChangeValue={setBoardingApplied}
                min={0}
                max={10}
                step={1}
                suffix="tokens"
                helperText="Tokens you used to force others into military combat"
              />

              <NumericInput
                label="⚔️ Military Boarding Tokens Received"
                value={boardingReceived}
                onChangeValue={setBoardingReceived}
                min={0}
                max={10}
                step={1}
                suffix="tokens"
                helperText="Tokens others used to force you into military combat"
              />
            </View>
          )}

          <View style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
          }}>
            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              📊 Military Analysis Data Recorded
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11 }}>
              Points will be calculated based on conflicts with neighbors after all players complete their data.
            </Text>
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}

// Civilian (Blue) Scoring Section
function CivilianScoringSection({
  playerScore,
  expansions,
  onUpdate
}: {
  playerScore: PlayerEndGameScore;
  expansions: any;
  onUpdate: (civilian: CivilianScoring) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore.scoring.civilian.directPoints || 0);
  const [blueShipPosition, setBlueShipPosition] = useState(playerScore.scoring.civilian.blueShipPosition || 0);
  const [chainLinksUsed, setChainLinksUsed] = useState(playerScore.scoring.civilian.chainLinksUsed || 0);
  const [armadaShipCards, setArmadaShipCards] = useState(playerScore.scoring.civilian.armadaShipCards || 0);
  const [totalBlueCards, setTotalBlueCards] = useState(playerScore.scoring.civilian.totalBlueCards || 0);

  // Inside CivilianScoringSection component
  const handleUpdate = useCallback(() => {
    onUpdate({
      directPoints: showDetails ? undefined : directPoints,
      blueShipPosition: showDetails ? blueShipPosition : undefined,
      chainLinksUsed: showDetails ? chainLinksUsed : undefined,
      armadaShipCards: showDetails ? armadaShipCards : undefined,
      totalBlueCards: showDetails ? totalBlueCards : undefined,
    });
  }, [showDetails, directPoints, blueShipPosition, chainLinksUsed, armadaShipCards, totalBlueCards, onUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <ScoreCategory
      title="🏘️ Civilian Structures"
      description="Blue cards and civilian building points"
      icon="🏘️"
    >
      <ToggleRow
        label="Show detailed breakdown"
        value={showDetails}
        onToggle={setShowDetails}
      />

      {!showDetails ? (
        <NumericInput
          label="Civilian Points (Total)"
          value={directPoints}
          onChangeValue={setDirectPoints}
          min={0}
          max={50}
          step={1}
          suffix="points"
          helperText="Enter total points from all blue cards"
        />
      ) : (
        <View>
          <NumericInput
            label="Total Blue Cards Built"
            value={totalBlueCards}
            onChangeValue={setTotalBlueCards}
            min={0}
            max={15}
            step={1}
            suffix="cards"
            helperText="How many blue civilian cards did you build?"
          />

          <NumericInput
            label="Chain Links Used"
            value={chainLinksUsed}
            onChangeValue={setChainLinksUsed}
            min={0}
            max={10}
            step={1}
            suffix="links"
            helperText="How many free building chains did you use?"
          />

          {expansions.armada && (
            <View>
              <NumericInput
                label="🚢 Blue Ship Position on Shipyard"
                value={blueShipPosition}
                onChangeValue={setBlueShipPosition}
                min={0}
                max={7}
                step={1}
                suffix="position"
                helperText="Position of your blue ship on the shipyard track"
              />

              <NumericInput
                label="⚓ Armada Ship Icon Cards"
                value={armadaShipCards}
                onChangeValue={setArmadaShipCards}
                min={0}
                max={10}
                step={1}
                suffix="cards"
                helperText="Blue cards with ship icons from Armada expansion"
              />
            </View>
          )}

          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
          }}>
            <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              📊 Civilian Analysis Data Recorded
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11 }}>
              Detailed breakdown will help analyze your building strategy and efficiency.
            </Text>
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}

// Commercial (Yellow) Scoring Section
function CommercialScoringSection({
  playerScore,
  expansions,
  onUpdate
}: {
  playerScore: PlayerEndGameScore;
  expansions: any;
  onUpdate: (commercial: CommercialScoring) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore.scoring.commercial.directPoints || 0);
  const [yellowShipPosition, setYellowShipPosition] = useState(playerScore.scoring.commercial.yellowShipPosition || 0);
  const [chainLinksUsed, setChainLinksUsed] = useState(playerScore.scoring.commercial.chainLinksUsed || 0);
  const [totalYellowCards, setTotalYellowCards] = useState(playerScore.scoring.commercial.totalYellowCards || 0);
  const [pointGivingCards, setPointGivingCards] = useState(playerScore.scoring.commercial.pointGivingYellowCards || 0);
  const [expansionCards, setExpansionCards] = useState(playerScore.scoring.commercial.expansionYellowCards || 0);

  // Inside CommercialScoringSection component
  const handleUpdate = useCallback(() => {
    onUpdate({
      directPoints: showDetails ? undefined : directPoints,
      yellowShipPosition: showDetails ? yellowShipPosition : undefined,
      chainLinksUsed: showDetails ? chainLinksUsed : undefined,
      totalYellowCards: showDetails ? totalYellowCards : undefined,
      pointGivingYellowCards: showDetails ? pointGivingCards : undefined,
      expansionYellowCards: showDetails ? expansionCards : undefined,
    });
  }, [showDetails, directPoints, yellowShipPosition, chainLinksUsed, totalYellowCards, pointGivingCards, expansionCards, onUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <ScoreCategory
      title="💼 Commercial Structures"
      description="Yellow cards that provide victory points"
      icon="💼"
    >
      <ToggleRow
        label="Show detailed breakdown"
        value={showDetails}
        onToggle={setShowDetails}
      />

      {!showDetails ? (
        <NumericInput
          label="Commercial Points (Total)"
          value={directPoints}
          onChangeValue={setDirectPoints}
          min={0}
          max={40}
          step={1}
          suffix="points"
          helperText="Enter total points from yellow cards that give victory points"
        />
      ) : (
        <View>
          <NumericInput
            label="Total Yellow Cards Built"
            value={totalYellowCards}
            onChangeValue={setTotalYellowCards}
            min={0}
            max={15}
            step={1}
            suffix="cards"
            helperText="How many yellow commercial cards did you build?"
          />

          <NumericInput
            label="Point-Giving Yellow Cards"
            value={pointGivingCards}
            onChangeValue={setPointGivingCards}
            min={0}
            max={10}
            step={1}
            suffix="cards"
            helperText="How many yellow cards actually give victory points?"
          />

          <NumericInput
            label="Chain Links Used"
            value={chainLinksUsed}
            onChangeValue={setChainLinksUsed}
            min={0}
            max={10}
            step={1}
            suffix="links"
            helperText="How many free building chains did you use?"
          />

          {(expansions.cities || expansions.armada) && (
            <NumericInput
              label="Expansion Yellow Cards"
              value={expansionCards}
              onChangeValue={setExpansionCards}
              min={0}
              max={10}
              step={1}
              suffix="cards"
              helperText="Yellow cards from Cities or Armada expansions"
            />
          )}

          {expansions.armada && (
            <NumericInput
              label="🟡 Yellow Ship Position on Shipyard"
              value={yellowShipPosition}
              onChangeValue={setYellowShipPosition}
              min={0}
              max={7}
              step={1}
              suffix="position"
              helperText="Position of your yellow ship on the shipyard track"
            />
          )}

          <View style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
          }}>
            <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              📊 Commercial Analysis Data Recorded
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11 }}>
              Points from variable cards (based on resources, stages, etc.) will be calculated later.
            </Text>
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}

// Science (Green) Scoring Section
function ScienceScoringSection({
  playerScore,
  expansions,
  onUpdate
}: {
  playerScore: PlayerEndGameScore;
  expansions: any;
  onUpdate: (science: ScienceScoring) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [directPoints, setDirectPoints] = useState(playerScore.scoring.science.directPoints || 0);
  const [compass, setCompass] = useState(playerScore.scoring.science.compass || 0);
  const [tablet, setTablet] = useState(playerScore.scoring.science.tablet || 0);
  const [gear, setGear] = useState(playerScore.scoring.science.gear || 0);
  const [nonGreenSymbols, setNonGreenSymbols] = useState(playerScore.scoring.science.nonGreenSymbols || 0);

  // Inside ScienceScoringSection component
  const calculateSciencePoints = useCallback(() => {
    const sets = Math.min(compass, tablet, gear);
    const squares = (compass * compass) + (tablet * tablet) + (gear * gear);
    return (sets * 7) + squares;
  }, [compass, tablet, gear]);

  const handleUpdate = useCallback(() => {
    const calculatedPoints = showDetails ? calculateSciencePoints() : undefined;
    onUpdate({
      directPoints: showDetails ? undefined : directPoints,
      compass: showDetails ? compass : undefined,
      tablet: showDetails ? tablet : undefined,
      gear: showDetails ? gear : undefined,
      nonGreenSymbols: showDetails ? nonGreenSymbols : undefined,
      calculatedPoints,
    });
  }, [showDetails, calculateSciencePoints, directPoints, compass, tablet, gear, nonGreenSymbols, onUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <ScoreCategory
      title="🔬 Science Structures"
      description="Green cards with science symbols"
      icon="🔬"
    >
      <ToggleRow
        label="Show detailed breakdown"
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
          <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
            Enter your science symbols:
          </Text>

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

          <NumericInput
            label="🔀 Non-Green Science Symbols"
            value={nonGreenSymbols}
            onChangeValue={setNonGreenSymbols}
            min={0}
            max={5}
            step={1}
            suffix="symbols"
            helperText="Science symbols from leaders, wonder stages, islands, etc."
          />

          <View style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}>
            <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
              🧮 Science Calculation
            </Text>

            <Text style={{ color: '#F3E7D3', fontSize: 12, marginBottom: 2 }}>
              Sets of 3 different: {Math.min(compass, tablet, gear)} × 7 = {Math.min(compass, tablet, gear) * 7} points
            </Text>

            <Text style={{ color: '#F3E7D3', fontSize: 12, marginBottom: 2 }}>
              Symbol squares: {compass}² + {tablet}² + {gear}² = {(compass * compass) + (tablet * tablet) + (gear * gear)} points
            </Text>

            <View style={{
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderRadius: 6,
              padding: 8,
              marginTop: 8,
              alignItems: 'center',
            }}>
              <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold' }}>
                Total Science: {calculateSciencePoints()} points
              </Text>
            </View>

            {nonGreenSymbols > 0 && (
              <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11, marginTop: 4 }}>
                Note: Wild symbols from non-green sources will be optimally distributed for maximum points.
              </Text>
            )}
          </View>
        </View>
      )}
    </ScoreCategory>
  );
}

// Fixed Bottom Section
function FixedBottomSection({
  playerScore,
  allPlayersComplete,
  currentIndex,
  totalPlayers,
  onNavigate,
  onComplete,
  onBack
}: {
  playerScore: PlayerEndGameScore;
  allPlayersComplete: boolean;
  currentIndex: number;
  totalPlayers: number;
  onNavigate: (index: number) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const isLastPlayer = currentIndex === totalPlayers - 1;
  const totalPoints = playerScore.scoring.total;
  const hasCalculatedPoints = playerScore.scoring.isComplete;

  return (
    <View style={{
      backgroundColor: '#1C1A1A',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(243, 231, 211, 0.2)',
    }}>
      {/* Dynamic Total Display */}
      <View style={{
        backgroundColor: hasCalculatedPoints ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: hasCalculatedPoints ? '#22C55E' : '#F59E0B',
        alignItems: 'center',
      }}>
        {hasCalculatedPoints ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#22C55E', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              🏆 TOTAL SCORE
            </Text>
            <Text style={{ color: '#F3E7D3', fontSize: 32, fontWeight: 'bold' }}>
              {totalPoints}
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
              points • Ready for analysis!
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#F59E0B', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              ⏳ CALCULATING...
            </Text>
            <Text style={{ color: '#F3E7D3', fontSize: 24, fontWeight: 'bold' }}>
              {totalPoints > 0 ? `${totalPoints}+` : 'To be determined'}
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, textAlign: 'center' }}>
              Complete all categories for final score
            </Text>
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          title="← Back"
          variant="ghost"
          onPress={onBack}
          className="flex-1"
        />

        {!isLastPlayer ? (
          <Button
            title="Next Player →"
            onPress={() => onNavigate(currentIndex + 1)}
            className="flex-1"
          />
        ) : allPlayersComplete ? (
          <Button
            title="🏆 See Results & Podium!"
            onPress={onComplete}
            className="flex-1"
          />
        ) : (
          <Button
            title="Complete Scoring"
            onPress={onComplete}
            disabled={!allPlayersComplete}
            className="flex-1"
          />
        )}
      </View>

      {allPlayersComplete && (
        <View style={{
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          borderRadius: 8,
          padding: 8,
          marginTop: 8,
          alignItems: 'center',
        }}>
          <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold' }}>
            🎉 All players complete! Ready for full results and analysis!
          </Text>
        </View>
      )}
    </View>
  );
}