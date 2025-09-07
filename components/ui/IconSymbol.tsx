// Fallback for using MaterialIcons on Android and web.

import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type StyleProp, type TextStyle, OpaqueColorValue } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Added app-specific symbols
  'crown.fill': 'emoji-events',
  'building.2.fill': 'apartment',
  'sailboat.fill': 'sailing',
  'building.columns.fill': 'account-balance',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

type Props = {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  // optional, accepted for API compatibility; not used by MaterialIcons
  weight?: 'thin' | 'light' | 'regular' | 'medium' | 'bold' | 'heavy' | 'black';
};

export function IconSymbol({ name, size = 24, color, style }: Props) {
  return (
    <MaterialIcons
      name={MAPPING[name] as React.ComponentProps<typeof MaterialIcons>['name']}
      size={size}
      color={color as any}
      style={style as any}
    />
  );
}

export default IconSymbol;
