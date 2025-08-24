// app/setup/seating.tsx - Fixed modal and enhanced with age/conflict modes
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H1, H2, P } from '../../components/ui';
import {
  AerialTableView,
  DragDropPlayerList,
  PlayerDetailsModal,
  SeatingControls,
  SeatingStats,
  TableModeSelector
} from '../../components/ui/aerial-table-seating';
import { useSetupStore } from '../../store/setupStore';

export type TableMode = 'age1' | 'age2' | 'age3' | 'military' | 'leaders' | 'navy';

export default function SeatingScreen() {
  const { players, seating, setSeating, expansions } = useSetupStore();
  const [selectedSeating, setSelectedSeating] = useState<string[]>(
    seating.length > 0 ? seating : players.map(p => p.id)
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [tableMode, setTableMode] = useState<TableMode>('age1');

  useEffect(() => {
    if (seating.length === 0 && players.length > 0) {
      setSelectedSeating(players.map(p => p.id));
    }
  }, [players, seating]);

  const handlePlayerReorder = (newOrder: string[]) => {
    setSelectedSeating(newOrder);
  };

  const handlePlayerSelect = (playerId: string) => {
    // Prevent modal if we're already showing it
    if (showPlayerDetails) return;
    
    setSelectedPlayer(playerId);
    setShowPlayerDetails(true);
  };

  const handleCloseDetails = () => {
    setShowPlayerDetails(false);
    setTimeout(() => {
      setSelectedPlayer(null);
    }, 100);
  };

  const handleRandomize = () => {
    const shuffled = [...selectedSeating].sort(() => Math.random() - 0.5);
    setSelectedSeating(shuffled);
  };

  const handleOptimalSeating = () => {
    Alert.alert(
      'Smart Seating',
      'This will analyze player preferences and create optimal seating. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleContinue = () => {
    if (selectedSeating.length < 3) {
      Alert.alert('Not Enough Players', 'You need at least 3 players for 7 Wonders.');
      return;
    }
    if (selectedSeating.length > 7) {
      Alert.alert('Too Many Players', '7 Wonders supports a maximum of 7 players.');
      return;
    }

    setSeating(selectedSeating);
    router.push('./setup/wonders');
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const getNeighbors = (playerId: string) => {
    const index = selectedSeating.indexOf(playerId);
    if (index === -1) return { left: '', right: '' };
    
    const leftIndex = index === 0 ? selectedSeating.length - 1 : index - 1;
    const rightIndex = index === selectedSeating.length - 1 ? 0 : index + 1;
    
    return {
      left: getPlayerName(selectedSeating[leftIndex]),
      right: getPlayerName(selectedSeating[rightIndex])
    };
  };

  const getExpansionText = () => {
    const active = Object.entries(expansions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    return active.length > 0 ? `Base + ${active.join(' + ')}` : 'Base Game Only';
  };

  const selectedPlayerData = selectedPlayer
    ? (() => {
      const p = players.find(pl => pl.id === selectedPlayer);
      return p ? { id: p.id, name: p.name } : null;
      })()
  : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ 
        flex: 1, 
        backgroundColor: '#1C1A1A', 
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20
      }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 120,
            flexGrow: 1 
          }}
          style={{ flex: 1 }}
          scrollEnabled={!showPlayerDetails}
        >
          <H1>Table Seating</H1>
          <P className="mb-4">
            Arrange players around the table. Use the tabs below to visualize different game phases.
          </P>

          {/* Game Setup Info */}
          <Card>
            <H2>Game Setup</H2>
            <P className="text-aurum mb-1">{getExpansionText()}</P>
            <P className="text-parchment/60 text-sm">
              {selectedSeating.length} players • Strategic seating matters for trading & military
            </P>
          </Card>

          {/* Seating Statistics */}
          <SeatingStats 
            playerIds={selectedSeating}
            getPlayerName={getPlayerName}
          />

          {/* Table Mode Selector */}
          <TableModeSelector
            currentMode={tableMode}
            onModeChange={setTableMode}
            expansions={expansions}
          />

          {/* Aerial Table View */}
          <Card>
            <H2>Aerial Table View</H2>
            <P className="mb-4 text-parchment/70 text-sm">
              Tap any player to see their details. Arrows show turn order and conflicts for the selected phase.
            </P>
            <AerialTableView 
              playerIds={selectedSeating}
              getPlayerName={getPlayerName}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={handlePlayerSelect}
              mode={tableMode}
              disabled={showPlayerDetails}
            />
          </Card>

          {/* Seating Controls */}
          <SeatingControls
            onRandomize={handleRandomize}
            onOptimalSeating={handleOptimalSeating}
          />

          {/* Drag & Drop Player Reordering */}
          <Card>
            <H2>Player Order</H2>
            <P className="mb-3 text-parchment/70 text-sm">
              Drag and drop to reorder players • Hold and drag any player to rearrange seating
            </P>
            <DragDropPlayerList
              playerIds={selectedSeating}
              getPlayerName={getPlayerName}
              getNeighbors={getNeighbors}
              onReorder={handlePlayerReorder}
              disabled={showPlayerDetails}
            />
          </Card>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fixed Navigation */}
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
        }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Back to Players"
              variant="ghost"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title="Continue to Wonders"
              onPress={handleContinue}
              className="flex-1"
              disabled={selectedSeating.length < 3 || selectedSeating.length > 7}
            />
          </View>
        </View>
      </View>

      {/* Player Details Modal - Properly isolated */}
      <PlayerDetailsModal
        visible={showPlayerDetails}
        player={selectedPlayerData}
        position={selectedPlayer ? selectedSeating.indexOf(selectedPlayer) + 1 : 0}
        neighbors={selectedPlayer ? getNeighbors(selectedPlayer) : { left: '', right: '' }}
        onClose={handleCloseDetails}
      />
    </SafeAreaView>
  );
}