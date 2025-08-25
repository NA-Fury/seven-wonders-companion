import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';
import { Button, H1, P } from '../ui';
import { SimpleDirectPointsSection, ScienceScoringSection, WonderScoringSection } from './ScoringCategories';
import type { PlayerScoreData } from '../../types/scoring';

export default function ComprehensiveEndGameScoring() {
  const { players, seating, expansions, wonders } = useSetupStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState<PlayerScoreData[]>([]);

  const orderedPlayers = useMemo(() => {
    if (!players) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map((id: any) => players.find((p: any) => p.id === id)).filter(Boolean) as typeof players;
  }, [players, seating]);

  const currentPlayer = orderedPlayers[currentPlayerIndex];

  useEffect(() => {
    if (orderedPlayers.length > 0 && playerScores.length === 0) {
      const initial = orderedPlayers.map((p: any, i: number) => {
        const assign = wonders?.[p.id];
        const wonder = assign?.boardId ? WONDERS_DATABASE.find(w => w.id === assign.boardId) : null;
        const shipyard = assign?.shipyardId && expansions?.armada ? ARMADA_SHIPYARDS.find(s => s.id === assign.shipyardId) : undefined;
        return {
          playerId: p.id,
          playerName: p.name,
          position: i + 1,
          wonderData: wonder ? {
            wonderId: wonder.name,
            side: assign?.side || 'day',
            maxStages: wonder.daySide?.stages?.length || 0,
            stagePoints: wonder.daySide?.stages?.map((s: any) => s.points || 0) || []
          } : {
            wonderId: 'Unknown',
            side: 'day',
            maxStages: 0,
            stagePoints: []
          },
          shipyardData: shipyard ? {
            shipyardId: shipyard.id,
            name: shipyard.name,
            wonderTrack: shipyard.wonderTrack
          } : undefined,
          scoring: {
            total: 0,
            pendingCalculations: false,
            isComplete: false
          }
        } as PlayerScoreData;
      });
      setPlayerScores(initial);
    }
  }, [orderedPlayers]);

  const updatePlayerScore = useCallback((playerId: string, updates: any) => {
    setPlayerScores(prev => prev.map(ps => {
      if (ps.playerId !== playerId) return ps;
      const newScoring = { ...(ps.scoring || {}), ...updates };
      // Calculate total from all categories
      let total = 0;
      Object.values(newScoring).forEach((v: any) => {
        if (v && typeof v === 'object') {
          total += v.directPoints || v.calculatedPoints || 0;
        }
      });
      newScoring.total = total;
      return { ...ps, scoring: newScoring };
    }));
  }, []);

  const navigateToPlayer = (idx: number) => {
    if (idx >= 0 && idx < orderedPlayers.length) setCurrentPlayerIndex(idx);
  };

  if (!currentPlayer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <H1>Setup Required</H1>
          <P>No players found. Please complete the game setup first.</P>
        </View>
      </SafeAreaView>
    );
  }

  const currentScore = playerScores.find(s => s.playerId === currentPlayer.id) || ({} as PlayerScoreData);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(243,231,211,0.1)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => navigateToPlayer(currentPlayerIndex - 1)}
              disabled={currentPlayerIndex === 0}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: currentPlayerIndex === 0 ? 'rgba(107,114,128,0.3)' : '#C4A24C',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: currentPlayerIndex === 0 ? '#6B7280' : '#1C1A1A' }}>‹</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#C4A24C', fontWeight: '700' }}>{currentScore.playerName || currentPlayer.name}</Text>
              <Text style={{ color: 'rgba(243,231,211,0.7)', fontSize: 12 }}>
                {currentScore.wonderData?.wonderId || ''} • {currentPlayerIndex + 1}/{orderedPlayers.length}
              </Text>
            </View>
            <Pressable
              onPress={() => navigateToPlayer(currentPlayerIndex + 1)}
              disabled={currentPlayerIndex === orderedPlayers.length - 1}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: currentPlayerIndex === orderedPlayers.length - 1 ? 'rgba(107,114,128,0.3)' : '#C4A24C',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: currentPlayerIndex === orderedPlayers.length - 1 ? '#6B7280' : '#1C1A1A' }}>›</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <WonderScoringSection
            playerScore={currentScore}
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { wonder: upd })}
          />
          <SimpleDirectPointsSection
            title="Military"
            icon="⚔️"
            playerScore={currentScore}
            keyName="military"
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { military: upd })}
            min={-6}
            max={40}
          />
          <SimpleDirectPointsSection
            title="Civilian"
            icon="🏘️"
            playerScore={currentScore}
            keyName="civilian"
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { civilian: upd })}
          />
          <SimpleDirectPointsSection
            title="Commercial"
            icon="💼"
            playerScore={currentScore}
            keyName="commercial"
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { commercial: upd })}
          />
          <SimpleDirectPointsSection
            title="Guilds"
            icon="🎭"
            playerScore={currentScore}
            keyName="guilds"
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { guilds: upd })}
          />
          <ScienceScoringSection
            playerScore={currentScore}
            onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { science: upd })}
          />
          {expansions?.leaders && (
            <SimpleDirectPointsSection
              title="Leaders"
              icon="👑"
              playerScore={currentScore}
              keyName="leaders"
              onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { leaders: upd })}
              max={30}
            />
          )}
          {expansions?.cities && (
            <SimpleDirectPointsSection
              title="Cities"
              icon="🏙️"
              playerScore={currentScore}
              keyName="cities"
              onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { cities: upd })}
              min={-10}
              max={40}
            />
          )}
          {expansions?.armada && (
            <SimpleDirectPointsSection
              title="Armada"
              icon="⚓"
              playerScore={currentScore}
              keyName="armada"
              onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { armada: upd })}
              min={-6}
              max={40}
            />
          )}
          {expansions?.edifice && (
            <SimpleDirectPointsSection
              title="Edifice"
              icon="🗿"
              playerScore={currentScore}
              keyName="edifice"
              onUpdate={(upd: any) => updatePlayerScore(currentPlayer.id, { edifice: upd })}
              min={-10}
              max={30}
            />
          )}
        </ScrollView>

        <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(243,231,211,0.1)', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#C4A24C', fontWeight: '700' }}>Total: {currentScore.scoring?.total || 0}</Text>
            <Text style={{ color: 'rgba(243,231,211,0.7)', fontSize: 12 }}>
              {currentScore.scoring?.isComplete ? 'Complete' : 'In progress'}
            </Text>
          </View>
          <Button
            title="Next"
            onPress={() => navigateToPlayer(currentPlayerIndex + 1)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}