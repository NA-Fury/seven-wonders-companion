import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export function ThemedView(props: ViewProps & { lightColor?: string; darkColor?: string }) {
  const backgroundColor = useThemeColor({ light: props.lightColor, dark: props.darkColor }, 'background');
  const { style, ...rest } = props;
  return <View {...rest} style={[{ backgroundColor }, style]} />;
}
export default ThemedView;
