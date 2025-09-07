import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

// Mock the color scheme hook so tests are deterministic
jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

describe('Theming', () => {
  it('ThemedText uses theme text color by default (light)', () => {
    const { getByText } = render(<ThemedText>hello</ThemedText>);
    expect(getByText('hello')).toHaveStyle({ color: Colors.light.text });
  });

  it('ThemedText prefers explicit darkColor when dark mode', () => {
    jest.resetModules();
    jest.isolateModules(() => {
      jest.doMock('../hooks/useColorScheme', () => ({ useColorScheme: () => 'dark' }));
      const { ThemedText: DarkThemedText } = require('../components/ThemedText');
      const { getByText } = render(<DarkThemedText darkColor="#ff00ff">x</DarkThemedText>);
      expect(getByText('x')).toHaveStyle({ color: '#ff00ff' });
    });
  });

  it('ThemedView sets backgroundColor from theme', () => {
    const { getByTestId } = render(
      <ThemedView testID="wrap"><Text>child</Text></ThemedView>
    );
    expect(getByTestId('wrap')).toHaveStyle({ backgroundColor: Colors.light.background });
  });
});
