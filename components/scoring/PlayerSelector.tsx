// components/scoring/PlayerSelector.tsx - Player selection carousel
import React, { memo, useRef } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  playerCard: {
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playerCardActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.borderStrong,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  playerNameActive: {
    color: theme.colors.textPrimary,
  },
  playerScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  playerScoreLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

interface Player {
  id: string;
  name: string;
}

interface PlayerSelectorProps {
  players: Player[];
  currentPlayerId: string | null;
  onPlayerSelect: (playerId: string) => void;
  scores: Record<string, number>;
}

export const PlayerSelector = memo(function PlayerSelector({
  players,
  currentPlayerId,
  onPlayerSelect,
  scores,
}: PlayerSelectorProps) {
  const listRef = useRef<FlatList>(null);
  
  const renderPlayer = ({ item }: { item: Player }) => {
    const isActive = item.id === currentPlayerId;
    const score = scores[item.id] || 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          isActive && styles.playerCardActive,
        ]}
        onPress={() => onPlayerSelect(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.playerName,
          isActive && styles.playerNameActive,
        ]}>
          {item.name}
        </Text>
        <Text style={styles.playerScore}>{score}</Text>
        <Text style={styles.playerScoreLabel}>points</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={110}
      />
    </View>
  );
});
