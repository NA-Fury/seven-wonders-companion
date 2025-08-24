// components/ui/enhanced.tsx
// Fixed and enhanced for React Native + TypeScript - REMOVED ALL GAP PROPERTIES

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Trash2, User, Trophy, Star, Clock, Calendar } from 'lucide-react-native';

// ---------- Animated Button ----------

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  style,
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) onPress();
  };

  const getButtonStyle = (): StyleProp<ViewStyle> => ([
    styles.button,
    // size
    size === 'small'
      ? styles.buttonSmall
      : size === 'large'
      ? styles.buttonLarge
      : styles.buttonMedium,
    // variant
    variant === 'primary'
      ? styles.buttonPrimary
      : variant === 'secondary'
      ? styles.buttonSecondary
      : variant === 'ghost'
      ? styles.buttonGhost
      : styles.buttonDanger,
    // state
    (disabled || loading) ? styles.buttonDisabled : null,
  ] as const);

  const getTextStyle = (): StyleProp<TextStyle> => ([
    styles.buttonText,
    // size
    size === 'small' ? styles.buttonTextSmall : null,
    size === 'large' ? styles.buttonTextLarge : null,
    // variant
    variant === 'ghost'
      ? styles.buttonTextGhost
      : variant === 'danger'
      ? styles.buttonTextDanger
      : styles.buttonTextPrimary, // primary/secondary -> white
    // state
    (disabled || loading) ? styles.buttonTextDisabled : null,
  ] as const);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={getButtonStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' ? '#C4A24C' : '#FFFFFF'}
          />
        ) : (
          <View style={styles.buttonContent}>
            {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
            <Text style={getTextStyle()}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ---------- Player List Item ----------

interface PlayerListItemProps {
  player: { id: string; name: string };
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  position?: number;
  showStats?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PlayerListItem({
  player,
  onRemove,
  onEdit,
  position,
  showStats = false,
  style,
}: PlayerListItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    if (!onRemove) return;

    Alert.alert('Remove Player', `Remove ${player.name} from the game?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setIsRemoving(true);
          setTimeout(() => {
            onRemove(player.id);
            setIsRemoving(false);
          }, 300);
        },
      },
    ]);
  };

  return (
    <View style={[styles.playerItem, style]}>
      <View style={styles.playerContent}>
        {typeof position === 'number' ? (
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>{position}</Text>
          </View>
        ) : null}

        <View style={styles.playerIcon}>
          <User size={20} color="#C4A24C" />
        </View>

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          {showStats ? (
            <Text style={styles.playerStats}>Games: 0 • Wins: 0 • Avg Score: 0</Text>
          ) : null}
        </View>

        <View style={styles.playerActions}>
          {onEdit ? (
            <Pressable style={[styles.actionButton, styles.actionButtonSpacing]} onPress={() => onEdit(player.id)}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
          ) : null}

          {onRemove ? (
            <Pressable
              style={[styles.actionButton, styles.removeButton, styles.actionButtonSpacing]}
              onPress={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={16} color="#EF4444" />}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ---------- Score Category Card ----------

interface ScoreCategoryCardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  maxScore?: number;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ScoreCategoryCard({
  title,
  icon,
  score,
  maxScore,
  trend,
  subtitle,
  onPress,
  style,
}: ScoreCategoryCardProps) {
  const getScoreColor = () => {
    if (!maxScore || maxScore <= 0) return '#C4A24C';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#EF4444';
    return '#6B7280';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Pressable style={[styles.scoreCard, style]} onPress={onPress} disabled={!onPress}>
      <View style={styles.scoreCardHeader}>
        <View style={styles.scoreCardIcon}>{icon}</View>
        <View style={styles.scoreCardContent}>
          <Text style={styles.scoreCardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.scoreCardSubtitle}>{subtitle}</Text> : null}
        </View>
        {trend ? (
          <View style={styles.trendIndicator}>
            <Text style={[styles.trendText, { color: getScoreColor() }]}>{getTrendIcon()}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.scoreCardFooter}>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{score}</Text>
        {typeof maxScore === 'number' ? <Text style={styles.maxScore}>/ {maxScore}</Text> : null}
      </View>
    </Pressable>
  );
}

// ---------- Game Stats Card ----------

interface GameStatsCardProps {
  gamesPlayed: number;
  wins: number;
  averageScore: number;
  lastPlayed?: Date;
  favoriteStrategy?: string;
  style?: StyleProp<ViewStyle>;
}

export function GameStatsCard({
  gamesPlayed,
  wins,
  averageScore,
  lastPlayed,
  favoriteStrategy,
  style,
}: GameStatsCardProps) {
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <View style={[styles.statsCard, style]}>
      <View style={styles.statsHeader}>
        <Trophy size={20} color="#C4A24C" />
        <Text style={styles.statsTitle}>Player Statistics</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(averageScore)}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      {lastPlayed || favoriteStrategy ? (
        <View style={styles.statsFooter}>
          {lastPlayed ? (
            <View style={styles.statDetail}>
              <Clock size={14} color="#9CA3AF" />
              <Text style={styles.statDetailText}>Last played {formatDate(lastPlayed)}</Text>
            </View>
          ) : null}

          {favoriteStrategy ? (
            <View style={[styles.statDetail, { marginTop: 8 }]}>
              <Star size={14} color="#9CA3AF" />
              <Text style={styles.statDetailText}>Strategy: {favoriteStrategy}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ---------- Loading State ----------

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({ message = 'Loading...', size = 'medium', style }: LoadingStateProps) {
  const indicatorSize: 'small' | 'large' | number = size === 'small' ? 'small' : size === 'large' ? 'large' : 'large';

  return (
    <View style={[styles.loadingContainer, style]}>
      <ActivityIndicator size={indicatorSize} color="#C4A24C" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ---------- Empty State ----------

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ title, subtitle, action, icon, style }: EmptyStateProps) {
  return (
    <View style={[styles.emptyContainer, style]}>
      {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}

      <Text style={styles.emptyTitle}>{title}</Text>

      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}

      {action ? (
        <AnimatedButton title={action.title} onPress={action.onPress} variant="primary" style={styles.emptyAction} />
      ) : null}
    </View>
  );
}

// ---------- Game History Item ----------

interface GameHistoryItemProps {
  game: {
    id: string;
    date: Date;
    players: string[];
    winner?: string;
    myScore?: number;
    expansions: string[];
    duration?: number;
  };
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GameHistoryItem({ game, onPress, style }: GameHistoryItemProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes && minutes !== 0) return 'Unknown';
    const hours = Math.floor((minutes || 0) / 60);
    const mins = (minutes || 0) % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <Pressable style={[styles.historyItem, style]} onPress={onPress} disabled={!onPress}>
      <View style={styles.historyHeader}>
        <View style={styles.historyDate}>
          <Calendar size={16} color="#C4A24C" />
          <Text style={styles.historyDateText}>{formatDate(game.date)}</Text>
        </View>

        {typeof game.duration === 'number' ? (
          <View style={styles.historyDuration}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.historyDurationText}>{formatDuration(game.duration)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.historyContent}>
        <Text style={styles.historyPlayers}>
          {game.players.length} players: {game.players.slice(0, 3).join(', ')}
          {game.players.length > 3 ? ` +${game.players.length - 3} more` : ''}
        </Text>

        {game.expansions.length > 0 ? (
          <Text style={styles.historyExpansions}>{game.expansions.join(' + ')}</Text>
        ) : null}
      </View>

      <View style={styles.historyFooter}>
        {game.winner ? <Text style={styles.historyWinner}>Winner: {game.winner}</Text> : <View />}

        {typeof game.myScore === 'number' ? <Text style={styles.historyScore}>Your score: {game.myScore}</Text> : null}
      </View>
    </Pressable>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  // Button
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  buttonMedium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: '#C4A24C',
  },
  buttonSecondary: {
    backgroundColor: '#135C66',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C4A24C',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextLarge: {
    fontSize: 18,
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextGhost: {
    color: '#C4A24C',
  },
  buttonTextDanger: {
    color: 'white',
  },
  buttonTextDisabled: {
    color: '#6B7280',
  },

  // Player item
  playerItem: {
    backgroundColor: 'rgba(243, 231, 211, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
    marginBottom: 8,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  positionText: {
    color: '#1C1A1A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 162, 76, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#F3E7D3',
    fontSize: 16,
    fontWeight: '600',
  },
  playerStats: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  playerActions: {
    flexDirection: 'row',
    // Replaced unsupported `gap` with per-button spacing:
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(243, 231, 211, 0.1)',
  },
  actionButtonSpacing: {
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionButtonText: {
    color: '#C4A24C',
    fontSize: 12,
    fontWeight: '600',
  },

  // Score card
  scoreCard: {
    backgroundColor: 'rgba(243, 231, 211, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
    marginBottom: 12,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCardIcon: {
    marginRight: 12,
  },
  scoreCardContent: {
    flex: 1,
  },
  scoreCardTitle: {
    color: '#F3E7D3',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreCardSubtitle: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  trendIndicator: {
    padding: 4,
  },
  trendText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreCardFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  maxScore: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 16,
    marginLeft: 4,
  },

  // Stats card
  statsCard: {
    backgroundColor: 'rgba(243, 231, 211, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    color: '#F3E7D3',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#C4A24C',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  statsFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 231, 211, 0.1)',
    paddingTop: 12,
  },
  statDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDetailText: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 12,
    marginLeft: 6,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 14,
    marginTop: 12,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F3E7D3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAction: {
    minWidth: 160,
  },

  // History
  historyItem: {
    backgroundColor: 'rgba(243, 231, 211, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDateText: {
    color: '#C4A24C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  historyDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDurationText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 4,
  },
  historyContent: {
    marginBottom: 8,
  },
  historyPlayers: {
    color: '#F3E7D3',
    fontSize: 14,
    marginBottom: 4,
  },
  historyExpansions: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 12,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyWinner: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  historyScore: {
    color: '#C4A24C',
    fontSize: 12,
    fontWeight: '600',
  },
});