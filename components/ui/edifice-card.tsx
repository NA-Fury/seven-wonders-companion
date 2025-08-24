// components/ui/edifice-card.tsx
import React, { useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { EdificeProject, ResourceCost } from '../../data/edificeDatabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min((width - 60) / 2, 160);
const CARD_HEIGHT = CARD_WIDTH * 1.6;

interface EdificeProjectCardProps {
  project: EdificeProject;
  isSelected?: boolean;
  onSelect?: () => void;
  showCost?: boolean;
}

export function EdificeProjectCard({ 
  project, 
  isSelected = false, 
  onSelect,
  showCost = true 
}: EdificeProjectCardProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(isSelected ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundColor.value,
      [0, 1],
      ['rgba(19, 92, 102, 0.3)', 'rgba(34, 197, 94, 0.3)']
    ),
  }));

  useEffect(() => {
    backgroundColor.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    scale.value = withSpring(isSelected ? 1.05 : 1);
  }, [isSelected, backgroundColor, scale]);

  const handlePress = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const getAgeColor = (age: number) => {
    switch (age) {
      case 1: return '#8B4513'; // Brown for Age 1
      case 2: return '#C0C0C0'; // Silver for Age 2 
      case 3: return '#FFD700'; // Gold for Age 3
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

  return (
    <Pressable onPress={handlePress} style={{ margin: 4 }}>
      <Animated.View style={[{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: isSelected ? '#22C55E' : 'rgba(243, 231, 211, 0.3)',
        padding: 8,
        shadowColor: getAgeColor(project.age),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
      }, animatedStyle]}>
        
        {/* Header */}
        <View style={{
          backgroundColor: getAgeColor(project.age),
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 3,
          marginBottom: 6,
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            AGE {project.age}
          </Text>
        </View>

        {/* Project Name */}
        <Text style={{
          color: '#F3E7D3',
          fontSize: 13,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 6,
          minHeight: 32,
        }} numberOfLines={2}>
          {project.name}
        </Text>

        {/* Strategic Value */}
        <View style={{
          backgroundColor: getStrategyColor(project.strategicValue),
          borderRadius: 4,
          paddingHorizontal: 4,
          paddingVertical: 2,
          marginBottom: 6,
          alignSelf: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
            {project.strategicValue.toUpperCase()}
          </Text>
        </View>

        {/* Cost */}
        {showCost && (
          <View style={{ marginBottom: 6 }}>
            <Text style={{ 
              color: 'rgba(243, 231, 211, 0.7)', 
              fontSize: 9, 
              marginBottom: 3,
              textAlign: 'center' 
            }}>
              Cost:
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
            }}>
              {project.cost.map((cost, index) => (
                <ResourceIcon key={index} cost={cost} />
              ))}
            </View>
          </View>
        )}

        {/* Effect Description */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{
            color: 'rgba(243, 231, 211, 0.9)',
            fontSize: 9,
            textAlign: 'center',
            lineHeight: 12,
          }} numberOfLines={4}>
            {project.effect.description}
          </Text>
        </View>

        {/* Points/Formula */}
        <View style={{
          backgroundColor: 'rgba(196, 162, 76, 0.3)',
          borderRadius: 4,
          paddingVertical: 3,
          paddingHorizontal: 4,
          marginTop: 4,
        }}>
          <Text style={{
            color: '#C4A24C',
            fontSize: 8,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {project.effect.pointsFormula || `${project.points} pts`}
          </Text>
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#22C55E',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#1C1A1A',
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

interface ResourceIconProps {
  cost: ResourceCost;
}

function ResourceIcon({ cost }: ResourceIconProps) {
  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'Wood': return '#8B4513';
      case 'Stone': return '#708090';
      case 'Clay': return '#CD853F';
      case 'Ore': return '#2F4F4F';
      case 'Glass': return '#00CED1';
      case 'Loom': return '#9370DB';
      case 'Papyrus': return '#F4A460';
      case 'Coin': return '#FFD700';
      default: return '#6B7280';
    }
  };

  const getResourceSymbol = (resource: string) => {
    switch (resource) {
      case 'Wood': return '🪵';
      case 'Stone': return '🗿';
      case 'Clay': return '🧱';
      case 'Ore': return '⛏️';
      case 'Glass': return '🔷';
      case 'Loom': return '🧵';
      case 'Papyrus': return '📜';
      case 'Coin': return '🪙';
      default: return '❓';
    }
  };

  return (
    <View style={{
      backgroundColor: getResourceColor(cost.resource),
      borderRadius: 8,
      paddingHorizontal: 3,
      paddingVertical: 1,
      minWidth: 16,
      alignItems: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 7, fontWeight: 'bold' }}>
        {cost.amount}
      </Text>
      <Text style={{ fontSize: 6 }}>
        {getResourceSymbol(cost.resource)}
      </Text>
    </View>
  );
}

interface EdificeProjectDetailProps {
  project: EdificeProject;
  onClose: () => void;
}

export function EdificeProjectDetail({ project, onClose }: EdificeProjectDetailProps) {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 26, 26, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.95)',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 20,
        maxWidth: 350,
        borderWidth: 2,
        borderColor: '#C4A24C',
      }}>
        <Text style={{
          color: '#C4A24C',
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {project.name}
        </Text>

        <Text style={{
          color: 'rgba(243, 231, 211, 0.8)',
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 16,
          lineHeight: 20,
        }}>
          {project.description}
        </Text>

        <View style={{
          backgroundColor: 'rgba(196, 162, 76, 0.2)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}>
          <Text style={{
            color: '#C4A24C',
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 8,
          }}>
            Effect ({project.effect.type}):
          </Text>
          <Text style={{
            color: '#F3E7D3',
            fontSize: 13,
            lineHeight: 18,
          }}>
            {project.effect.description}
          </Text>
          {project.effect.pointsFormula && (
            <Text style={{
              color: '#C4A24C',
              fontSize: 12,
              fontWeight: 'bold',
              marginTop: 4,
            }}>
              Points: {project.effect.pointsFormula}
            </Text>
          )}
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <View style={{
            backgroundColor: 'rgba(139, 69, 19, 0.3)',
            borderRadius: 8,
            padding: 8,
            flex: 1,
            marginRight: 8,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#F3E7D3', fontSize: 11, marginBottom: 2 }}>
              Strategic Value
            </Text>
            <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold' }}>
              {project.strategicValue}
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(139, 69, 19, 0.3)',
            borderRadius: 8,
            padding: 8,
            flex: 1,
            marginLeft: 8,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#F3E7D3', fontSize: 11, marginBottom: 2 }}>
              Complexity
            </Text>
            <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold' }}>
              {project.complexity}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onClose}
          style={{
            backgroundColor: '#C4A24C',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1C1A1A', fontSize: 16, fontWeight: 'bold' }}>
            Close
          </Text>
        </Pressable>
      </View>
    </View>
  );
}