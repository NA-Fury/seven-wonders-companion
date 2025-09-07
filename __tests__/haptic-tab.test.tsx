import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

import { HapticTab } from '../components/HapticTab';
import * as Haptics from 'expo-haptics';

describe('HapticTab', () => {
  it('triggers haptic feedback and forwards onPress', async () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <HapticTab onPress={onPress} style={{}} accessibilityState={{ selected: false }}>
        <Text>Tab</Text>
      </HapticTab>
    );

    const pressable = UNSAFE_getByType(Pressable);
    fireEvent.press(pressable);

    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
  });
});

