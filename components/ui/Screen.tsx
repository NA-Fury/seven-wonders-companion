import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
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
          paddingTop: Platform.OS === 'ios' ? 10 : 20,
        }}
        className={cx('flex-1 bg-obsidian px-5 py-6', className)}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

export default Screen;

