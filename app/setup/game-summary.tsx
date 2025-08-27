// app/setup/game-summary.tsx - Instant navigation with preloading
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { InteractionManager, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, H1, H2, P, Screen } from '../../components/ui';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { getProjectById } from '../../data/edificeDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

export default function GameSummaryScreen() {
  const { players, seating, expansions, wonders, edificeProjects } = useSetupStore();
  const { initializeScores } = useScoringStore();
  const [isPreloaded, setIsPreloaded] = useState(false);

  const getOrderedPlayers = () => {
    if (!players || players.length === 0) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map(seatId => players.find(p => p.id === seatId)).filter(Boolean) as typeof players;
  };

  const orderedPlayers = getOrderedPlayers();

  // Pre-initialize scoring data when this screen loads
  useFocusEffect(
    useCallback(() => {
      if (orderedPlayers.length > 0 && !isPreloaded) {
        // Initialize scoring store in background
        InteractionManager.runAfterInteractions(() => {
          initializeScores(orderedPlayers, wonders);
          setIsPreloaded(true);
        });
      }
    }, [orderedPlayers, wonders, isPreloaded])
  );

  const getExpansionsList = () => {
    const activeExpansions = Object.entries(expansions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    return activeExpansions.length > 0 ? activeExpansions : ['Base Game Only'];
  };

  const validateGameSetup = () => {
    const issues: string[] = [];
    
    if (!players || players.length === 0) {
      issues.push('No players found - please add players first');
      return issues;
    }
    
    if (orderedPlayers.length < 3) issues.push('Need at least 3 players');
    if (orderedPlayers.length > 7) issues.push('Maximum 7 players allowed');
    
    const unassignedWonders = orderedPlayers.filter(player => !wonders[player.id]?.boardId);
    if (unassignedWonders.length > 0) {
      issues.push(`${unassignedWonders.length} players missing wonder assignments`);
    }
    
    if (expansions.armada) {
      const unassignedShipyards = orderedPlayers.filter(player => !wonders[player.id]?.shipyardId);
      if (unassignedShipyards.length > 0) {
        issues.push(`${unassignedShipyards.length} players missing shipyard assignments`);
      }
    }

    if (expansions.edifice) {
      const { age1, age2, age3 } = edificeProjects;
      if (!age1 || !age2 || !age3) {
        issues.push('Edifice projects incomplete - select one project per age');
      }
    }
    
    return issues;
  };

  const setupIssues = validateGameSetup();
  const isReadyToPlay = setupIssues.length === 0;

  // INSTANT NAVIGATION - Use replace instead of push for faster transition
  const handleProceedToScoring = useCallback(() => {
    if (isReadyToPlay) {
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        router.replace('/scoring');
      });
    }
  }, [isReadyToPlay]);

  const handleBackToSetup = () => {
    router.back();
  };

  if (!players || players.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <H1>No Game Setup Found</H1>
          <P className="text-center mb-4">
            Please complete the game setup first before viewing the summary.
          </P>
          <Button
            title="Go to Setup"
            onPress={() => router.replace('/setup/expansions')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>Game Summary</H1>
        <P className="mb-4">
          Review your complete 7 Wonders setup before starting the scoring calculator.
        </P>

        {!isReadyToPlay && (
          <Card style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            borderWidth: 1,
            marginBottom: 16 
          }}>
            <H2 style={{ color: '#EF4444' }}>Setup Issues ({setupIssues.length})</H2>
            {setupIssues.map((issue, index) => (
              <React.Fragment key={index}>
                <Text style={{ color: '#EF4444', fontSize: 13, marginBottom: 4 }}>
                  • {issue}
                </Text>
              </React.Fragment>
            ))}
            <P className="text-sm mt-2" style={{ color: 'rgba(239, 68, 68, 0.8)' }}>
              Please resolve these issues before proceeding to scoring.
            </P>
          </Card>
        )}

        <Card>
          <H2>Game Configuration</H2>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 2 }}>
                Players
              </Text>
              <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold' }}>
                {orderedPlayers.length}
              </Text>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 2 }}>
                Expansions
              </Text>
              <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
                {getExpansionsList().join(' + ')}
              </Text>
            </View>
          </View>
          
          <View style={{
            backgroundColor: isReadyToPlay ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderRadius: 8,
            padding: 8,
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>
              {isReadyToPlay ? '✅' : '⚠️'}
            </Text>
            <Text style={{ 
              color: isReadyToPlay ? '#22C55E' : '#F59E0B', 
              fontSize: 12, 
              fontWeight: 'bold' 
            }}>
              {isReadyToPlay ? 'Setup Complete - Ready for Scoring!' : `${setupIssues.length} issues to resolve`}
            </Text>
          </View>
        </Card>

        <Card>
          <H2>Player Setup</H2>
          <P className="mb-4 text-parchment/70 text-sm">
            Seating order (clockwise) with assigned wonders
          </P>

          {orderedPlayers.map((player, index) => {
            const wonderData = wonders[player.id];
            const wonder = wonderData?.boardId ? 
              WONDERS_DATABASE.find(w => w.id === wonderData.boardId) : null;
            const shipyard = wonderData?.shipyardId ?
              ARMADA_SHIPYARDS.find(s => s.id === wonderData.shipyardId) : null;
            
            return (
              <React.Fragment key={player.id}>
                <View
                  style={{
                    backgroundColor: 'rgba(19, 92, 102, 0.2)',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: wonder ? 'rgba(243, 231, 211, 0.1)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginBottom: 8 }}>
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#C4A24C',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ color: '#1C1A1A', fontSize: 14, fontWeight: 'bold' }}>
                          {index + 1}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>
                          {player.name}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                        <Text style={{ color: 'rgba(243, 231, 211, 0.5)', fontSize: 10, marginBottom: 1 }}>
                          Neighbors
                        </Text>
                        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11, textAlign: 'right' }}>
                          ← {index === 0 ? orderedPlayers[orderedPlayers.length - 1].name : orderedPlayers[index - 1].name}
                        </Text>
                        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11, textAlign: 'right' }}>
                          → {index === orderedPlayers.length - 1 ? orderedPlayers[0].name : orderedPlayers[index + 1].name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {wonder ? (
                    <View style={{ marginTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold', marginRight: 8 }}>
                          {wonder.name}
                        </Text>
                        
                        <View style={{
                          backgroundColor: wonderData.side === 'day' ? '#FFA500' : '#4169E1',
                          borderRadius: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginRight: 8,
                        }}>
                          <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                            {wonderData.side === 'day' ? '☀️ DAY' : '🌙 NIGHT'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 11, marginBottom: 2 }}>
                        Resource: {wonder.resource} • {wonder.difficulty}
                      </Text>
                      
                      {shipyard && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Text style={{ color: 'rgba(99, 102, 241, 0.8)', fontSize: 11, marginRight: 4 }}>
                            ⚓ {shipyard.name}
                          </Text>
                          
                          <View style={{
                            backgroundColor: {
                              red: '#EF4444',
                              yellow: '#F59E0B',
                              blue: '#3B82F6', 
                              green: '#10B981'
                            }[shipyard.wonderTrack],
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            paddingVertical: 1,
                            borderWidth: 1,
                            borderColor: '#FFD700',
                          }}>
                            <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
                              🛟 {shipyard.wonderTrack.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>
                      No wonder assigned
                    </Text>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </Card>

        {expansions.edifice && (
          <Card>
            <H2>🗿 Edifice Projects</H2>
            <P className="mb-3 text-parchment/70 text-sm">
              Selected collaborative projects for this game
            </P>
            <EdificeProjectsSummary />
          </Card>
        )}

        <Card>
          <H2>🎯 Scoring Calculator</H2>
          
          {/* Optimized button with instant response */}
          <TouchableOpacity
            onPress={handleProceedToScoring}
            disabled={!isReadyToPlay}
            activeOpacity={0.7}
            style={{
              backgroundColor: !isReadyToPlay ? 'rgba(107, 114, 128, 0.3)' : '#C4A24C',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isReadyToPlay ? '#C4A24C' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              marginTop: 12,
            }}
          >
            <Text style={{
              color: !isReadyToPlay ? '#6B7280' : '#1C1A1A',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              {isReadyToPlay 
                ? (isPreloaded ? '🎯 Enter Scoring Calculator' : '⏳ Preparing Calculator...') 
                : `⚠️ Resolve ${setupIssues.length} Setup Issues First`
              }
            </Text>
          </TouchableOpacity>

          {isReadyToPlay && (
            <Text style={{ 
              color: 'rgba(243, 231, 211, 0.6)', 
              fontSize: 11,
              textAlign: 'center',
              marginTop: 8,
            }}>
              Quick score entry with detailed breakdowns available
            </Text>
          )}
        </Card>

        <Card className="flex-row gap-3 mt-4">
          <Button
            title="Back to Setup"
            variant="ghost"
            onPress={handleBackToSetup}
            className="flex-1"
          />
          <Button
            title="Calculate Scores"
            onPress={handleProceedToScoring}
            disabled={!isReadyToPlay}
            className="flex-1"
          />
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

function EdificeProjectsSummary() {
  const { edificeProjects } = useSetupStore();

  const getAgeColor = (age: number) => {
    switch (age) {
      case 1: return '#8B4513';
      case 2: return '#C0C0C0';  
      case 3: return '#FFD700';
      default: return '#8B4513';
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'Economic': return '#22C55E';
      case 'Military': return '#EF4444';
      case 'Science': return '#3B82F6';
      case 'Balanced': return '#8B5CF6';
      case 'Situational': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (!edificeProjects || (!edificeProjects.age1 && !edificeProjects.age2 && !edificeProjects.age3)) {
    return (
      <View style={{
        padding: 16,
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }}>
        <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: 'bold' }}>
          No Edifice projects selected
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 11, marginTop: 4 }}>
          Please return to Edifice setup to select projects
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {[1, 2, 3].map(age => {
        const projectId = edificeProjects[`age${age}` as keyof typeof edificeProjects];
        if (!projectId) return (
          <React.Fragment key={age}>
            <View
              style={{
                padding: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#EF4444',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                  {age}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: 'bold' }}>
                  Age {age} - No Project Selected
                </Text>
                <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
                  Please select a project for Age {age}
                </Text>
              </View>
            </View>
          </React.Fragment>
        );

        const project = getProjectById(projectId);
        if (!project) return null;
        
        return (
          <React.Fragment key={age}>
            <View
              style={{
                padding: 14,
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(139, 69, 19, 0.3)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: getAgeColor(age),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                    {age}
                  </Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ color: getAgeColor(age), fontSize: 16, fontWeight: 'bold' }}>
                    {project.name}
                  </Text>
                  <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
                    Available during Age {age}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: getStrategyColor(project.strategicValue),
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}>
                  <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                    {project.strategicValue.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={{ 
                color: 'rgba(243, 231, 211, 0.8)', 
                fontSize: 12, 
                lineHeight: 16,
                marginBottom: 8 
              }}>
                {project.effect.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 10, marginRight: 6 }}>
                    Cost:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {project.cost.map((cost, index) => (
                      <React.Fragment key={index}>
                        <View
                          style={{
                            backgroundColor: 'rgba(196, 162, 76, 0.3)',
                            borderRadius: 4,
                            paddingHorizontal: 4,
                            paddingVertical: 1,
                          }}
                        >
                          <Text style={{ color: '#C4A24C', fontSize: 9, fontWeight: 'bold' }}>
                            {cost.amount} {cost.resource}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </View>

                <View style={{
                  backgroundColor: 'rgba(196, 162, 76, 0.3)',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}>
                  <Text style={{ color: '#C4A24C', fontSize: 10, fontWeight: 'bold' }}>
                    {project.effect.pointsFormula || `${project.points} pts`}
                  </Text>
                </View>
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}