// components/ui/index.tsx - Fixed with proper safe areas
import React from 'react';
import {
  Platform,
  Pressable,
  Text,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cx = (...a: (string | undefined | null | false)[]) => a.filter(Boolean).join(' ');

export function Screen({ children, className, ...rest }: ViewProps & { className?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View 
        {...rest} 
        style={{
          flex: 1,
          backgroundColor: '#1C1A1A',
          paddingHorizontal: 20,
          paddingTop: Platform.OS === 'ios' ? 10 : 20, // Extra space for Android status bar
        }}
        className={cx('flex-1 bg-obsidian px-5 py-6', className)}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

export function H1({ children, className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text 
      {...rest} 
      style={{
        fontSize: 28,
        fontWeight: '800',
        color: '#C4A24C',
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
        color: '#F3E7D3',
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
        color: 'rgba(243, 231, 211, 0.8)',
        lineHeight: 24,
        fontSize: 16,
      }}
      className={cx('text-parchment/80 leading-6', className)}
    >
      {children}
    </Text>
  );
}

export function Card({ children, className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View 
      {...rest} 
      style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
        marginBottom: 12,
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
    ...rest
  }: PressableProps & {
    title: string;
    variant?: 'primary' | 'ghost';
    className?: string;
    textClassName?: string;
    disabled?: boolean;
  },
) {
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
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: variant === 'primary' 
          ? (disabled ? 'rgba(196, 162, 76, 0.5)' : '#C4A24C') 
          : 'transparent',
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: variant === 'ghost' 
          ? (disabled ? 'rgba(196, 162, 76, 0.2)' : 'rgba(196, 162, 76, 0.4)') 
          : 'transparent',
        opacity: pressed ? 0.8 : 1,
        minHeight: 48, // Ensure good touch target
      })}
      className={cx('rounded-2xl px-5 py-3 items-center', base, className)}
    >
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: variant === 'primary' 
          ? (disabled ? 'rgba(28, 26, 26, 0.5)' : '#1C1A1A') 
          : (disabled ? 'rgba(196, 162, 76, 0.5)' : '#C4A24C'),
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
  }: {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    className?: string;
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
      <Text style={{
        color: '#F3E7D3',
        fontSize: 16,
      }} className="text-parchment text-base">
        {label}
      </Text>
      <View style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        paddingHorizontal: 4,
        justifyContent: 'center',
        backgroundColor: value ? '#C4A24C' : 'rgba(243, 231, 211, 0.3)',
        alignItems: value ? 'flex-end' : 'flex-start',
      }} className={cx('w-12 h-7 rounded-full px-1 justify-center', value ? 'bg-aurum' : 'bg-parchment/30', knobJustify)}>
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#1C1A1A',
        }} className="w-5 h-5 rounded-full bg-obsidian" />
      </View>
    </Pressable>
  );
}

// Re-export enhanced components
export * from './enhanced';
export * from './wonder-assignment';
export * from './wonder-card';
