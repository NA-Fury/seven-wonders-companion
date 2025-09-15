import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = PressableProps & { children: React.ReactNode };

export function HapticTab({ onPress, children, testID = 'haptic-tab', ...rest }: Props) {
  const handlePress: Props['onPress'] = (e) => {
    // ignore errors in tests/dev
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      testID={testID}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
