// components/ui/proper-armada-shipyard.tsx - Updated for 7 shipyard system
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
import { ArmadaShipyard, NavalTrack, NavalSpace, ARMADA_SHIPYARDS, getShipyardDistribution, getBalancedRandomShipyards } from '../../data/armadaDatabase';
import { useSetupStore } from '../../store/setupStore';

interface ProperArmadaShipyardSelectorProps {
  players: { id: string; name: string }[];
  onComplete: () => void;
  onBack: () => void;
}

export function ProperArmadaShipyardSelector({ players, onComplete, onBack }: ProperArmadaShipyardSelectorProps) {
  const { assignWonder, wonders } = useSetupStore();
  const [selectedShipyards, setSelectedShipyards] = useState<Record<string, string>>({});
  const [viewingShipyard, setViewingShipyard] = useState<ArmadaShipyard | null>(null);

  const distribution = getShipyardDistribution();

  const handleShipyardSelect = (playerId: string, shipyardId: string) => {
    setSelectedShipyards(prev => ({ ...prev, [playerId]: shipyardId }));
    assignWonder(playerId, { shipyardId });
  };

  const handleRandomAssignment = () => {
    Alert.alert(
      'Random Shipyard Assignment',
      'This will randomly assign shipyards to all players while respecting distribution limits (max 2 per wonder track color, except yellow which has 1). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: () => {
            // Use balanced random assignment that respects distribution
            const randomShipyards = getBalancedRandomShipyards(players.length);
            
            players.forEach((player, index) => {
              if (index < randomShipyards.length) {
                handleShipyardSelect(player.id, randomShipyards[index].id);
              }
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
        marginBottom: 12,
        lineHeight: 20,
      }}>
        Each player chooses a shipyard with 4 naval tracks. Each track has 7 spaces with different costs and rewards. The wonder symbol shows which track advances when you build wonder stages.
      </Text>

      {/* Shipyard Distribution Info */}
      <View style={{
        backgroundColor: 'rgba(196, 162, 76, 0.1)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(196, 162, 76, 0.3)',
      }}>
        <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
          Available Shipyards ({distribution.total} total)
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>
            🔴 Red: {distribution.red}
          </Text>
          <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: 'bold' }}>
            🟡 Yellow: {distribution.yellow}
          </Text>
          <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: 'bold' }}>
            🔵 Blue: {distribution.blue}
          </Text>
          <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>
            🟢 Green: {distribution.green}
          </Text>
        </View>
        <Text style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 11, marginTop: 4 }}>
          Wonder track color indicates which track advances when building wonder stages
        </Text>
      </View>

      {/* Shipyard Detail View */}
      {viewingShipyard && (
        <DetailedShipyardView
          shipyard={viewingShipyard}
          onClose={() => setViewingShipyard(null)}
          onSelectForPlayer={(playerId) => {
            handleShipyardSelect(playerId, viewingShipyard.id);
            setViewingShipyard(null);
          }}
          availablePlayers={players.filter(p => 
            !selectedShipyards[p.id] && !wonders[p.id]?.shipyardId
          )}
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
            {ARMADA_SHIPYARDS.map((shipyard) => (
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
          const assignedShipyardId = selectedShipyards[player.id] || wonders[player.id]?.shipyardId;
          const assignedShipyard = assignedShipyardId ? 
            (ARMADA_SHIPYARDS.find(s => s.id === assignedShipyardId) ?? null) : null;

          return (
            <PlayerShipyardAssignment
              key={player.id}
              player={player}
              position={index + 1}
              assignedShipyard={assignedShipyard}
              onReassign={() => {
                setSelectedShipyards(prev => {
                  const updated = { ...prev };
                  delete updated[player.id];
                  return updated;
                });
                assignWonder(player.id, { shipyardId: undefined });
              }}
              onViewDetails={() => assignedShipyard && setViewingShipyard(assignedShipyard)}
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
  shipyard: ArmadaShipyard;
  onPress: () => void;
  onSelect: (playerId: string) => void;
  availablePlayers: { id: string; name: string }[];
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

  const getTrackColor = (color: string) => {
    const colorMap = {
      red: '#EF4444',
      yellow: '#F59E0B', 
      blue: '#3B82F6',
      green: '#10B981',
    };
    return colorMap[color as keyof typeof colorMap] || '#6B7280';
  };

  return (
    <Animated.View style={[{
      width: 260, // Increased width for better display
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
        
        {/* Wonder Track Indicator */}
        <View style={{ 
          backgroundColor: getTrackColor(shipyard.wonderTrack),
          borderRadius: 8,
          padding: 6,
          marginBottom: 8,
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
            🛟 Wonder Track: {shipyard.wonderTrack.toUpperCase()}
          </Text>
        </View>

        {/* Compact Track Preview */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          {['red', 'yellow', 'blue', 'green'].map((color) => (
            <View key={color} style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: getTrackColor(color),
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: shipyard.wonderTrack === color ? 3 : 1,
              borderColor: shipyard.wonderTrack === color ? '#FFD700' : 'white',
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                {color.charAt(0).toUpperCase()}
              </Text>
              {shipyard.wonderTrack === color && (
                <Text style={{ color: '#FFD700', fontSize: 8 }}>🛟</Text>
              )}
            </View>
          ))}
        </View>

        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 10, textAlign: 'center' }}>
          Tap to view full details
        </Text>
      </Pressable>

      {/* Quick Assign Buttons */}
      {availablePlayers.length > 0 && (
        <View style={{ marginTop: 8 }}>
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
              {showAssignMenu ? 'Hide' : `Quick Assign (${availablePlayers.length})`}
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

interface PlayerShipyardAssignmentProps {
  player: { id: string; name: string };
  position: number;
  assignedShipyard: ArmadaShipyard | null;
  onReassign: () => void;
  onViewDetails?: () => void;
}

function PlayerShipyardAssignment({ 
  player, 
  position, 
  assignedShipyard, 
  onReassign,
  onViewDetails
}: PlayerShipyardAssignmentProps) {
  const getTrackColor = (color: string) => {
    const colorMap = {
      red: '#EF4444',
      yellow: '#F59E0B', 
      blue: '#3B82F6',
      green: '#10B981',
    };
    return colorMap[color as keyof typeof colorMap] || '#6B7280';
  };

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
            <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
              ⚓ {assignedShipyard.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11, marginRight: 8 }}>
                Wonder Track:
              </Text>
              <View style={{
                backgroundColor: getTrackColor(assignedShipyard.wonderTrack),
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderWidth: 2,
                borderColor: '#FFD700',
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  🛟 {assignedShipyard.wonderTrack.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={{ color: '#EF4444', fontSize: 13 }}>
            No shipyard assigned
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {assignedShipyard && onViewDetails && (
          <Pressable
            onPress={onViewDetails}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(59, 130, 246, 0.4)',
            }}
          >
            <Text style={{ color: '#3B82F6', fontSize: 11, fontWeight: 'bold' }}>
              View
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={onReassign}
          style={{
            backgroundColor: 'rgba(196, 162, 76, 0.2)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: 'rgba(196, 162, 76, 0.4)',
          }}
        >
          <Text style={{ color: '#C4A24C', fontSize: 11, fontWeight: 'bold' }}>
            {assignedShipyard ? 'Change' : 'Assign'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface DetailedShipyardViewProps {
  shipyard: ArmadaShipyard;
  onClose: () => void;
  onSelectForPlayer: (playerId: string) => void;
  availablePlayers: { id: string; name: string }[];
}

function DetailedShipyardView({ shipyard, onClose, onSelectForPlayer, availablePlayers }: DetailedShipyardViewProps) {
  return (
    <View style={{
      backgroundColor: 'rgba(28, 26, 26, 0.98)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: '#C4A24C',
      maxHeight: '80%',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
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

      <Text style={{ color: '#C4A24C', fontSize: 14, marginBottom: 12, fontWeight: 'bold' }}>
        🛟 Wonder Track: {shipyard.wonderTrack.toUpperCase()} (advances when building wonder stages)
      </Text>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* All Four Tracks */}
        <View style={{ gap: 12 }}>
          <NavalTrackDetail track={shipyard.redTrack} isWonderTrack={shipyard.wonderTrack === 'red'} />
          <NavalTrackDetail track={shipyard.yellowTrack} isWonderTrack={shipyard.wonderTrack === 'yellow'} />
          <NavalTrackDetail track={shipyard.blueTrack} isWonderTrack={shipyard.wonderTrack === 'blue'} />
          <NavalTrackDetail track={shipyard.greenTrack} isWonderTrack={shipyard.wonderTrack === 'green'} />
        </View>
      </ScrollView>

      {/* Quick Assign Buttons - Fixed at bottom */}
      {availablePlayers.length > 0 && (
        <View style={{ 
          marginTop: 12, 
          borderTopWidth: 1, 
          borderTopColor: 'rgba(243, 231, 211, 0.2)', 
          paddingTop: 12,
          backgroundColor: 'rgba(28, 26, 26, 0.98)'
        }}>
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
            Assign to Player:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {availablePlayers.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => onSelectForPlayer(player.id)}
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: 'bold' }}>
                    → {player.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

interface NavalTrackDetailProps {
  track: NavalTrack;
  isWonderTrack: boolean;
}

function NavalTrackDetail({ track, isWonderTrack }: NavalTrackDetailProps) {
  const colorMap = {
    red: '#EF4444',
    yellow: '#F59E0B',
    blue: '#3B82F6',
    green: '#10B981',
  };

  const trackColor = colorMap[track.color];

  return (
    <View style={{
      backgroundColor: `${trackColor}15`,
      borderRadius: 8,
      padding: 8,
      borderWidth: isWonderTrack ? 2 : 1,
      borderColor: isWonderTrack ? '#FFD700' : `${trackColor}40`,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: trackColor, fontSize: 14, fontWeight: 'bold', flex: 1 }}>
          {track.name}
        </Text>
        {isWonderTrack && (
          <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold' }}>
            🛟 WONDER TRACK
          </Text>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {track.spaces.map((space, index) => (
            <NavalSpaceDetail
              key={index}
              space={space}
              trackColor={trackColor}
              isWonderSpace={space.hasWonderSymbol}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface NavalSpaceDetailProps {
  space: NavalSpace;
  trackColor: string;
  isWonderSpace?: boolean;
}

function NavalSpaceDetail({ space, trackColor, isWonderSpace }: NavalSpaceDetailProps) {
  return (
    <View style={{
      width: 80,
      backgroundColor: space.position === 0 ? `${trackColor}20` : `${trackColor}30`,
      borderRadius: 6,
      padding: 4,
      alignItems: 'center',
      borderWidth: isWonderSpace ? 2 : 1,
      borderColor: isWonderSpace ? '#FFD700' : trackColor,
      minHeight: 60,
    }}>
      <Text style={{ color: trackColor, fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>
        {space.position === 0 ? 'START' : space.position}
      </Text>
      
      {isWonderSpace && (
        <Text style={{ color: '#FFD700', fontSize: 8, marginBottom: 2 }}>🛟</Text>
      )}
      
      {space.cost && (
        <Text style={{ color: trackColor, fontSize: 8, textAlign: 'center', marginBottom: 2 }}>
          {space.cost.amount} {space.cost.type === 'coins' ? '💰' : 
           space.cost.type === 'raw' ? '🪵' : 
           space.cost.type === 'manufactured' ? '🏺' : '⚡'}
        </Text>
      )}
      
      {space.effect && (
        <Text style={{ color: trackColor, fontSize: 7, textAlign: 'center', lineHeight: 10 }}>
          {space.effect.description}
        </Text>
      )}
    </View>
  );
}