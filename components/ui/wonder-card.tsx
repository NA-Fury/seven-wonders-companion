// components/ui/wonder-card.tsx - Fixed flipping and side state management
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Wonder, WonderSide, WonderStage } from '../../data/wondersDatabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 80, 280);
const CARD_HEIGHT = CARD_WIDTH * 1.3;

interface WonderCardProps {
  wonder: Wonder;
  selectedSide: 'day' | 'night';
  onSideChange: (side: 'day' | 'night') => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function WonderCard({
  wonder,
  selectedSide,
  onSideChange,
  isSelected = false,
  onSelect
}: WonderCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displaySide, setDisplaySide] = useState<'day' | 'night'>(selectedSide);
  const flipRotation = useSharedValue(selectedSide === 'night' ? 180 : 0);
  const scale = useSharedValue(1);

  const onFlipComplete = useCallback(
    (newSide: 'day' | 'night') => {
      setIsFlipping(false);
      setDisplaySide(newSide);
      onSideChange(newSide);
    },
    [onSideChange]
  );

  // Sync display side when the selected card changes
  useEffect(() => {
    if (isSelected && !isFlipping && displaySide !== selectedSide) {
      setDisplaySide(selectedSide);
      flipRotation.value = selectedSide === 'night' ? 180 : 0;
    }
  }, [selectedSide, isSelected, isFlipping, displaySide, flipRotation]);

  const handleFlip = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    const newSide = displaySide === 'day' ? 'night' : 'day';
    const targetRotation = newSide === 'night' ? 180 : 0;

    flipRotation.value = withTiming(targetRotation, { duration: 600 }, finished => {
      if (finished) {
        runOnJS(onFlipComplete)(newSide);
      }
    });
  }, [displaySide, isFlipping, flipRotation, onFlipComplete]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(flipRotation.value, [0, 90, 180], [1, 0, 0]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scale.value }
      ],
      opacity,
      position: 'absolute' as const,
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden' as const,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(flipRotation.value, [0, 90, 180], [0, 0, 1]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scale.value }
      ],
      opacity,
      position: 'absolute' as const,
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden' as const,
    };
  });

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.95, { duration: 150 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onSelect) {
      onSelect();
    }
  }, [onSelect]);

  return (
    <View style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT + 80,
      alignItems: 'center',
      marginBottom: 20,
    }}>
      {/* Card Container */}
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ position: 'relative', width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        {/* Day Side (Front) */}
        <Animated.View style={frontAnimatedStyle}>
          <WonderCardSide
            wonder={wonder}
            side={wonder.daySide}
            sideType="day"
            isSelected={isSelected}
          />
        </Animated.View>

        {/* Night Side (Back) */}
        <Animated.View style={backAnimatedStyle}>
          <WonderCardSide
            wonder={wonder}
            side={wonder.nightSide}
            sideType="night"
            isSelected={isSelected}
          />
        </Animated.View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#22C55E',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: '#1C1A1A',
            zIndex: 10,
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
          </View>
        )}
      </Pressable>

      {/* Flip Button */}
      <View style={{ marginTop: 12, alignItems: 'center' }}>
        <Pressable
          onPress={handleFlip}
          disabled={isFlipping}
          style={{
            backgroundColor: isFlipping ? 'rgba(196, 162, 76, 0.5)' : '#C4A24C',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#C4A24C',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            minWidth: 160,
            justifyContent: 'center',
            opacity: isFlipping ? 0.7 : 1,
          }}
        >
          <Text style={{
            color: '#1C1A1A',
            fontWeight: 'bold',
            fontSize: 14,
            marginRight: 8,
          }}>
            {isFlipping ? 'Flipping...' : `Flip to ${displaySide === 'day' ? 'Night' : 'Day'}`}
          </Text>
          <Text style={{ fontSize: 18 }}>
            {displaySide === 'day' ? '🌙' : '☀️'}
          </Text>
        </Pressable>
      </View>

      {/* Side Indicator */}
      <View style={{
        marginTop: 8,
        backgroundColor: displaySide === 'day' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(65, 105, 225, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: displaySide === 'day' ? '#FFA500' : '#4169E1',
      }}>
        <Text style={{
          color: displaySide === 'day' ? '#FFA500' : '#4169E1',
          fontSize: 12,
          fontWeight: 'bold',
        }}>
          {displaySide === 'day' ? '☀️ DAY SIDE' : '🌙 NIGHT SIDE'}
        </Text>
      </View>
    </View>
  );
}

interface WonderCardSideProps {
  wonder: Wonder;
  side: WonderSide;
  sideType: 'day' | 'night';
  isSelected: boolean;
}

function renderCost(cost: any) {
  if (Array.isArray(cost)) {
    return cost.map((c, i) => <Text key={i} style={{ color: '#F3E7D3' }}>{c}</Text>);
  }
  if (cost && typeof cost === 'object' && typeof cost.coins === 'number') {
    return <Text style={{ color: '#F3E7D3' }}>{cost.coins} coins</Text>;
  }
  return <Text style={{ color: '#9CA3AF' }}>—</Text>;
}

function WonderCardSide({ wonder, side, sideType, isSelected }: WonderCardSideProps) {
  const isDayMode = sideType === 'day';

  return (
    <View style={{
      width: '100%',
      height: '100%',
      borderRadius: 16,
      backgroundColor: isDayMode ? 'rgba(255, 248, 220, 0.95)' : 'rgba(25, 25, 112, 0.95)',
      borderWidth: 3,
      borderColor: isSelected ? '#22C55E' : (isDayMode ? '#C4A24C' : '#6366F1'),
      padding: 12,
      shadowColor: isDayMode ? '#C4A24C' : '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 12,
    }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          backgroundColor: isDayMode ? '#C4A24C' : '#6366F1',
          borderRadius: 16,
          paddingHorizontal: 10,
          paddingVertical: 3,
          marginBottom: 6,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold'
          }}>
            {isDayMode ? '☀️ DAY SIDE' : '🌙 NIGHT SIDE'}
          </Text>
        </View>

        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDayMode ? '#8B4513' : '#E6E6FA',
          textAlign: 'center',
          marginBottom: 3,
        }}>
          {wonder.name}
        </Text>

        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: isDayMode ? '#DAA520' : '#9370DB',
          textAlign: 'center',
        }}>
          {side.name}
        </Text>
      </View>

      {/* Resource & Difficulty */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <View style={{
          backgroundColor: isDayMode ? 'rgba(139, 69, 19, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          borderRadius: 6,
          padding: 6,
          flex: 1,
          marginRight: 4,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 9,
            color: isDayMode ? '#8B4513' : '#E6E6FA',
            marginBottom: 1,
          }}>
            Resource
          </Text>
          <Text style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: isDayMode ? '#DAA520' : '#9370DB',
          }}>
            {wonder.resource}
          </Text>
        </View>

        <View style={{
          backgroundColor: isDayMode ? 'rgba(139, 69, 19, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          borderRadius: 6,
          padding: 6,
          flex: 1,
          marginLeft: 4,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 9,
            color: isDayMode ? '#8B4513' : '#E6E6FA',
            marginBottom: 1,
          }}>
            Difficulty
          </Text>
          <Text style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: isDayMode ? '#DAA520' : '#9370DB',
          }}>
            {wonder.difficulty}
          </Text>
        </View>
      </View>

      {/* Wonder Stages */}
      <View style={{ flex: 1, maxHeight: 120 }}>
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: isDayMode ? '#8B4513' : '#E6E6FA',
          marginBottom: 6,
        }}>
          Wonder Stages ({side.stages.length})
        </Text>

        <View style={{ flex: 1 }}>
          {side.stages.slice(0, 3).map((stage, index) => (
            <WonderStageItem
              key={index}
              stage={stage}
              stageNumber={index + 1}
              isDayMode={isDayMode}
            />
          ))}
          {side.stages.length > 3 && (
            <Text style={{
              fontSize: 8,
              color: isDayMode ? 'rgba(139, 69, 19, 0.7)' : 'rgba(230, 230, 250, 0.7)',
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 2,
            }}>
              +{side.stages.length - 3} more stage{side.stages.length - 3 > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Special Ability */}
      {side.specialAbility && (
        <View style={{
          backgroundColor: isDayMode ? 'rgba(218, 165, 32, 0.2)' : 'rgba(147, 112, 219, 0.2)',
          borderRadius: 6,
          padding: 6,
          marginTop: 6,
        }}>
          <Text style={{
            fontSize: 9,
            color: isDayMode ? '#8B4513' : '#E6E6FA',
            marginBottom: 1,
          }}>
            Special Ability
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: isDayMode ? '#DAA520' : '#9370DB',
            }}
            numberOfLines={2}
          >
            {side.specialAbility}
          </Text>
        </View>
      )}
    </View>
  );
}

interface WonderStageItemProps {
  stage: WonderStage;
  stageNumber: number;
  isDayMode: boolean;
}

function WonderStageItem({ stage, stageNumber, isDayMode }: WonderStageItemProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDayMode ? 'rgba(139, 69, 19, 0.1)' : 'rgba(99, 102, 241, 0.1)',
      borderRadius: 4,
      padding: 4,
      marginBottom: 3,
    }}>
      <View style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: isDayMode ? '#C4A24C' : '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
        flexShrink: 0,
      }}>
        <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
          {stageNumber}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 9,
          color: isDayMode ? '#8B4513' : '#E6E6FA',
        }}
        numberOfLines={1}
      >
        Cost: {
          Array.isArray(stage.cost)
            ? stage.cost.map(c => `${c.amount} ${c.resource}`).join(', ')
            : (stage.cost && typeof stage.cost === 'object' && 'coins' in stage.cost
                ? `${stage.cost.coins} Coins`
                : '—')
        }
      </Text>
      <Text
        style={{
          fontSize: 8,
          color: isDayMode ? '#DAA520' : '#9370DB',
          fontWeight: 'bold',
        }}
        numberOfLines={2}
      >
        {stage.effect.description}
      </Text>
    </View>
  );
}