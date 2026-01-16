import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

const cx = (...a: (string | undefined | null | false)[]) => a.filter(Boolean).join(' ');

export function Screen({ children, className, ...rest }: ViewProps & { className?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        {...rest}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.lg,
        }}
        className={cx('flex-1 bg-obsidian px-5 py-6', className)}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

export default Screen;
