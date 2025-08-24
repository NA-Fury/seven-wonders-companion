// components/ui/armada-shipyard.tsx - Complete Armada shipyard system
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Shipyard, ShipyardTrack, SHIPYARDS_DATABASE } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';

interface ArmadaShipyardSelectorProps {
  players: Array<{ id: string; name: string }>;
  onComplete: () => void;
  onBack: () => void;
}

export function ArmadaShipyardSelector({ players, onComplete, onBack }: ArmadaShipyardSelectorProps) {
  const { assignWonder, wonders } = useSetupStore();
  const [selectedShipyards, setSelectedShipyards] = useState<Record<string, string>>({});
  const [viewingShipyard, setViewingShipyard] = useState<Shipyard | null>(null);

  const handleShipyardSelect = (playerId: string, shipyardId: string) => {
    setSelectedShipyards(prev => ({ ...prev, [playerId]: shipyardId }));
    assignWonder(playerId, { shipyardId });
  };

  const handleRandomAssignment = () => {
    Alert.alert(
      'Random Shipyard Assignment',
      'This will randomly assign shipyards to all players. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: () => {
            players.forEach(player => {
              const randomShipyard = SHIPYARDS_DATABASE[
                Math.floor(Math.random() * SHIPYARDS_DATABASE.length)
              ];
              handleShipyardSelect(player.id, randomShipyard.id);
            });
          }
        },
      ]
    );
  };

  const allAssigned = players.every(player => 
    selectedShipyards[player.id] || wonders[player.id]?.shipyardId
  );

  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
        ⚓ Armada Shipyard Assignment
      </Text>
      
      <Text style={{ 
        color: 'rgba(243, 231, 211, 0.7)', 
        fontSize: 14, 
        marginBottom: 16,
        lineHeight: 20,
      }}>
        Each player chooses a shipyard with 4 naval tracks: Red (Military), Yellow (Commerce), Blue (Exploration), and Green (Science). Different shipyards have different advancement costs.
      </Text>

      {/* Shipyard Detail View */}
      {viewingShipyard && (
        <ShipyardDetailView
          shipyard={viewingShipyard}
          onClose={() => setViewingShipyard(null)}
        />
      )}

      {/* Random Assignment Button */}
      <Pressable
        onPress={handleRandomAssignment}
        style={{
          backgroundColor: 'rgba(196, 162, 76, 0.2)',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(196, 162, 76, 0.4)',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
          🎲 Random Assign All Shipyards
        </Text>
      </Pressable>

      {/* Available Shipyards Overview */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Available Shipyards
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {SHIPYARDS_DATABASE.map((shipyard) => (
              <ShipyardPreviewCard
                key={shipyard.id}
                shipyard={shipyard}
                onPress={() => setViewingShipyard(shipyard)}
                onSelect={(playerId) => handleShipyardSelect(playerId, shipyard.id)}
                availablePlayers={players.filter(p => 
                  !selectedShipyards[p.id] && !wonders[p.id]?.shipyardId
                )}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Player Assignments */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Player Assignments
        </Text>
        
        {players.map((player, index) => {
            const assignedShipyardId =
                selectedShipyards[player.id] || wonders[player.id]?.shipyardId;

            const assignedShipyard: Shipyard | null = assignedShipyardId
                ? (SHIPYARDS_DATABASE.find(s => s.id === assignedShipyardId) ?? null)
                : null;

          return (
            <PlayerShipyardAssignment
              key={player.id}
              player={player}
              position={index + 1}
              assignedShipyard={assignedShipyard}
              onReassign={() => {
                // Clear assignment to allow new selection
                setSelectedShipyards(prev => {
                  const updated = { ...prev };
                  delete updated[player.id];
                  return updated;
                });
                assignWonder(player.id, { shipyardId: undefined });
              }}
            />
          );
        })}
      </View>

      {/* Navigation */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <Pressable
          onPress={onBack}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(243, 231, 211, 0.4)',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 14, fontWeight: 'bold' }}>
            Back
          </Text>
        </Pressable>
        
        <Pressable
          onPress={onComplete}
          disabled={!allAssigned}
          style={{
            flex: 1,
            backgroundColor: allAssigned ? '#C4A24C' : 'rgba(196, 162, 76, 0.3)',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: allAssigned ? '#1C1A1A' : 'rgba(28, 26, 26, 0.5)',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface ShipyardPreviewCardProps {
  shipyard: Shipyard;
  onPress: () => void;
  onSelect: (playerId: string) => void;
  availablePlayers: Array<{ id: string; name: string }>;
}

function ShipyardPreviewCard({ shipyard, onPress, onSelect, availablePlayers }: ShipyardPreviewCardProps) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={[{
      width: 200,
      backgroundColor: 'rgba(19, 92, 102, 0.3)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.2)',
    }, animatedStyle]}>
      <Pressable onPress={handlePress}>
        <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
          {shipyard.name}
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11, marginBottom: 8 }}>
          {shipyard.description}
        </Text>

        {/* Track Preview */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <TrackIndicator color="red" cost={shipyard.redTrack.levels[0].cost} />
          <TrackIndicator color="yellow" cost={shipyard.yellowTrack.levels[0].cost} />
          <TrackIndicator color="blue" cost={shipyard.blueTrack.levels[0].cost} />
          <TrackIndicator color="green" cost={shipyard.greenTrack.levels[0].cost} />
        </View>
      </Pressable>

      {/* Quick Assign Buttons */}
      {availablePlayers.length > 0 && (
        <View>
          <Pressable
            onPress={() => setShowAssignMenu(!showAssignMenu)}
            style={{
              backgroundColor: 'rgba(196, 162, 76, 0.2)',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(196, 162, 76, 0.4)',
            }}
          >
            <Text style={{ color: '#C4A24C', fontSize: 11, fontWeight: 'bold' }}>
              {showAssignMenu ? 'Hide' : `Assign (${availablePlayers.length})`}
            </Text>
          </Pressable>

          {showAssignMenu && (
            <View style={{ marginTop: 6, gap: 4 }}>
              {availablePlayers.slice(0, 3).map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => {
                    onSelect(player.id);
                    setShowAssignMenu(false);
                  }}
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: 6,
                    paddingVertical: 4,
                    paddingHorizontal: 6,
                    borderWidth: 1,
                    borderColor: 'rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <Text style={{ color: '#22C55E', fontSize: 10, fontWeight: 'bold' }}>
                    → {player.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

interface TrackIndicatorProps {
  color: 'red' | 'yellow' | 'blue' | 'green';
  cost: number;
}

function TrackIndicator({ color, cost }: TrackIndicatorProps) {
  const colorMap = {
    red: '#EF4444',
    yellow: '#F59E0B',
    blue: '#3B82F6',
    green: '#10B981',
  };

  return (
    <View style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colorMap[color],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'white',
    }}>
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
        {cost}
      </Text>
    </View>
  );
}

interface PlayerShipyardAssignmentProps {
  player: { id: string; name: string };
  position: number;
  assignedShipyard: Shipyard | null;
  onReassign: () => void;
}

function PlayerShipyardAssignment({ 
  player, 
  position, 
  assignedShipyard, 
  onReassign 
}: PlayerShipyardAssignmentProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: assignedShipyard ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: assignedShipyard ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    }}>
      {/* Position & Player */}
      <View style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#C4A24C',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: '#1C1A1A', fontSize: 13, fontWeight: 'bold' }}>
          {position}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>
          {player.name}
        </Text>
        {assignedShipyard ? (
          <View>
            <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: 'bold' }}>
              ⚓ {assignedShipyard.name}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
              <TrackIndicator color="red" cost={assignedShipyard.redTrack.levels[0].cost} />
              <TrackIndicator color="yellow" cost={assignedShipyard.yellowTrack.levels[0].cost} />
              <TrackIndicator color="blue" cost={assignedShipyard.blueTrack.levels[0].cost} />
              <TrackIndicator color="green" cost={assignedShipyard.greenTrack.levels[0].cost} />
            </View>
          </View>
        ) : (
          <Text style={{ color: '#EF4444', fontSize: 13 }}>
            No shipyard assigned
          </Text>
        )}
      </View>

      {/* Reassign Button */}
      <Pressable
        onPress={onReassign}
        style={{
          backgroundColor: 'rgba(196, 162, 76, 0.2)',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: 'rgba(196, 162, 76, 0.4)',
        }}
      >
        <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold' }}>
          {assignedShipyard ? 'Change' : 'Assign'}
        </Text>
      </Pressable>
    </View>
  );
}

interface ShipyardDetailViewProps {
  shipyard: Shipyard;
  onClose: () => void;
}

function ShipyardDetailView({ shipyard, onClose }: ShipyardDetailViewProps) {
  return (
    <View style={{
      backgroundColor: 'rgba(28, 26, 26, 0.95)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: '#C4A24C',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 18, fontWeight: 'bold' }}>
          {shipyard.name}
        </Text>
        <Pressable
          onPress={onClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}>×</Text>
        </Pressable>
      </View>

      <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 14, marginBottom: 16 }}>
        {shipyard.description}
      </Text>

      {/* All Four Tracks */}
      <View style={{ gap: 12 }}>
        <ShipyardTrackDetail track={shipyard.redTrack} />
        <ShipyardTrackDetail track={shipyard.yellowTrack} />
        <ShipyardTrackDetail track={shipyard.blueTrack} />
        <ShipyardTrackDetail track={shipyard.greenTrack} />
      </View>
    </View>
  );
}

interface ShipyardTrackDetailProps {
  track: ShipyardTrack;
}

function ShipyardTrackDetail({ track }: ShipyardTrackDetailProps) {
  const colorMap = {
    red: '#EF4444',
    yellow: '#F59E0B',
    blue: '#3B82F6',
    green: '#10B981',
  };

  return (
    <View style={{
      backgroundColor: `${colorMap[track.color]}20`,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: `${colorMap[track.color]}40`,
    }}>
      <Text style={{ color: colorMap[track.color], fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
        {track.name}
      </Text>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {track.levels.map((level, index) => (
          <View key={index} style={{
            flex: 1,
            backgroundColor: `${colorMap[track.color]}30`,
            borderRadius: 6,
            padding: 4,
            alignItems: 'center',
          }}>
            <Text style={{ color: colorMap[track.color], fontSize: 10, fontWeight: 'bold' }}>
              {level.cost}💰
            </Text>
            <Text style={{ color: colorMap[track.color], fontSize: 8, textAlign: 'center' }}>
              {level.reward}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}