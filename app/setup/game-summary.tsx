// app/setup/game-summary.tsx - Clean implementation
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { getProjectById } from '../../data/edificeDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';

// Helper for Roman numerals
const romanAge = (age: 1 | 2 | 3) => (['I', 'II', 'III'][age - 1] as 'I' | 'II' | 'III');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E1A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#FEF3C7',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  cardTitle: {
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  issueCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  issueText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 6,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusBarError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusTextError: {
    color: '#EF4444',
  },
  playerCard: {
    backgroundColor: 'rgba(19, 92, 102, 0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerNumberText: {
    color: '#0F0E1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerName: {
    color: '#F3E7D3',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  playerNeighbors: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  neighborLabel: {
    color: 'rgba(243, 231, 211, 0.5)',
    fontSize: 10,
    marginBottom: 2,
  },
  neighborName: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 11,
  },
  wonderInfo: {
    marginTop: 4,
  },
  wonderName: {
    color: '#C4A24C',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  wonderDetails: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 11,
  },
  wonderSide: {
    backgroundColor: '#FFA500',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  wonderSideNight: {
    backgroundColor: '#4169E1',
  },
  wonderSideText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  shipyardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  shipyardText: {
    color: 'rgba(99, 102, 241, 0.8)',
    fontSize: 11,
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
  proceedButton: {
    backgroundColor: '#C4A24C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 3,
    shadowColor: '#C4A24C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  proceedButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.5)',
  },
  proceedButtonText: {
    color: '#0F0E1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proceedButtonTextDisabled: {
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#C4A24C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C4A24C',
    fontSize: 14,
    marginTop: 12,
  },
});

export default function GameSummaryScreen() {
  const { players, seating, expansions, wonders, edificeProjects } = useSetupStore();
  const { initializeScoring } = useScoringStore();
  const [isLoading, setIsLoading] = useState(false);

  // Get ordered players based on seating
  const orderedPlayers = React.useMemo(() => {
    if (!players || players.length === 0) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map(seatId => players.find(p => p.id === seatId)).filter(Boolean) as typeof players;
  }, [players, seating]);

  // Get active expansions list
  const getExpansionsList = () => {
    const active = Object.entries(expansions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    return active.length > 0 ? active : ['Base Game Only'];
  };

  // Validate game setup
  const validateSetup = useCallback(() => {
    const issues: string[] = [];

    if (!players || players.length === 0) {
      issues.push('No players added - please add players first');
      return issues;
    }

    if (orderedPlayers.length < 3) {
      issues.push('Need at least 3 players (current: ' + orderedPlayers.length + ')');
    }

    if (orderedPlayers.length > 7) {
      issues.push('Maximum 7 players allowed (current: ' + orderedPlayers.length + ')');
    }

    // Check wonder assignments
    const unassignedWonders = orderedPlayers.filter(
      player => !wonders[player.id]?.boardId
    );
    if (unassignedWonders.length > 0) {
      issues.push(`${unassignedWonders.length} player(s) missing wonder board assignment`);
    }

    // Check shipyard assignments if Armada is enabled
    if (expansions?.armada) {
      const unassignedShipyards = orderedPlayers.filter(
        player => !wonders[player.id]?.shipyardId
      );
      if (unassignedShipyards.length > 0) {
        issues.push(`${unassignedShipyards.length} player(s) missing shipyard assignment`);
      }
    }

    // Check Edifice projects if enabled
    if (expansions?.edifice) {
      const { age1, age2, age3 } = edificeProjects || {};
      if (!age1 || !age2 || !age3) {
        const missing = [];
        if (!age1) missing.push('Age I');
        if (!age2) missing.push('Age II');
        if (!age3) missing.push('Age III');
        issues.push(`Edifice projects missing for: ${missing.join(', ')}`);
      }
    }

    return issues;
  }, [players, orderedPlayers, wonders, expansions, edificeProjects]);

  const setupIssues = validateSetup();
  const isReadyToPlay = setupIssues.length === 0;

  // Initialize scoring when ready
  const handleProceedToScoring = useCallback(async () => {
    if (!isReadyToPlay) return;

    setIsLoading(true);
    
    // Initialize scoring store with player IDs
    const playerIds = orderedPlayers.map(p => p.id);
    initializeScoring(playerIds, expansions);
    
    // Small delay to ensure state updates
    setTimeout(() => {
      router.push('/scoring');
    }, 100);
  }, [isReadyToPlay, orderedPlayers, initializeScoring, expansions]);

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4A24C" />
          <Text style={styles.loadingText}>Initializing Scoring System...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!players || players.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>No Game Setup Found</Text>
          <Text style={styles.subtitle}>Please complete game setup first</Text>
          <TouchableOpacity
            style={[styles.proceedButton, { marginTop: 20 }]}
            onPress={() => router.push('/setup/expansions')}
          >
            <Text style={styles.proceedButtonText}>Go to Setup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Game Summary</Text>
          <Text style={styles.subtitle}>
            Review your setup before starting the scoring calculator
          </Text>
        </View>

        {/* Setup Issues */}
        {!isReadyToPlay && (
          <View style={[styles.card, styles.issueCard]}>
            <Text style={[styles.cardTitle, { color: '#EF4444' }]}>
              Setup Issues ({setupIssues.length})
            </Text>
            {setupIssues.map((issue, index) => (
              <Text key={index} style={styles.issueText}>• {issue}</Text>
            ))}
            <Text style={[styles.subtitle, { color: '#EF4444', marginTop: 8 }]}>
              Resolve these issues before proceeding to scoring
            </Text>
          </View>
        )}

        {/* Game Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Game Configuration</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Players</Text>
              <Text style={styles.infoValue}>{orderedPlayers.length}</Text>
            </View>
            <View style={[styles.infoColumn, { flex: 2 }]}>
              <Text style={styles.infoLabel}>Expansions</Text>
              <Text style={styles.infoValue}>
                {getExpansionsList().join(' + ')}
              </Text>
            </View>
          </View>

          <View style={[
            styles.statusBar,
            !isReadyToPlay && styles.statusBarError,
          ]}>
            <Text style={styles.statusIcon}>
              {isReadyToPlay ? '✅' : '⚠️'}
            </Text>
            <Text style={[
              styles.statusText,
              !isReadyToPlay && styles.statusTextError,
            ]}>
              {isReadyToPlay 
                ? 'Setup Complete - Ready for Scoring!' 
                : `${setupIssues.length} issue(s) to resolve`}
            </Text>
          </View>
        </View>

        {/* Player Setup */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Player Setup</Text>
          <Text style={[styles.subtitle, { marginBottom: 12 }]}>
            Seating order (clockwise) with assigned wonders
          </Text>

          {orderedPlayers.map((player, index) => {
            const wonderData = wonders[player.id];
            const wonder = wonderData?.boardId
              ? WONDERS_DATABASE.find(w => w.id === wonderData.boardId)
              : null;
            const shipyard = wonderData?.shipyardId
              ? ARMADA_SHIPYARDS.find(s => s.id === wonderData.shipyardId)
              : null;

            return (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerHeader}>
                  <View style={styles.playerNumber}>
                    <Text style={styles.playerNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={styles.playerNeighbors}>
                    <Text style={styles.neighborLabel}>Neighbors</Text>
                    <Text style={styles.neighborName}>
                      ← {index === 0 
                        ? orderedPlayers[orderedPlayers.length - 1].name 
                        : orderedPlayers[index - 1].name}
                    </Text>
                    <Text style={styles.neighborName}>
                      → {index === orderedPlayers.length - 1 
                        ? orderedPlayers[0].name 
                        : orderedPlayers[index + 1].name}
                    </Text>
                  </View>
                </View>

                {wonder ? (
                  <View style={styles.wonderInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.wonderName}>{wonder.name}</Text>
                      <View style={[
                        styles.wonderSide,
                        wonderData.side === 'night' && styles.wonderSideNight,
                      ]}>
                        <Text style={styles.wonderSideText}>
                          {wonderData.side === 'day' ? '☀️ DAY' : '🌙 NIGHT'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.wonderDetails}>
                      Resource: {wonder.resource} • {wonder.difficulty}
                    </Text>

                    {shipyard && (
                      <View style={styles.shipyardInfo}>
                        <Text style={styles.shipyardText}>
                          ⚓ {shipyard.name}
                        </Text>
                        <View style={{
                          backgroundColor: {
                            red: '#EF4444',
                            yellow: '#F59E0B',
                            blue: '#3B82F6',
                            green: '#10B981',
                          }[shipyard.wonderTrack],
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}>
                          <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                            {shipyard.wonderTrack.toUpperCase()} TRACK
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={styles.errorText}>No wonder assigned</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Edifice Projects */}
        {expansions?.edifice && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🗿 Edifice Projects</Text>
            <Text style={[styles.subtitle, { marginBottom: 12 }]}>
              Collaborative projects for this game
            </Text>

            {[1, 2, 3].map(age => {
              const projectId = edificeProjects?.[`age${age}` as keyof typeof edificeProjects];
              const project = projectId ? getProjectById(projectId) : null;

              return (
                <View key={age} style={{
                  backgroundColor: project 
                    ? 'rgba(139, 69, 19, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: project 
                    ? 'rgba(139, 69, 19, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)',
                }}>
                  {project ? (
                    <>
                      <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
                        {/* Age I/II/III */}
                        Age {romanAge(age as 1 | 2 | 3)}: {project.name}
                      </Text>
                      <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11, marginTop: 4 }}>
                        {project.effect.description}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: '#EF4444', fontSize: 13 }}>
                      {/* Age I/II/III */}
                      Age {romanAge(age as 1 | 2 | 3)}: No project selected
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Proceed to Scoring */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Scoring Calculator</Text>
          <Text style={styles.subtitle}>
            Quick score entry with optional detailed breakdowns for deeper analysis
          </Text>

          <TouchableOpacity
            style={[
              styles.proceedButton,
              !isReadyToPlay && styles.proceedButtonDisabled,
            ]}
            onPress={handleProceedToScoring}
            disabled={!isReadyToPlay}
          >
            <Text style={[
              styles.proceedButtonText,
              !isReadyToPlay && styles.proceedButtonTextDisabled,
            ]}>
              {isReadyToPlay
                ? '🎯 Enter Scoring Calculator'
                : `⚠️ Resolve ${setupIssues.length} Setup Issues First`}
            </Text>
          </TouchableOpacity>

          {isReadyToPlay && (
            <Text style={{
              color: 'rgba(99, 102, 241, 0.8)',
              fontSize: 11,
              textAlign: 'center',
              marginTop: 8,
              fontStyle: 'italic',
            }}>
              💡 The more details you enter, the more analysis we can provide!
            </Text>
          )}
        </View>

        {/* Navigation - single wide Back button */}
        <View style={{ marginTop: 16 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
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
              Back to Setup
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
