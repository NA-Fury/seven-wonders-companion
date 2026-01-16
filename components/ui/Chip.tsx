import React from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  minWidth?: number;
  style?: ViewStyle;
};

export function Chip({ label, active = false, onPress, minWidth = 84, style }: ChipProps) {
  const backgroundColor = active ? theme.colors.accentSoft : 'rgba(243, 231, 211, 0.08)';
  const borderColor = active ? theme.colors.borderStrong : theme.colors.border;
  const textColor = active ? theme.colors.accent : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        minWidth,
        height: 34,
        paddingHorizontal: theme.spacing.md,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        backgroundColor,
        borderWidth: 1,
        borderColor,
        opacity: pressed ? 0.85 : 1,
        ...style,
      })}
    >
      <Text style={{ color: textColor, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
