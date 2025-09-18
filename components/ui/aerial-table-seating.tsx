// components/ui/aerial-table-seating.tsx - Enhanced with modes and fixed centering
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextProps,
  type TextStyle
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TABLE_SIZE = Math.min(width - 80, 320);
const PLAYER_SIZE = 48;

type PProps = TextProps & { className?: string };
type TableMode = 'age1' | 'age2' | 'age3' | 'military' | 'leaders' | 'navy';

interface TableModeConfig {
  theme: string;
  backgroundColor: string;
  borderColor: string;
  centerColor: string;
  arrowColor: string;
  direction: 'clockwise' | 'counterclockwise' | 'neighbors' | 'all';
  title: string;
  description: string;
}

const TABLE_MODES: Record<TableMode, TableModeConfig> = {
  age1: {
    theme: '#CD7F32',
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    borderColor: 'rgba(205, 127, 50, 0.5)',
    centerColor: 'rgba(205, 127, 50, 0.6)',
    arrowColor: '#CD7F32',
    direction: 'clockwise',
    title: 'Age I',
    description: 'Bronze Age • Clockwise card passing'
  },
  age2: {
    theme: '#C0C0C0',
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    borderColor: 'rgba(192, 192, 192, 0.5)',
    centerColor: 'rgba(192, 192, 192, 0.6)',
    arrowColor: '#C0C0C0',
    direction: 'counterclockwise',
    title: 'Age II',
    description: 'Silver Age • Counterclockwise card passing'
  },
  age3: {
    theme: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.5)',
    centerColor: 'rgba(255, 215, 0, 0.6)',
    arrowColor: '#FFD700',
    direction: 'clockwise',
    title: 'Age III',
    description: 'Golden Age • Clockwise card passing'
  },
  military: {
    theme: '#DC143C',
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    borderColor: 'rgba(220, 20, 60, 0.5)',
    centerColor: 'rgba(220, 20, 60, 0.6)',
    arrowColor: '#DC143C',
    direction: 'neighbors',
    title: 'Military Conflicts',
    description: 'Combat with immediate neighbors'
  },
  leaders: {
    theme: '#F5F5DC',
    backgroundColor: 'rgba(245, 245, 220, 0.2)',
    borderColor: 'rgba(245, 245, 220, 0.5)',
    centerColor: 'rgba(245, 245, 220, 0.6)',
    // Brighter arrow color for Leaders for better visibility
    arrowColor: '#FFF4C2',
    direction: 'counterclockwise',
    title: 'Leaders Selection',
    description: 'Leader drafting • Counterclockwise passing'
  },
  navy: {
    theme: '#000080',
    backgroundColor: 'rgba(0, 0, 128, 0.2)',
    borderColor: 'rgba(0, 0, 128, 0.5)',
    centerColor: 'rgba(0, 0, 128, 0.6)',
    arrowColor: '#414188ff',
    direction: 'all',
    title: 'Navy Conflicts',
    description: 'Naval combat with all players'
  }
};

interface TableModeSelectorProps {
  currentMode: TableMode;
  onModeChange: (mode: TableMode) => void;
  expansions: { leaders: boolean; armada: boolean; cities: boolean; edifice: boolean };
}

export function TableModeSelector({ currentMode, onModeChange, expansions }: TableModeSelectorProps) {
  const availableModes: TableMode[] = ['age1', 'age2', 'age3', 'military'];
  
  if (expansions.leaders) availableModes.push('leaders');
  if (expansions.armada) availableModes.push('navy');

  return (
    <Card>
      <H2>Table View Mode</H2>
      <P className="mb-3 text-parchment/70 text-sm">
        Select a game phase to visualize turn order and conflicts
      </P>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
          {availableModes.map((mode) => {
            const config = TABLE_MODES[mode];
            const isActive = currentMode === mode;
            
            return (
              <Pressable
                key={mode}
                onPress={() => onModeChange(mode)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: isActive ? config.backgroundColor : 'rgba(243, 231, 211, 0.1)',
                  borderWidth: 1.5,
                  borderColor: isActive ? config.borderColor : 'rgba(243, 231, 211, 0.2)',
                  minWidth: 100,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: isActive ? config.theme : 'rgba(243, 231, 211, 0.8)',
                  fontSize: 13,
                  fontWeight: 'bold',
                  marginBottom: 2,
                }}>
                  {config.title}
                </Text>
                <Text style={{
                  color: isActive ? config.theme : 'rgba(243, 231, 211, 0.6)',
                  fontSize: 9,
                  textAlign: 'center',
                  lineHeight: 12,
                }}>
                  {config.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      
      {(currentMode === 'military' || currentMode === 'navy') && (
        <View style={{
          backgroundColor: 'rgba(243, 231, 211, 0.05)',
          borderRadius: 8,
          padding: 10,
          marginTop: 8,
          borderLeftWidth: 3,
          borderLeftColor: TABLE_MODES[currentMode].theme,
        }}>
          <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11, lineHeight: 15 }}>
            Note: Visualization excludes diplomacy tokens, military boarding, and navy diplomacy effects. 
            See game rules for adjustments when these are applied during play.
          </Text>
        </View>
      )}
    </Card>
  );
}

interface AerialTableViewProps {
  playerIds: string[];
  getPlayerName: (id: string) => string;
  selectedPlayer: string | null;
  onPlayerSelect: (playerId: string) => void;
  mode: TableMode;
  disabled?: boolean;
}

export function AerialTableView({ 
  playerIds, 
  getPlayerName, 
  selectedPlayer,
  onPlayerSelect,
  mode,
  disabled = false
}: AerialTableViewProps) {
  const config = TABLE_MODES[mode];
  // Brighter center title text specifically for Leaders mode
  const centerTitleColor = mode === 'leaders' ? '#FFF8DC' : config.theme;
  
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    const radius = (TABLE_SIZE - PLAYER_SIZE - 16) / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y, angle };
  };

  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      {/* Table Surface - Themed */}
      <View style={{
        width: TABLE_SIZE,
        height: TABLE_SIZE,
        borderRadius: TABLE_SIZE / 2,
        backgroundColor: config.backgroundColor,
        borderWidth: 4,
        borderColor: config.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        shadowColor: config.theme,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
      }}>
        {/* Outer decorative ring */}
        <View style={{
          position: 'absolute',
          width: TABLE_SIZE - 16,
          height: TABLE_SIZE - 16,
          borderRadius: (TABLE_SIZE - 16) / 2,
          borderWidth: 2,
          borderColor: config.borderColor,
          opacity: 0.6,
        }} />

        {/* Inner decorative ring */}
        <View style={{
          position: 'absolute',
          width: TABLE_SIZE - 40,
          height: TABLE_SIZE - 40,
          borderRadius: (TABLE_SIZE - 40) / 2,
          borderWidth: 1,
          borderColor: config.borderColor,
          opacity: 0.4,
        }} />

        {/* Directional Arrows */}
        <DirectionalArrows2 
          playerCount={playerIds.length}
          mode={mode}
          config={config}
          tableSize={TABLE_SIZE}
        />

        {/* Players around the table */}
        {playerIds.map((playerId, index) => {
          const position = getPlayerPosition(index, playerIds.length);
          const isSelected = selectedPlayer === playerId;
          
          return (
            <PlayerSeat
              key={playerId}
              playerId={playerId}
              playerName={getPlayerName(playerId)}
              position={position}
              seatNumber={index + 1}
              isSelected={isSelected}
              onPress={() => !disabled && onPlayerSelect(playerId)}
              theme={config.theme}
            />
          );
        })}
      </View>

      {/* Mode Legend */}
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{
            width: 10,
            height: 10,
            backgroundColor: config.theme,
            borderRadius: 5,
            marginRight: 8,
          }} />
          <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 13 }}>
            {config.description}
          </Text>
        </View>
        <Text style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 11, textAlign: 'center' }}>
          Seating order shown around table. Use controls below to adjust.
        </Text>
      </View>
    </View>
  );
}

interface DirectionalArrowsProps {
  playerCount: number;
  mode: TableMode;
  config: TableModeConfig;
  tableSize: number;
}

// New, clearer arrows closer to table center
function DirectionalArrows2({ playerCount, mode, config, tableSize }: DirectionalArrowsProps) {
  const getArrowPosition = (index: number, total: number, radius: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Base arrow radius; tune per mode to sit closer to center
  let arrowRadius = Math.max(20, (tableSize - 150) / 2);
  // For seating directions (Ages I–III and Leaders), bring arrows slightly more inward
  if (config.direction === 'clockwise' || config.direction === 'counterclockwise') {
    arrowRadius = Math.max(20, (tableSize - 180) / 2);
  }
  // For military neighbors, bring arrows a touch inward as well
  if (config.direction === 'neighbors') {
    arrowRadius = Math.max(20, (tableSize - 170) / 2);
  }
  // For navy (all), also nudge inward
  if (config.direction === 'all') {
    arrowRadius = Math.max(20, (tableSize - 170) / 2);
  }

  // Simple high-contrast arrow made of a shaft and a triangular head
  const ArrowGraphic = ({ color, length = 28, thickness = 3, headSize = 8 }: { color: string; length?: number; thickness?: number; headSize?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: Math.max(4, length - headSize - 2), height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
      <View style={{
        width: 0,
        height: 0,
        borderTopWidth: headSize,
        borderBottomWidth: headSize,
        borderLeftWidth: Math.floor(headSize * 1.4),
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
        marginLeft: 2,
      }} />
    </View>
  );

  if (config.direction === 'clockwise' || config.direction === 'counterclockwise') {
    const isClockwise = config.direction === 'clockwise';
    return (
      <>
        {Array.from({ length: playerCount }).map((_, index) => {
          const position = getArrowPosition(index, playerCount, arrowRadius);
          const rotation = (position.angle * 180 / Math.PI) + (isClockwise ? 90 : -90);
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: `${rotation}deg` }
                ]
              }}
            >
              <ArrowGraphic color={config.arrowColor} length={30} thickness={4} headSize={9} />
            </View>
          );
        })}
      </>
    );
  }

  if (config.direction === 'neighbors') {
    // Match Navy’s anchoring pattern: place each arrow along the chord
    // from a seat to its neighbor, rotated to face the neighbor.
    const t = 0.25; // how far from the seat toward the neighbor (0 = at seat, 0.5 = midpoint)
    const ARROW_LEN = 24; // shorter than before to reduce intersections
    const ARROW_THICK = 3;
    const ARROW_HEAD = 8;

    return (
      <>
        {Array.from({ length: playerCount }).map((_, index) => {
          const fromPos = getArrowPosition(index, playerCount, arrowRadius);

          const leftIndex = (index - 1 + playerCount) % playerCount;
          const rightIndex = (index + 1) % playerCount;

          const leftPos = getArrowPosition(leftIndex, playerCount, arrowRadius);
          const rightPos = getArrowPosition(rightIndex, playerCount, arrowRadius);

          const renderArrow = (toPos: { x: number; y: number }) => {
            const angleDeg =
              (Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * 180) / Math.PI;

            // Anchor exactly like Navy: position the arrow somewhere along the line from fromPos → toPos
            const anchorX = fromPos.x + (toPos.x - fromPos.x) * t;
            const anchorY = fromPos.y + (toPos.y - fromPos.y) * t;

            return (
              <View
                key={`${index}-${toPos.x}-${toPos.y}`}
                style={{
                  position: 'absolute',
                  transform: [
                    { translateX: anchorX },
                    { translateY: anchorY },
                    { rotate: `${angleDeg}deg` },
                  ],
                }}
              >
                <ArrowGraphic color={config.arrowColor} length={ARROW_LEN} thickness={ARROW_THICK} headSize={ARROW_HEAD} />
              </View>
            );
          };

          return (
            <React.Fragment key={index}>
              {renderArrow(leftPos)}
              {renderArrow(rightPos)}
            </React.Fragment>
          );
        })}
      </>
    );
  }

  if (config.direction === 'all') {
    return (
      <>
        {Array.from({ length: playerCount }).map((_, fromIndex) => {
          return Array.from({ length: playerCount }).map((_, toIndex) => {
            if (fromIndex === toIndex) return null;
            const fromPos = getArrowPosition(fromIndex, playerCount, arrowRadius);
            const toPos = getArrowPosition(toIndex, playerCount, arrowRadius);
            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * 180 / Math.PI;
            return (
              <View
                key={`${fromIndex}-${toIndex}`}
                style={{
                  position: 'absolute',
                  transform: [
                    { translateX: fromPos.x + (toPos.x - fromPos.x) * 0.3 },
                    { translateY: fromPos.y + (toPos.y - fromPos.y) * 0.3 },
                    { rotate: `${angle}deg` }
                  ],
                  opacity: 0.6,
                }}
              >
                <ArrowGraphic color={config.arrowColor} length={22} thickness={2} headSize={7} />
              </View>
            );
          });
        })}
      </>
    );
  }
  return null;
}

interface PlayerSeatProps {
  playerId: string;
  playerName: string;
  position: { x: number; y: number; angle: number };
  seatNumber: number;
  isSelected: boolean;
  onPress: () => void;
  theme: string;
}

function PlayerSeat({ 
  playerName, 
  position, 
  seatNumber, 
  isSelected, 
  onPress,
  theme
}: PlayerSeatProps) {
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(isSelected ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.2 + (glowIntensity.value * 0.3),
    shadowRadius: 3 + (glowIntensity.value * 6),
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      glowIntensity.value,
      [0, 1],
      ['#135C66', theme]
    ),
  }));

  useEffect(() => {
    glowIntensity.value = withTiming(isSelected ? 1 : 0, { duration: 250 });
    scale.value = withSpring(isSelected ? 1.1 : 1);
  }, [isSelected, glowIntensity, scale]);

  return (
    <View
      style={{
        position: 'absolute',
        alignItems: 'center',
        transform: [
          { translateX: position.x },
          { translateY: position.y }
        ]
      }}
    >
      {/* Disable tap/pop-up: render static view instead of Pressable */}
      <Animated.View style={[{
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        borderRadius: PLAYER_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: isSelected ? '#1C1A1A' : theme,
        shadowColor: isSelected ? theme : '#000',
        shadowOffset: { width: 0, height: 3 },
        elevation: isSelected ? 6 : 3,
      }, animatedStyle, backgroundStyle]}>
        <Text style={{ 
          color: isSelected ? '#1C1A1A' : theme, 
          fontWeight: 'bold', 
          fontSize: 18 
        }}>
          {playerName.charAt(0).toUpperCase()}
        </Text>
      </Animated.View>
      
      <Text style={{
        color: isSelected ? theme : '#F3E7D3',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
        maxWidth: 60,
        fontWeight: isSelected ? 'bold' : '600',
      }} numberOfLines={1}>
        {playerName}
      </Text>
      
      <View style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: isSelected ? theme : `${theme}CC`,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
        borderWidth: 1,
        borderColor: isSelected ? '#1C1A1A' : theme,
      }}>
        <Text style={{ 
          color: '#1C1A1A', 
          fontSize: 9, 
          fontWeight: 'bold' 
        }}>
          {seatNumber}
        </Text>
      </View>
    </View>
  );
}

interface PlayerDetailsModalProps {
  visible: boolean;
  player: { id: string; name: string } | null;
  position: number;
  neighbors: { left: string; right: string };
  onClose: () => void;
}

export function PlayerDetailsModal({ 
  visible,
  player, 
  position, 
  neighbors, 
  onClose 
}: PlayerDetailsModalProps) {
  if (!visible || !player) return null;

  const playerStats = {
    gamesPlayed: Math.floor(Math.random() * 20) + 1,
    averageScore: Math.floor(Math.random() * 30) + 45,
    favoriteStrategy: ['Military', 'Science', 'Commerce', 'Civic'][Math.floor(Math.random() * 4)],
    winRate: Math.floor(Math.random() * 40) + 30,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
      }}>
        <Pressable 
          style={{ flex: 1 }} 
          onPress={onClose}
        />
        
        <View style={{
          backgroundColor: '#1C1A1A',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: Platform.OS === 'ios' ? 34 : 24,
          borderWidth: 2,
          borderColor: 'rgba(196, 162, 76, 0.3)',
          maxHeight: '75%',
          minHeight: 300,
        }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#C4A24C',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ color: '#1C1A1A', fontSize: 20, fontWeight: 'bold' }}>
                  {player.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F3E7D3', fontSize: 20, fontWeight: 'bold' }}>
                  {player.name}
                </Text>
                <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 14 }}>
                  Seat Position {position}
                </Text>
              </View>
              
              <Pressable
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(243, 231, 211, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#F3E7D3', fontSize: 18, fontWeight: 'bold' }}>×</Text>
              </Pressable>
            </View>

            <View style={{
              backgroundColor: 'rgba(19, 92, 102, 0.3)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                Trading Partners
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>Left Neighbor</Text>
                  <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
                    ← {neighbors.left}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12, marginBottom: 4 }}>Right Neighbor</Text>
                  <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
                    {neighbors.right} →
                  </Text>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: 'rgba(196, 162, 76, 0.1)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                Player Statistics
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                <StatItem label="Games Played" value={playerStats.gamesPlayed.toString()} />
                <StatItem label="Avg Score" value={playerStats.averageScore.toString()} />
                <StatItem label="Win Rate" value={`${playerStats.winRate}%`} />
                <StatItem label="Favorite" value={playerStats.favoriteStrategy} />
              </View>
            </View>

            <View style={{
              backgroundColor: 'rgba(139, 69, 19, 0.2)',
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#C4A24C',
            }}>
              <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
                Strategy Notes
              </Text>
              <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12, lineHeight: 16 }}>
                Based on previous games, {player.name} tends to favor {playerStats.favoriteStrategy.toLowerCase()} strategies. 
                Trading with {neighbors.left} and {neighbors.right} will be key to their success this game.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 65 }}>
      <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold' }}>
        {value}
      </Text>
      <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 10, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

export function SeatingStats({ playerIds, getPlayerName }: {
  playerIds: string[];
  getPlayerName: (id: string) => string;
}) {
  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Table Analysis
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#C4A24C', fontSize: 20, fontWeight: 'bold' }}>
            {playerIds.length}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
            Players
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#C4A24C', fontSize: 20, fontWeight: 'bold' }}>
            {playerIds.length * 2}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
            Trade Routes
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#C4A24C', fontSize: 20, fontWeight: 'bold' }}>
            {playerIds.length}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
            Military Conflicts
          </Text>
        </View>
      </View>
    </View>
  );
}

export function SeatingControls({ 
  onRandomize, 
  onOptimalSeating 
}: {
  onRandomize: () => void;
  onOptimalSeating: () => void;
}) {
  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Seating Options
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onRandomize}
          style={{
            flex: 1,
            backgroundColor: 'rgba(196, 162, 76, 0.2)',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: 'rgba(196, 162, 76, 0.4)',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
            Randomize
          </Text>
        </Pressable>
        
        <Pressable
          onPress={onOptimalSeating}
          style={{
            flex: 1,
            backgroundColor: 'rgba(196, 162, 76, 0.2)',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: 'rgba(196, 162, 76, 0.4)',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#C4A24C', fontSize: 14, fontWeight: 'bold' }}>
            Smart Seating
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface DragDropPlayerListProps {
  playerIds: string[];
  getPlayerName: (id: string) => string;
  getNeighbors: (id: string) => { left: string; right: string };
  onReorder: (newOrder: string[]) => void;
  disabled?: boolean;
}

export function DragDropPlayerList({ 
  playerIds, 
  getPlayerName, 
  getNeighbors, 
  onReorder,
  disabled = false
}: DragDropPlayerListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const movePlayer = (fromIndex: number, toIndex: number) => {
    if (disabled || fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= playerIds.length || toIndex >= playerIds.length) return;
    
    const newOrder = [...playerIds];
    const [movedPlayer] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedPlayer);
    onReorder(newOrder);
  };

  if (disabled) {
    return (
      <View style={{ gap: 6, opacity: 0.5 }}>
        {playerIds.map((playerId, index) => {
          const neighbors = getNeighbors(playerId);
          
          return (
            <View
              key={playerId}
              style={{
                backgroundColor: 'rgba(19, 92, 102, 0.3)',
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(243, 231, 211, 0.1)',
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
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
                    {index + 1}
                  </Text>
                </View>
                
                <View>
                  <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold' }}>
                    {getPlayerName(playerId)}
                  </Text>
                  <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
                    ← {neighbors.left} • {neighbors.right} →
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ gap: 6 }}>
        {playerIds.map((playerId, index) => {
          const neighbors = getNeighbors(playerId);
          const isDragging = draggedIndex === index;
          const isHovering = hoverIndex === index && draggedIndex !== index;
          
          return (
            <DragDropPlayerItem2
              key={`${playerId}-${index}`}
              playerId={playerId}
              playerName={getPlayerName(playerId)}
              position={index + 1}
              neighbors={neighbors}
              isDragging={isDragging}
              isHovering={isHovering}
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={(finalIndex) => {
                if (finalIndex !== null && finalIndex !== index) {
                  movePlayer(index, finalIndex);
                }
                setDraggedIndex(null);
                setHoverIndex(null);
              }}
              onHover={(newHoverIndex) => setHoverIndex(newHoverIndex)}
              currentIndex={index}
              totalItems={playerIds.length}
              onMoveUp={() => movePlayer(index, index - 1)}
              onMoveDown={() => movePlayer(index, index + 1)}
            />
          );
        })}
      </View>
    </GestureHandlerRootView>
  );
}

// Import missing components
function Card({ children, ...props }: any) {
  return (
    <View style={{
      backgroundColor: 'rgba(243, 231, 211, 0.05)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }} {...props}>
      {children}
    </View>
  );
}

function H2({ children, ...props }: any) {
  return (
    <Text style={{
      fontSize: 24,
      fontWeight: 'bold',
      color: '#F3E7D3',
      marginBottom: 12,
    }} {...props}>
      {children}
    </Text>
  );
}

function P({ children, className, style, ...props }: PProps) {
  const baseStyle: TextStyle = {
    fontSize: 16,
    color: '#F3E7D3',
    lineHeight: 24,
  };

  const additionalStyle: Partial<TextStyle> = {};
  if (className?.includes('mb-4')) additionalStyle.marginBottom = 16;
  if (className?.includes('mb-3')) additionalStyle.marginBottom = 12;
  if (className?.includes('text-parchment/70')) additionalStyle.color = 'rgba(243, 231, 211, 0.7)';
  if (className?.includes('text-sm')) additionalStyle.fontSize = 14;

  return (
    <Text style={[baseStyle, additionalStyle, style]} {...props}>
      {children}
    </Text>
  );
}

// New item with explicit Up/Down controls and clean neighbor text
function DragDropPlayerItem2({ 
  playerId,
  playerName, 
  position, 
  neighbors, 
  isDragging,
  isHovering,
  onDragStart,
  onDragEnd,
  onHover,
  currentIndex,
  totalItems,
  onMoveUp,
  onMoveDown,
}: {
  playerId: string;
  playerName: string;
  position: number;
  neighbors: { left: string; right: string };
  isDragging: boolean;
  isHovering: boolean;
  onDragStart: () => void;
  onDragEnd: (finalIndex: number | null) => void;
  onHover: (index: number | null) => void;
  currentIndex: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const spacerHeight = useSharedValue(0);

  const ITEM_HEIGHT = 80;

  React.useEffect(() => {
    spacerHeight.value = withSpring(isHovering ? ITEM_HEIGHT : 0);
  }, [isHovering, spacerHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    zIndex: isDragging ? 1000 : 1,
  }));

  const spacerStyle = useAnimatedStyle(() => ({
    height: spacerHeight.value,
  }));

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onDragStart)();
      scale.value = withSpring(1.05);
      opacity.value = withTiming(0.9);
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      const moveAmount = Math.round(event.translationY / ITEM_HEIGHT);
      const newHoverIndex = currentIndex + moveAmount;
      if (newHoverIndex >= 0 && newHoverIndex < totalItems && newHoverIndex !== currentIndex) {
        runOnJS(onHover)(newHoverIndex);
      } else {
        runOnJS(onHover)(null);
      }
    })
    .onEnd((event) => {
      const moveAmount = Math.round(event.translationY / ITEM_HEIGHT);
      const finalIndex = currentIndex + moveAmount;
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
      if (finalIndex >= 0 && finalIndex < totalItems && finalIndex !== currentIndex) {
        runOnJS(onDragEnd)(finalIndex);
      } else {
        runOnJS(onDragEnd)(null);
      }
    });

  const canUp = currentIndex > 0;
  const canDown = currentIndex < totalItems - 1;

  const ControlButton = ({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        backgroundColor: 'rgba(196, 162, 76, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(196, 162, 76, 0.4)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
    </Pressable>
  );

  return (
    <>
      <Animated.View style={spacerStyle} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{
          backgroundColor: isDragging ? 'rgba(19, 92, 102, 0.5)' : 'rgba(19, 92, 102, 0.3)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 6,
          borderWidth: 1,
          borderColor: isDragging ? 'rgba(196, 162, 76, 0.6)' : 'rgba(243, 231, 211, 0.1)',
          minHeight: ITEM_HEIGHT,
        }, animatedStyle]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Drag handle */}
            <View style={{
              backgroundColor: isDragging ? 'rgba(196, 162, 76, 0.4)' : 'rgba(196, 162, 76, 0.2)',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 12,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 28,
            }}>
              <Text style={{ color: isDragging ? '#C4A24C' : 'rgba(196, 162, 76, 0.8)', fontSize: 14 }}>::</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#C4A24C',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ color: '#1C1A1A', fontSize: 13, fontWeight: 'bold' }}>{position}</Text>
                </View>
                <Text style={{ color: isDragging ? '#C4A24C' : '#F3E7D3', fontSize: 16, fontWeight: 'bold' }}>{playerName}</Text>
              </View>
              <View style={{ marginLeft: 38 }}>
                <Text style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 10, marginBottom: 1 }}>Trading Partners:</Text>
                <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11 }}>
                  Left: {neighbors.left} | Right: {neighbors.right}
                </Text>
              </View>
            </View>

            {/* Up/Down controls */}
            <View style={{ gap: 6, marginLeft: 12 }}>
              <ControlButton label="^" onPress={onMoveUp} disabled={!canUp} />
              <ControlButton label="v" onPress={onMoveDown} disabled={!canDown} />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}
