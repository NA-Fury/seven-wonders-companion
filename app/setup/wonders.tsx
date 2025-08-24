// app/setup/wonders.tsx - Fixed version with proper Armada integration and expansion filtering
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H1, H2, P } from '../../components/ui';
import { ProperArmadaShipyardSelector } from '../../components/ui/proper-armada-shipyard';
import { PlayerWonderDisplay, WonderAssignmentControls } from '../../components/ui/wonder-assignment';
import { WonderCard } from '../../components/ui/wonder-card';
import { WONDERS_DATABASE, Wonder } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';

export default function WonderAssignmentScreen() {
  const { players, seating, expansions, assignWonder, wonders } = useSetupStore();
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'random' | 'smart'>('manual');
  const [selectedWonder, setSelectedWonder] = useState<Wonder | null>(null);
  const [selectedSide, setSelectedSide] = useState<'day' | 'night'>('day');
  const [assigningToPlayer, setAssigningToPlayer] = useState<string | null>(null);
  const [showShipyards, setShowShipyards] = useState(false);

  const getOrderedPlayers = () => {
    if (seating.length === 0) return players;
    return seating.map(seatId => players.find(p => p.id === seatId)).filter(Boolean) as typeof players;
  };

  const orderedPlayers = getOrderedPlayers();

  const getAvailableWonders = () => {
    const assignedWonderIds = Object.values(wonders)
      .map(w => w.boardId)
      .filter(Boolean);
    
    console.log('Current expansions:', expansions);
    console.log('Assigned wonder IDs:', assignedWonderIds);
    
    // Filter wonders based on enabled expansions
    const filteredWonders = WONDERS_DATABASE.filter(wonder => {
      // Check if wonder is already assigned
      if (assignedWonderIds.includes(wonder.id)) return false;
      
      console.log(`Checking wonder ${wonder.name} (${wonder.expansion})`);
      
      // Always include base wonders
      if (wonder.expansion === 'Base') {
        console.log(`Including base wonder: ${wonder.name}`);
        return true;
      }
      
      // Include expansion wonders only if expansion is enabled
      const expansionMap = {
        'Leaders': expansions.leaders,
        'Cities': expansions.cities,
        'Armada': expansions.armada,
        'Edifice': expansions.edifice,
      };
      
      const isEnabled = expansionMap[wonder.expansion as keyof typeof expansionMap] === true;
      console.log(`Wonder ${wonder.name} from ${wonder.expansion}: enabled = ${isEnabled}`);
      
      return isEnabled;
    });
    
    console.log('Available wonders after filtering:', filteredWonders.map(w => w.name));
    return filteredWonders;
  };

  const getAssignedWonders = () => {
    return orderedPlayers.map(player => ({
      player,
      wonder: wonders[player.id]?.boardId ? 
        (WONDERS_DATABASE.find(w => w.id === wonders[player.id].boardId) ?? null)
        : null,
      side: wonders[player.id]?.side || 'day',
      shipyard: wonders[player.id]?.shipyardId || null,
    }));
  };

  const handleWonderSelect = (wonder: Wonder) => {
    setSelectedWonder(wonder);
  };

  const handleAssignWonder = (playerId: string) => {
    if (!selectedWonder) {
      Alert.alert('No Wonder Selected', 'Please select a wonder first.');
      return;
    }

    assignWonder(playerId, {
      boardId: selectedWonder.id,
      side: selectedSide,
    });

    setSelectedWonder(null);
    setAssigningToPlayer(null);
  };

  const handleRandomAssignment = () => {
    Alert.alert(
      'Random Assignment',
      'This will randomly assign wonders to all players. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: () => {
            const availableWonders = getAvailableWonders();
            const shuffledWonders = availableWonders.sort(() => Math.random() - 0.5);
            
            orderedPlayers.forEach((player, index) => {
              if (index < shuffledWonders.length) {
                const randomSide = Math.random() > 0.5 ? 'night' : 'day';
                assignWonder(player.id, {
                  boardId: shuffledWonders[index].id,
                  side: randomSide,
                });
              }
            });
          }
        },
      ]
    );
  };

  const handleSmartAssignment = () => {
    Alert.alert(
      'Smart Assignment',
      'This will analyze player count and expansions to assign balanced wonders. Coming in future update!',
      [{ text: 'OK' }]
    );
  };

  const handleClearAssignments = () => {
    Alert.alert(
      'Clear All Assignments',
      'This will remove all wonder assignments. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            orderedPlayers.forEach(player => {
              assignWonder(player.id, {});
            });
          }
        },
      ]
    );
  };

  const handleContinue = () => {
    const unassignedPlayers = orderedPlayers.filter(player => !wonders[player.id]?.boardId);
    
    if (unassignedPlayers.length > 0) {
      Alert.alert(
        'Incomplete Assignment',
        `${unassignedPlayers.length} player(s) still need wonder assignment.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if Armada expansion requires shipyard assignment
    if (expansions.armada) {
      const unassignedShipyards = orderedPlayers.filter(player => !wonders[player.id]?.shipyardId);
      if (unassignedShipyards.length > 0) {
        setShowShipyards(true);
        return;
      }
    }

    // Check if Edifice expansion is enabled
    if (expansions.edifice) {
      router.push('./setup/edifice');
      return;
    }

    // Otherwise go to game summary
    router.push('./setup/game-summary');
  };

  const assignedWonders = getAssignedWonders();
  const availableWonders = getAvailableWonders();
  const allAssigned = orderedPlayers.every(player => wonders[player.id]?.boardId);
  const allShipyardsAssigned = !expansions.armada || orderedPlayers.every(player => wonders[player.id]?.shipyardId);

  const getExpansionText = () => {
    const active = Object.entries(expansions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    return active.length > 0 ? `Base + ${active.join(' + ')}` : 'Base Game Only';
  };

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
        >
          <H1>🎴 Wonder Assignment</H1>
          <P className="mb-4">
            Assign wonder boards to each player. Each wonder has unique abilities and strategies.
          </P>

          {/* Game Setup Info */}
          <Card>
            <H2>Game Setup</H2>
            <P className="text-aurum mb-1">{getExpansionText()}</P>
            <P className="text-parchment/60 text-sm mb-3">
              {orderedPlayers.length} players {availableWonders.length} wonders available {Object.keys(wonders).filter(id => wonders[id]?.boardId).length} assigned
            </P>
          </Card>

          {/* Player Assignments */}
          <Card>
            <H2>Players & Seating Order</H2>
            {assignedWonders.map(({ player, wonder, side }, index) => (
              <PlayerWonderDisplay
                key={player.id}
                player={player}
                position={index + 1}
                wonder={wonder}
                side={side}
                onReassign={() => setAssigningToPlayer(player.id)}
                onRemove={() => assignWonder(player.id, {})}
              />
            ))}
          </Card>

          {/* Assignment Controls */}
          <WonderAssignmentControls
            mode={assignmentMode}
            onModeChange={setAssignmentMode}
            onRandomAssign={handleRandomAssignment}
            onSmartAssign={handleSmartAssignment}
            onClearAll={handleClearAssignments}
            totalPlayers={orderedPlayers.length}
            assignedCount={assignedWonders.filter(a => a.wonder).length}
          />

          {/* Manual Assignment Mode */}
          {assignmentMode === 'manual' && assigningToPlayer && (
            <Card>
              <H2>Assign Wonder to {orderedPlayers.find(p => p.id === assigningToPlayer)?.name}</H2>
              <P className="mb-4 text-parchment/70 text-sm">
                Select a wonder and side, then confirm assignment.
              </P>
              
              {selectedWonder && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <WonderCard
                    wonder={selectedWonder}
                    selectedSide={selectedSide}
                    onSideChange={setSelectedSide}
                    isSelected={true}
                  />
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setAssigningToPlayer(null);
                    setSelectedWonder(null);
                  }}
                  className="flex-1"
                />
                <Button
                  title="Assign Wonder"
                  onPress={() => handleAssignWonder(assigningToPlayer)}
                  className="flex-1"
                  disabled={!selectedWonder}
                />
              </View>
            </Card>
          )}

          {/* Available Wonders */}
          {(assignmentMode === 'manual' && !assigningToPlayer) && (
            <Card>
              <H2>Available Wonders ({availableWonders.length})</H2>
              <P className="mb-4 text-parchment/70 text-sm">
                Tap a wonder to preview, then select a player to assign it to.
              </P>
              
              {availableWonders.length === 0 ? (
                <P className="text-center text-parchment/60 py-8">
                  All available wonders have been assigned!
                </P>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ 
                    paddingHorizontal: 10,
                    gap: 20 
                  }}
                >
                  {availableWonders.map((wonder) => (
                    <WonderCard
                      key={wonder.id}
                      wonder={wonder}
                      selectedSide="day"
                      onSideChange={() => {}}
                      isSelected={selectedWonder?.id === wonder.id}
                      onSelect={() => handleWonderSelect(wonder)}
                    />
                  ))}
                </ScrollView>
              )}
            </Card>
          )}

          {/* Quick Assignment for Manual Mode */}
          {assignmentMode === 'manual' && !assigningToPlayer && selectedWonder && (
            <Card>
              <H2>Assign {selectedWonder.name}</H2>
              <P className="mb-4 text-parchment/70 text-sm">
                Select which player should receive this wonder.
              </P>
              
              {orderedPlayers
                .filter(player => !wonders[player.id]?.boardId)
                .map((player) => (
                  <Button
                    key={player.id}
                    title={`Assign to ${player.name} (Position ${seating.indexOf(player.id) + 1 || orderedPlayers.indexOf(player) + 1})`}
                    variant="ghost"
                    onPress={() => handleAssignWonder(player.id)}
                    className="mb-2"
                  />
                ))}
            </Card>
          )}

          {/* Shipyard Assignment (Armada Expansion) */}
          {showShipyards && (
            <ProperArmadaShipyardSelector
              players={orderedPlayers}
              onComplete={() => {
                setShowShipyards(false);
                if (expansions.edifice) {
                  router.push('./setup/edifice');
                } else {
                  router.push('./setup/game-summary');
                }
              }}
              onBack={() => setShowShipyards(false)}
            />
          )}

          {/* Add some space before navigation */}
          <View style={{ height: 20 }} />
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
        }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Back to Seating"
              variant="ghost"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title={
                expansions.armada && !allShipyardsAssigned ? "Continue to Shipyards" : 
                expansions.edifice ? "Continue to Edifice" : "Continue to Summary"
              }
              onPress={handleContinue}
              className="flex-1"
              disabled={!allAssigned}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}