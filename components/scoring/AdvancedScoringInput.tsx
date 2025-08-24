// components/scoring/AdvancedScoringInput.tsx - Milestone 6 Expansion Scoring
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { H1, P, Card, Button } from '../ui';
import { NumericInput, ScoreCategory, ToggleRow } from '../ui/scoring';
import { Enhanced7WondersScoringEngine, GuildCard, EdificeProject } from '../../lib/scoring/enhancedScoringEngine';

interface AdvancedScoringInputProps {
  playerId: string;
  playerName: string;
  position: number;
  expansions: {
    leaders: boolean;
    cities: boolean;
    armada: boolean;
    edifice: boolean;
  };
  coreScoreData: any; // From previous step
  onScoreCalculated: (fullScore: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AdvancedScoringInput({ 
  playerId, 
  playerName, 
  position, 
  expansions,
  coreScoreData,
  onScoreCalculated,
  onNext,
  onBack 
}: AdvancedScoringInputProps) {
  // Leaders scoring
  const [leadersPoints, setLeadersPoints] = useState(0);
  const [wildScience, setWildScience] = useState(0);

  // Cities scoring
  const [blackCardPoints, setBlackCardPoints] = useState(0);
  const [debtTokens, setDebtTokens] = useState(0);
  const [redDiplomacyUsed, setRedDiplomacyUsed] = useState(false);
  const [blueDiplomacyUsed, setBlueDiplomacyUsed] = useState(false);
  const [teamworkPoints, setTeamworkPoints] = useState(0);

  // Armada scoring
  const [navalResults, setNavalResults] = useState({
    age1: { victories: 0, defeats: 0 },
    age2: { victories: 0, defeats: 0 },
    age3: { victories: 0, defeats: 0 },
  });
  const [islandPoints, setIslandPoints] = useState(0);
  const [shipyardPoints, setShipyardPoints] = useState(0);
  const [militaryBoardingTokens, setMilitaryBoardingTokens] = useState(0);

  // Edifice scoring
  const [edificeProjects, setEdificeProjects] = useState<EdificeProject[]>([]);

  // Guild scoring
  const [guildCards, setGuildCards] = useState<GuildCard[]>([]);
  const [showGuildBuilder, setShowGuildBuilder] = useState(false);

  const handleCalculateFullScore = () => {
    // Merge core data with expansion data
    const fullScoringInput = {
      ...coreScoreData,
      
      // Add leaders data
      leaders: expansions.leaders ? {
        points: leadersPoints,
        abilities: [],
        wildScience: wildScience,
      } : undefined,

      // Add cities data
      cities: expansions.cities ? {
        blackCards: { count: 0, points: blackCardPoints },
        debtTokens,
        diplomacyTokens: { 
          red: redDiplomacyUsed ? 1 : 0, 
          blue: blueDiplomacyUsed ? 1 : 0, 
          used: redDiplomacyUsed || blueDiplomacyUsed 
        },
        teamworkCards: { count: 0, points: teamworkPoints },
      } : undefined,

      // Add armada data
      armada: expansions.armada ? {
        navalConflicts: navalResults,
        islands: [{ islandId: 'mixed', name: 'Mixed Islands', points: islandPoints }],
        shipyardPoints,
        militaryBoardingTokens,
      } : undefined,

      // Add edifice data
      edifice: expansions.edifice ? {
        projects: edificeProjects,
      } : undefined,

      // Update science with wild symbols
      cards: {
        ...coreScoreData.cards,
        science: {
          ...coreScoreData.cards.science,
          wildSymbols: wildScience,
        },
        guilds: guildCards,
      },
    };

    const calculatedScore = Enhanced7WondersScoringEngine.calculatePlayerScore(fullScoringInput);
    onScoreCalculated(calculatedScore);
  };

  const previewScore = () => {
    handleCalculateFullScore();
    Alert.alert('Score Preview', 'Advanced scoring calculated! Check the detailed breakdown.', [{ text: 'OK' }]);
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <H1>Advanced Scoring - {playerName}</H1>
      <P className="mb-4">Configure expansion-specific scoring and guild cards.</P>

      {/* Leaders Expansion */}
      {expansions.leaders && (
        <ScoreCategory
          title="👑 Leaders"
          description="Points from leader cards and abilities"
          icon="👑"
        >
          <NumericInput
            label="Leader Points"
            value={leadersPoints}
            onChangeValue={setLeadersPoints}
            min={0}
            max={30}
            step={1}
            suffix="points"
            helperText="Total victory points from all leader cards"
          />
          
          <NumericInput
            label="Wild Science Symbols"
            value={wildScience}
            onChangeValue={setWildScience}
            min={0}
            max={5}
            step={1}
            suffix="symbols"
            helperText="Science symbols that can be any type (from leaders)"
          />
        </ScoreCategory>
      )}

      {/* Cities Expansion */}
      {expansions.cities && (
        <ScoreCategory
          title="🏙️ Cities"
          description="Black cards, debt, diplomacy, and teamwork"
          icon="🏙️"
        >
          <NumericInput
            label="Black Card Points"
            value={blackCardPoints}
            onChangeValue={setBlackCardPoints}
            min={0}
            max={40}
            step={1}
            suffix="points"
            helperText="Victory points from black cards"
          />
          
          <NumericInput
            label="Debt Tokens"
            value={debtTokens}
            onChangeValue={setDebtTokens}
            min={0}
            max={10}
            step={1}
            suffix="tokens"
            helperText="Each debt token = -1 point"
          />

          <View style={{ gap: 8, marginTop: 12 }}>
            <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold' }}>
              Diplomacy Tokens Used
            </Text>
            
            <ToggleRow
              label="🔴 Red Diplomacy (Skip Military)"
              value={redDiplomacyUsed}
              onToggle={setRedDiplomacyUsed}
            />
            
            <ToggleRow
              label="🔵 Blue Diplomacy (Skip Naval)"
              value={blueDiplomacyUsed}
              onToggle={setBlueDiplomacyUsed}
            />
          </View>
          
          <NumericInput
            label="Teamwork Points"
            value={teamworkPoints}
            onChangeValue={setTeamworkPoints}
            min={0}
            max={20}
            step={1}
            suffix="points"
            helperText="Points from teamwork cards (require neighbor cooperation)"
          />

          <View style={{ 
            padding: 12, 
            backgroundColor: 'rgba(255, 107, 107, 0.1)', 
            borderRadius: 8,
            marginTop: 12 
          }}>
            <Text style={{ color: '#FF6B6B', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
              Cities Total Preview
            </Text>
            <Text style={{ color: '#F3E7D3', fontSize: 13 }}>
              {blackCardPoints} (black cards) - {debtTokens} (debt) + {teamworkPoints} (teamwork) = {blackCardPoints - debtTokens + teamworkPoints} points
            </Text>
          </View>
        </ScoreCategory>
      )}

      {/* Armada Expansion */}
      {expansions.armada && (
        <ScoreCategory
          title="⚓ Armada"
          description="Naval conflicts, islands, and shipyard advancement"
          icon="⚓"
        >
          <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
            Naval Conflicts
          </Text>
          
          {[1, 2, 3].map(age => (
            <View key={age} style={{ marginBottom: 16 }}>
              <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                Age {age} Naval Conflicts ({age === 1 ? 1 : age === 2 ? 3 : 5} pts each)
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <NumericInput
                    label="Victories"
                    value={navalResults[`age${age}` as keyof typeof navalResults].victories}
                    onChangeValue={(value: any) => {
                      setNavalResults(prev => ({
                        ...prev,
                        [`age${age}`]: { ...prev[`age${age}` as keyof typeof prev], victories: value }
                      }));
                    }}
                    min={0}
                    max={6}
                    step={1}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <NumericInput
                    label="Defeats"
                    value={navalResults[`age${age}` as keyof typeof navalResults].defeats}
                    onChangeValue={(value: any) => {
                      setNavalResults(prev => ({
                        ...prev,
                        [`age${age}`]: { ...prev[`age${age}` as keyof typeof prev], defeats: value }
                      }));
                    }}
                    min={0}
                    max={6}
                    step={1}
                  />
                </View>
              </View>
            </View>
          ))}

          <NumericInput
            label="Island Points"
            value={islandPoints}
            onChangeValue={setIslandPoints}
            min={0}
            max={30}
            step={1}
            suffix="points"
            helperText="Total points from island cards"
          />
          
          <NumericInput
            label="Shipyard Advancement"
            value={shipyardPoints}
            onChangeValue={setShipyardPoints}
            min={0}
            max={20}
            step={1}
            suffix="points"
            helperText="Points from advancing on shipyard tracks"
          />
          
          <NumericInput
            label="Military Boarding Tokens"
            value={militaryBoardingTokens}
            onChangeValue={setMilitaryBoardingTokens}
            min={0}
            max={10}
            step={1}
            suffix="tokens"
            helperText="Tokens forcing military engagement"
          />

          <ArmadaScorePreview navalResults={navalResults} islandPoints={islandPoints} shipyardPoints={shipyardPoints} />
        </ScoreCategory>
      )}

      {/* Edifice Expansion */}
      {expansions.edifice && (
        <ScoreCategory
          title="🗿 Edifice"
          description="Collaborative project contributions"
          icon="🗿"
        >
          <EdificeProjectManager
            projects={edificeProjects}
            onProjectsChange={setEdificeProjects}
          />
        </ScoreCategory>
      )}

      {/* Guild Cards */}
      <ScoreCategory
        title="🎭 Guild Cards"
        description="Purple cards with neighbor dependencies"
        icon="🎭"
      >
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <Button
            title="Add Guild Card"
            variant="ghost"
            onPress={() => setShowGuildBuilder(true)}
            className="flex-1"
          />
          <Button
            title={`${guildCards.length} Guild${guildCards.length !== 1 ? 's' : ''}`}
            variant="ghost"
            disabled
            className="flex-1"
          />
        </View>

        {guildCards.map((guild, index) => (
          <GuildCardDisplay
            key={index}
            guild={guild}
            onRemove={() => {
              setGuildCards(prev => prev.filter((_, i) => i !== index));
            }}
          />
        ))}

        {showGuildBuilder && (
          <GuildCardBuilder
            onAddGuild={(guild: GuildCard) => {
              setGuildCards(prev => [...prev, guild]);
              setShowGuildBuilder(false);
            }}
            onCancel={() => setShowGuildBuilder(false)}
          />
        )}
      </ScoreCategory>

      {/* Final Score Actions */}
      <Card>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button
            title="Back"
            variant="ghost"
            onPress={onBack}
            className="flex-1"
          />
          <Button
            title="🔍 Preview Full Score"
            variant="ghost"
            onPress={previewScore}
            className="flex-1"
          />
        </View>
        
        <Button
          title="Calculate Final Score"
          onPress={() => {
            handleCalculateFullScore();
            onNext();
          }}
        />
      </Card>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Helper Components

function ArmadaScorePreview({ navalResults, islandPoints, shipyardPoints }: any) {
  const navalVictoryPoints = 
    (navalResults.age1.victories * 1) +
    (navalResults.age2.victories * 3) +
    (navalResults.age3.victories * 5);

  const navalDefeatPoints = 
    (navalResults.age1.defeats + navalResults.age2.defeats + navalResults.age3.defeats) * -1;

  const total = navalVictoryPoints + navalDefeatPoints + islandPoints + shipyardPoints;

  return (
    <View style={{ 
      padding: 12, 
      backgroundColor: 'rgba(99, 102, 241, 0.1)', 
      borderRadius: 8,
      marginTop: 12 
    }}>
      <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
        Armada Total Preview
      </Text>
      <Text style={{ color: '#F3E7D3', fontSize: 13 }}>
        Naval: {navalVictoryPoints} - {Math.abs(navalDefeatPoints)} + Islands: {islandPoints} + Shipyard: {shipyardPoints} = {total} points
      </Text>
    </View>
  );
}

function EdificeProjectManager({ projects, onProjectsChange }: any) {
  const availableProjects = [
    { id: 'lighthouse', name: 'Lighthouse', maxContribution: 5 },
    { id: 'great_wall', name: 'Great Wall', maxContribution: 4 },
    { id: 'academy', name: 'Academy', maxContribution: 3 },
  ];

  const addProject = (projectTemplate: any) => {
    const newProject: EdificeProject = {
      id: projectTemplate.id,
      name: projectTemplate.name,
      contributionLevel: 0,
      pointsEarned: 0,
      completed: false,
    };
    onProjectsChange([...projects, newProject]);
  };

  const updateProject = (index: number, updates: Partial<EdificeProject>) => {
    const updated = projects.map((p: EdificeProject, i: number) => 
      i === index ? { ...p, ...updates } : p
    );
    onProjectsChange(updated);
  };

  return (
    <View>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
        Add Edifice Projects:
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {availableProjects.map(project => (
          <Button
            key={project.id}
            title={project.name}
            variant="ghost"
            onPress={() => addProject(project)}
            disabled={projects.some((p: EdificeProject) => p.id === project.id)}
          />
        ))}
      </View>

      {projects.map((project: EdificeProject, index: number) => (
        <View key={index} style={{
          padding: 12,
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          borderRadius: 8,
          marginBottom: 8,
        }}>
          <Text style={{ color: '#8B4513', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
            {project.name}
          </Text>
          
          <NumericInput
            label="Contribution Level"
            value={project.contributionLevel}
            onChangeValue={(value: any) => updateProject(index, { contributionLevel: value })}
            min={0}
            max={5}
            step={1}
          />
          
          <NumericInput
            label="Points Earned"
            value={project.pointsEarned}
            onChangeValue={(value: any) => updateProject(index, { pointsEarned: value })}
            min={0}
            max={20}
            step={1}
            suffix="points"
          />
          
          <ToggleRow
            label="Project Completed"
            value={project.completed}
            onToggle={(completed: any) => updateProject(index, { completed })}
          />
        </View>
      ))}
    </View>
  );
}

function GuildCardDisplay({ guild, onRemove }: { guild: GuildCard; onRemove: () => void }) {
  return (
    <View style={{
      padding: 12,
      backgroundColor: 'rgba(147, 112, 219, 0.1)',
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#9370DB', fontSize: 14, fontWeight: 'bold' }}>
          {guild.name}
        </Text>
        <Text style={{ color: '#F3E7D3', fontSize: 12 }}>
          {guild.effect}
        </Text>
        <Text style={{ color: '#C4A24C', fontSize: 12 }}>
          {guild.points} points
        </Text>
      </View>
      
      <Button
        title="Remove"
        variant="ghost"
        onPress={onRemove}
      />
    </View>
  );
}

function GuildCardBuilder({ onAddGuild, onCancel }: any) {
  const [selectedGuild, setSelectedGuild] = useState('');
  const [customPoints, setCustomPoints] = useState(0);

  const commonGuilds = [
    { id: 'workers_guild', name: "Workers' Guild", effect: '1 pt per brown card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'craftsmens_guild', name: "Craftsmen's Guild", effect: '2 pts per gray card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'traders_guild', name: "Traders' Guild", effect: '1 pt per yellow card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'philosophers_guild', name: "Philosophers' Guild", effect: '1 pt per green card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'spies_guild', name: "Spies' Guild", effect: '1 pt per red card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'magistrates_guild', name: "Magistrates' Guild", effect: '1 pt per blue card (self + neighbors)', dependsOnNeighbors: true },
    { id: 'scientists_guild', name: "Scientists' Guild", effect: 'Choose 1 science symbol', dependsOnNeighbors: false },
    { id: 'builders_guild', name: "Builders' Guild", effect: '2 pts per wonder stage (self + neighbors)', dependsOnNeighbors: true },
  ];

  const handleAddGuild = () => {
    const guildTemplate = commonGuilds.find(g => g.id === selectedGuild);
    if (!guildTemplate) return;

    const guild: GuildCard = {
      id: guildTemplate.id,
      name: guildTemplate.name,
      effect: guildTemplate.effect,
      points: customPoints,
      dependsOnNeighbors: guildTemplate.dependsOnNeighbors,
    };

    onAddGuild(guild);
  };

  return (
    <View style={{
      padding: 16,
      backgroundColor: 'rgba(147, 112, 219, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(147, 112, 219, 0.3)',
    }}>
      <Text style={{ color: '#9370DB', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Add Guild Card
      </Text>

      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
        Select Guild Type:
      </Text>
      
      <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
        {commonGuilds.map(guild => (
          <Button
            key={guild.id}
            title={guild.name}
            variant={selectedGuild === guild.id ? 'primary' : 'ghost'}
            onPress={() => setSelectedGuild(guild.id)}
            className="mb-2"
          />
        ))}
      </ScrollView>

      {selectedGuild && (
        <View style={{ marginTop: 12 }}>
          <NumericInput
            label="Total Points"
            value={customPoints}
            onChangeValue={setCustomPoints}
            min={0}
            max={50}
            step={1}
            suffix="points"
            helperText="Calculate based on your cards and neighbors"
          />
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={onCancel}
          className="flex-1"
        />
        <Button
          title="Add Guild"
          onPress={handleAddGuild}
          disabled={!selectedGuild || customPoints === 0}
          className="flex-1"
        />
      </View>
    </View>
  );
}