import React from 'react';
import { render } from '@testing-library/react-native';
import { ScrollView, Text } from 'react-native';

// Mock theme and bottom tab padding
jest.mock('../hooks/useColorScheme', () => ({ useColorScheme: () => 'light' }));
jest.mock('../components/ui/TabBarBackground', () => ({
  __esModule: true,
  default: () => null,
  useBottomTabOverflow: () => 42,
}));

import ParallaxScrollView from '../components/ParallaxScrollView';

describe('ParallaxScrollView', () => {
  it('applies bottom padding and header background color', () => {
    const { UNSAFE_getByType, getByText } = render(
      <ParallaxScrollView headerBackgroundColor={{ light: '#aaa', dark: '#bbb' }}>
        <Text>Body</Text>
      </ParallaxScrollView>
    );
    getByText('Body');

    const scroll = UNSAFE_getByType(ScrollView);
    // contentContainerStyle is an object on props
    const ccs = scroll.props.contentContainerStyle;
    expect(ccs).toEqual(expect.objectContaining({ paddingBottom: 42, backgroundColor: '#aaa' }));
  });
});

