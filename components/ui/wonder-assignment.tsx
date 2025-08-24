// components/ui/wonder-assignment.tsx - Fixed UI layout issues
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Wonder, Shipyard, SHIPYARDS_DATABASE } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';

interface WonderAssignmentControlsProps {
  mode: 'manual' | 'random' | 'smart';
  onModeChange: (mode: 'manual' | 'random' | 'smart') => void;
  onRandomAssign: () => void;
  onSmartAssign: () => void;
  onClearAll: () => void;
  totalPlayers: number;
  assignedCount: number;
}

export function WonderAssignmentControls({
  mode,
  onModeChange,
  onRandomAssign,
  onSmartAssign,
  onClearAll,
  totalPlayers,
  assignedCount,
}: WonderAssignmentControlsProps) {
  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Assignment Mode
      </Text>
      
      {/* Progress Indicator */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(196, 162, 76, 0.1)',
        borderRadius: 8,
        padding: 8,
      }}>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: assignedCount === totalPlayers ? '#22C55E' : '#C4A24C',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {assignedCount}
          </Text>
        </View>
        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>
          {assignedCount} of {totalPlayers} players assigned
        </Text>
        {assignedCount === totalPlayers && (
          <Text style={{ color: '#22C55E', fontSize: 16, marginLeft: 8 }}>✓</Text>
        )}
      </View>

      {/* Mode Selection */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {[
          { key: 'manual', label: 'Manual', icon: '🎯' },
          { key: 'random', label: 'Random', icon: '🎲' },
          { key: 'smart', label: 'Smart', icon: '🧠' },
        ].map((modeOption) => (
          <Pressable
            key={modeOption.key}
            onPress={() => onModeChange(modeOption.key as any)}
            style={{
              flex: 1,
              backgroundColor: mode === modeOption.key ? '#C4A24C' : 'rgba(196, 162, 76, 0.2)',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 8,
              marginHorizontal: 2,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 2 }}>{modeOption.icon}</Text>
            <Text style={{
              color: mode === modeOption.key ? '#1C1A1A' : '#C4A24C',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              {modeOption.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {mode === 'random' && (
          <Pressable
            onPress={onRandomAssign}
            style={{
              flex: 1,
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.4)',
            }}
          >
            <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: 'bold' }}>
              🎲 Random Assign All
            </Text>
          </Pressable>
        )}

        {mode === 'smart' && (
          <Pressable
            onPress={onSmartAssign}
            style={{
              flex: 1,
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(147, 51, 234, 0.4)',
            }}
          >
            <Text style={{ color: '#9333EA', fontSize: 14, fontWeight: 'bold' }}>
              🧠 Smart Assign
            </Text>
          </Pressable>
        )}

        {assignedCount > 0 && (
          <Pressable
            onPress={onClearAll}
            style={{
              flex: 1,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.4)',
            }}
          >
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: 'bold' }}>
              🗑️ Clear All
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

interface PlayerWonderDisplayProps {
  player: { id: string; name: string };
  position: number;
  wonder: Wonder | null;
  side: 'day' | 'night';
  onReassign: () => void;
  onRemove: () => void;
}

export function PlayerWonderDisplay({
  player,
  position,
  wonder,
  side,
  onReassign,
  onRemove,
}: PlayerWonderDisplayProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (wonder) {
      scale.value = withSpring(0.98, {}, () => {
        scale.value = withSpring(1);
      });
    }
  };

  return (
    <Animated.View style={[{
      backgroundColor: wonder ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: wonder ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    }, animatedStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Position & Player Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
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
              
              {wonder ? (
                <View>
                  <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                    {wonder.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: side === 'day' ? '#FFA500' : '#4169E1',
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      marginRight: 8,
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                        {side === 'day' ? '☀️ DAY' : '🌙 NIGHT'}
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
                      {wonder.resource} • {wonder.difficulty}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#EF4444', fontSize: 13 }}>
                  No wonder assigned
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons - Moved to right side with better spacing */}
        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
          <Pressable
            onPress={onReassign}
            onPressIn={handlePress}
            style={{
              backgroundColor: 'rgba(196, 162, 76, 0.2)',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(196, 162, 76, 0.4)',
              marginBottom: 4,
              minWidth: 60,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold' }}>
              {wonder ? 'Change' : 'Assign'}
            </Text>
          </Pressable>
          
          {wonder && (
            <Pressable
              onPress={onRemove}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.4)',
                minWidth: 60,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>
                Remove
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

interface ShipyardSelectorProps {
  players: Array<{ id: string; name: string }>;
  onComplete: () => void;
  onBack: () => void;
}

export function ShipyardSelector({ players, onComplete, onBack }: ShipyardSelectorProps) {
  const { assignWonder, wonders } = useSetupStore();
  const [selectedShipyards, setSelectedShipyards] = useState<Record<string, string>>({});

  const handleShipyardSelect = (playerId: string, shipyardId: string) => {
    setSelectedShipyards(prev => ({ ...prev, [playerId]: shipyardId }));
    assignWonder(playerId, { shipyardId });
  };

  const handleRandomAssignment = () => {
    players.forEach(player => {
      const randomShipyard = SHIPYARDS_DATABASE[
        Math.floor(Math.random() * SHIPYARDS_DATABASE.length)
      ];
      handleShipyardSelect(player.id, randomShipyard.id);
    });
  };

  const allAssigned = players.every(player => selectedShipyards[player.id] || wonders[player.id]?.shipyardId);

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
        Each player needs a shipyard for the Armada expansion. Shipyards provide different naval strategies and bonus tracks.
      </Text>

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

      {/* Player Shipyard Assignments */}
      {players.map((player, index) => (
        <View key={player.id} style={{ marginBottom: 16 }}>
          <Text style={{ 
            color: '#F3E7D3', 
            fontSize: 16, 
            fontWeight: 'bold',
            marginBottom: 8,
          }}>
            {index + 1}. {player.name}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SHIPYARDS_DATABASE.map((shipyard) => {
              const isSelected = (selectedShipyards[player.id] || wonders[player.id]?.shipyardId) === shipyard.id;
              
              return (
                <Pressable
                  key={shipyard.id}
                  onPress={() => handleShipyardSelect(player.id, shipyard.id)}
                  style={{
                    flex: 1,
                    backgroundColor: isSelected ? '#C4A24C' : 'rgba(196, 162, 76, 0.2)',
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#C4A24C' : 'rgba(196, 162, 76, 0.4)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: isSelected ? '#1C1A1A' : '#C4A24C',
                    fontSize: 12,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}>
                    {shipyard.name}
                  </Text>
                  <Text style={{
                    color: isSelected ? 'rgba(28, 26, 26, 0.7)' : 'rgba(196, 162, 76, 0.7)',
                    fontSize: 10,
                    textAlign: 'center',
                  }}>
                    {shipyard.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

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