// components/ui/index.tsx - Fixed with proper safe areas
import React from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { theme } from '@/constants/theme';

const cx = (...a: (string | undefined | null | false)[]) => a.filter(Boolean).join(' ');

export function H1({ children, className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text 
      {...rest} 
      style={{
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.accent,
        fontFamily: theme.fonts.heading,
        letterSpacing: 0.4,
        marginBottom: 8,
        marginTop: 8, // Extra space from top
      }}
      className={cx('text-3xl font-extrabold text-aurum mb-2 font-wonders', className)}
    >
      {children}
    </Text>
  );
}

export function H2({ children, className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text 
      {...rest} 
      style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.heading,
        marginBottom: 4,
      }}
      className={cx('text-xl font-bold text-parchment mb-1', className)}
    >
      {children}
    </Text>
  );
}

export function P({ children, className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text 
      {...rest} 
      style={{
        color: theme.colors.textSecondary,
        lineHeight: 24,
        fontSize: 16,
      }}
      className={cx('text-parchment/80 leading-6', className)}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  className,
  variant = 'default',
  ...rest
}: ViewProps & { className?: string; variant?: 'default' | 'muted' | 'accent' }) {
  const cardStyle =
    variant === 'accent'
      ? { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.borderStrong }
      : variant === 'muted'
        ? { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
        : { backgroundColor: theme.colors.cardTeal, borderColor: 'rgba(243, 231, 211, 0.1)' };

  return (
    <View 
      {...rest} 
      style={{
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        marginBottom: 12,
        ...cardStyle,
      }}
      className={cx('bg-tealnavy/20 rounded-2xl p-4 border border-parchment/10 mb-3', className)}
    >
      {children}
    </View>
  );
}

export function Button(
  {
    title,
    variant = 'primary',
    className,
    textClassName,
    disabled = false,
    size = 'md',
    ...rest
  }: PressableProps & {
    title: string;
    variant?: 'primary' | 'ghost';
    className?: string;
    textClassName?: string;
    disabled?: boolean;
    size?: 'md' | 'sm';
  },
) {
  const isSmall = size === 'sm';
  const paddingHorizontal = isSmall ? theme.spacing.md : theme.spacing.lg;
  const paddingVertical = isSmall ? theme.spacing.sm : theme.spacing.md;
  const minHeight = isSmall ? 40 : 48;
  const fontSize = isSmall ? 14 : 16;

  const base = variant === 'primary' 
    ? (disabled ? 'bg-aurum/50' : 'bg-aurum') 
    : (disabled ? 'bg-transparent border border-aurum/20' : 'bg-transparent border border-aurum/40');
  const text = variant === 'primary' 
    ? (disabled ? 'text-obsidian/50' : 'text-obsidian') 
    : (disabled ? 'text-aurum/50' : 'text-aurum');
  
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: theme.radius.lg,
        paddingHorizontal,
        paddingVertical,
        alignItems: 'center',
        backgroundColor: variant === 'primary' 
          ? (disabled ? 'rgba(196, 162, 76, 0.5)' : theme.colors.accent) 
          : 'transparent',
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: variant === 'ghost' 
          ? (disabled ? 'rgba(196, 162, 76, 0.2)' : 'rgba(196, 162, 76, 0.4)') 
          : 'transparent',
        opacity: pressed ? 0.8 : 1,
        minHeight, // Ensure good touch target
      })}
      className={cx('rounded-2xl px-5 py-3 items-center', base, className)}
    >
      <Text style={{
        fontSize,
        fontWeight: 'bold',
        color: variant === 'primary' 
          ? (disabled ? 'rgba(28, 26, 26, 0.5)' : '#1C1A1A') 
          : (disabled ? 'rgba(196, 162, 76, 0.5)' : theme.colors.accent),
      }} className={cx('text-lg font-bold', text, textClassName)}>
        {title}
      </Text>
    </Pressable>
  );
}

export function ToggleRow(
  {
    label,
    value,
    onToggle,
    className,
    prefix,
  }: {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    className?: string;
    prefix?: React.ReactNode;
  },
) {
  const knobJustify = value ? 'items-end' : 'items-start';
  return (
    <Pressable 
      onPress={() => onToggle(!value)} 
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        minHeight: 48, // Good touch target
      }}
      className={cx('flex-row items-center justify-between py-3', className)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
        {prefix ? (
          <View style={{ marginRight: 8 }}>{prefix}</View>
        ) : null}
        <Text style={{
          color: theme.colors.textPrimary,
          fontSize: 16,
        }} className="text-parchment text-base">
          {label}
        </Text>
      </View>
      <View style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        paddingHorizontal: 4,
        justifyContent: 'center',
        backgroundColor: value ? theme.colors.accent : 'rgba(243, 231, 211, 0.3)',
        alignItems: value ? 'flex-end' : 'flex-start',
      }} className={cx('w-12 h-7 rounded-full px-1 justify-center', value ? 'bg-aurum' : 'bg-parchment/30', knobJustify)}>
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: theme.colors.background,
        }} className="w-5 h-5 rounded-full bg-obsidian" />
      </View>
    </Pressable>
  );
}

// Re-export enhanced components
export * from './enhanced';
export * from './wonder-assignment';
export * from './wonder-card';
export * from './setup-screen';
export * from './AppLogo';
export * from './Screen';
export * from './Field';
export * from './Chip';
