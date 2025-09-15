// __tests__/haptic-tab.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

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

    const { getByRole } = render(
      <HapticTab
        onPress={onPress}
        accessibilityRole="button"             // ensures a11y role for the query
        accessibilityState={{ selected: false }}
        style={{}}
      >
        <Text>Tab</Text>
      </HapticTab>
    );

    const button = getByRole('button');
    fireEvent.press(button);

    await waitFor(() => expect(Haptics.impactAsync).toHaveBeenCalled());
    expect(onPress).toHaveBeenCalled();
  });
});
