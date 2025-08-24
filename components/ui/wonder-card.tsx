// components/ui/wonder-card.tsx - Fixed flipping and side state management
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated,
{
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
  const [currentSide, setCurrentSide] = useState(selectedSide);
  const flipRotation = useSharedValue(selectedSide === 'night' ? 180 : 0);
  const scale = useSharedValue(1);

  // Initialize flip rotation based on selected side
  useEffect(() => {
    setCurrentSide(selectedSide);
    flipRotation.value = selectedSide === 'night' ? 180 : 0;
  }, [selectedSide, flipRotation]); // Added flipRotation to dependencies

  useEffect(() => {
    // Your flip animation logic
  }, [flipRotation]);

  const handleFlip = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    const newSide = currentSide === 'day' ? 'night' : 'day';
    const targetRotation = newSide === 'night' ? 180 : 0;

    flipRotation.value = withTiming(targetRotation, { duration: 600 }, () => {
      runOnJS(setIsFlipping)(false);
    });

    // Update internal state and notify parent immediately
    setCurrentSide(newSide);
    onSideChange(newSide);
  };

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
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (onSelect) {
      onSelect();
    }
  };

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
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            },
            frontAnimatedStyle,
          ]}
        >
          <WonderCardSide
            wonder={wonder}
            side={wonder.daySide}
            sideType="day"
            isSelected={isSelected}
          />
        </Animated.View>

        {/* Night Side (Back) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            },
            backAnimatedStyle,
          ]}
        >
          <WonderCardSide
            wonder={wonder}
            side={wonder.nightSide}
            sideType="night"
            isSelected={isSelected}
          />
        </Animated.View>
      </Pressable>

      {/* Flip Button - Enhanced with better state indication */}
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
          }}
        >
          <Text style={{
            color: '#1C1A1A',
            fontWeight: 'bold',
            fontSize: 14,
            marginRight: 8,
          }}>
            {isFlipping ? 'Flipping...' : `Flip to ${currentSide === 'day' ? 'Night' : 'Day'}`}
          </Text>
          <Text style={{ fontSize: 18 }}>
            {currentSide === 'day' ? '🌙' : '☀️'}
          </Text>
        </Pressable>

      </View>

      {/* Selection Indicator */}
      {isSelected && (
        <View style={{
          position: 'absolute',
          top: -10,
          right: 10,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: '#22C55E',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: '#1C1A1A',
        }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

interface WonderCardSideProps {
  wonder: Wonder;
  side: WonderSide;
  sideType: 'day' | 'night';
  isSelected: boolean;
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
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: isDayMode ? '#8B4513' : '#E6E6FA',
          marginBottom: 6,
        }}>
          Wonder Stages ({side.stages.length})
        </Text>

        {side.stages.map((stage, index) => (
          <WonderStageItem
            key={index}
            stage={stage}
            stageNumber={index + 1}
            isDayMode={isDayMode}
          />
        ))}
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
          <Text style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: isDayMode ? '#DAA520' : '#9370DB',
          }}>
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
      }}>
        <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
          {stageNumber}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 9,
          color: isDayMode ? '#8B4513' : '#E6E6FA',
        }}>
          Cost: {stage.cost.map(c => `${c.amount} ${c.resource}`).join(', ')}
        </Text>
        <Text style={{
          fontSize: 8,
          color: isDayMode ? '#DAA520' : '#9370DB',
          fontWeight: 'bold',
        }}>
          {stage.effect.description}
        </Text>
      </View>
    </View>
  );
}